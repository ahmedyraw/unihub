package com.example.unihub.service;

import com.example.unihub.dto.request.CreateEventRequest;
import com.example.unihub.enums.EventStatus;
import com.example.unihub.enums.NotificationType;
import com.example.unihub.enums.ParticipantRole;
import com.example.unihub.exception.ResourceNotFoundException;
import com.example.unihub.model.*;
import com.example.unihub.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class EventService {

    private final EventRepository eventRepository;
    private final EventParticipantRepository participantRepository;
    private final EventReportRepository eventReportRepository;
    private final UserRepository userRepository;
    private final UniversityRepository universityRepository;
    private final NotificationRepository notificationRepository;
    private final GamificationService gamificationService;

    /**
     * Create a new event proposal
     */
    @Transactional
    public Event createEvent(CreateEventRequest request, User creator) {
        log.info("Creating new event: {} by user {}", request.getTitle(), creator.getUserId());

        Event event = new Event();
        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setLocation(request.getLocation());
        event.setStartDate(request.getStartDate());
        event.setEndDate(request.getEndDate());
        event.setType(request.getType());
        event.setStatus(EventStatus.PENDING);
        event.setCreator(creator);

        // IMPORTANT: Use universityId from request (dropdown selection), NOT creator's university
        // If universityId is provided, use it; otherwise default to creator's university
        if (request.getUniversityId() != null) {
            University university = universityRepository.findById(request.getUniversityId())
                    .orElseThrow(() -> new ResourceNotFoundException("University", "id", request.getUniversityId()));
            event.setUniversity(university);
            log.info("Event university set to selected universityId: {}", request.getUniversityId());
        } else {
            event.setUniversity(creator.getUniversity());
            log.info("Event university defaulted to creator's university: {}", creator.getUniversity().getUniversityId());
        }

        // Set capacity limits (null means unlimited)
        event.setMaxOrganizers(request.getMaxOrganizers());
        event.setMaxVolunteers(request.getMaxVolunteers());
        event.setMaxAttendees(request.getMaxAttendees());

        // Set custom points or use defaults
        event.setOrganizerPoints(request.getOrganizerPoints() != null ? request.getOrganizerPoints() : 50);
        event.setVolunteerPoints(request.getVolunteerPoints() != null ? request.getVolunteerPoints() : 20);
        event.setAttendeePoints(request.getAttendeePoints() != null ? request.getAttendeePoints() : 10);

        Event savedEvent = eventRepository.save(event);

        // If creator wants to participate, add them automatically
        if (Boolean.TRUE.equals(request.getCreatorParticipates()) && request.getCreatorRole() != null) {
            try {
                ParticipantRole role = ParticipantRole.valueOf(request.getCreatorRole());
                EventParticipant participant = new EventParticipant();
                participant.setEvent(savedEvent);
                participant.setUser(creator);
                participant.setRole(role);
                participant.setPointsAwarded(0); // Creator doesn't get points initially, only after approval
                participantRepository.save(participant);
                log.info("Creator {} added as {} to their own event", creator.getUserId(), role);
            } catch (IllegalArgumentException e) {
                log.warn("Invalid creator role: {}", request.getCreatorRole());
            }
        }

        return savedEvent;
    }

    /**
     * Update an existing event (Creator can edit PENDING or APPROVED events)
     */
    @Transactional
    public Event updateEvent(Long eventId, CreateEventRequest request, User currentUser) {
        log.info("Updating event {} by user {}", eventId, currentUser.getUserId());

        Event event = getEventById(eventId);

        // Check if user is the creator
        if (!event.getCreator().getUserId().equals(currentUser.getUserId())) {
            throw new IllegalStateException("You do not have permission to edit this event");
        }

        // Allow editing PENDING or APPROVED events (APPROVED will reset to PENDING)
        if (event.getStatus() != EventStatus.PENDING && event.getStatus() != EventStatus.APPROVED) {
            throw new IllegalStateException("Only pending or approved events can be edited");
        }

        // If event was APPROVED, reset to PENDING (requires re-approval after edit)
        boolean wasApproved = event.getStatus() == EventStatus.APPROVED;
        if (wasApproved) {
            event.setStatus(EventStatus.PENDING);
            log.info("Event {} status reset to PENDING due to edit (was APPROVED)", eventId);
        }

        // Update event fields
        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setLocation(request.getLocation());
        event.setStartDate(request.getStartDate());
        event.setEndDate(request.getEndDate());
        event.setType(request.getType());

        // Update capacity limits
        event.setMaxOrganizers(request.getMaxOrganizers());
        event.setMaxVolunteers(request.getMaxVolunteers());
        event.setMaxAttendees(request.getMaxAttendees());

        // Update points
        event.setOrganizerPoints(request.getOrganizerPoints() != null ? request.getOrganizerPoints() : 50);
        event.setVolunteerPoints(request.getVolunteerPoints() != null ? request.getVolunteerPoints() : 20);
        event.setAttendeePoints(request.getAttendeePoints() != null ? request.getAttendeePoints() : 10);

        Event updatedEvent = eventRepository.save(event);

        // Notify creator if event was reset to pending
        if (wasApproved) {
            Notification notification = new Notification();
            notification.setUser(currentUser);
            notification.setMessage("Your event '" + event.getTitle() + "' has been updated and requires re-approval");
            notification.setType(NotificationType.EVENT_UPDATE);
            notification.setLinkUrl("/events/" + eventId);
            notification.setIsRead(false);
            notificationRepository.save(notification);
        }

        log.info("Event {} updated successfully", eventId);

        return updatedEvent;
    }

    /**
     * Get all events with optional filters (newest first)
     */
    public List<Event> getAllEvents(Long universityId, EventStatus status) {
        List<Event> events;
        if (universityId != null && status != null) {
            events = eventRepository.findByUniversityUniversityIdAndStatusOrderByCreatedAtDesc(universityId, status);
        } else if (universityId != null) {
            events = eventRepository.findByUniversityUniversityIdOrderByCreatedAtDesc(universityId);
        } else if (status != null) {
            events = eventRepository.findByStatusOrderByCreatedAtDesc(status);
        } else {
            events = eventRepository.findAllByOrderByCreatedAtDesc();
        }

        applyReportCounts(events);
        return events;
    }

    /**
     * Get event by ID
     */
    public Event getEventById(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", eventId));
        applyReportCount(event);
        return event;
    }

    /**
     * Join an event as a participant
     */
    @Transactional
    public void joinEvent(Long eventId, Long userId, ParticipantRole role) {
        log.info("User {} requesting to join event {} as {}", userId, eventId, role);

        Event event = getEventById(eventId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Check if event is approved
        if (event.getStatus() != EventStatus.APPROVED) {
            throw new IllegalStateException("Cannot join an event that is not approved");
        }

        // Check if user already joined
        if (participantRepository.existsByEventEventIdAndUserUserId(eventId, userId)) {
            throw new IllegalStateException("You have already joined this event");
        }

        // Check capacity limits
        long currentCount = participantRepository.countByEventEventIdAndRole(eventId, role);
        Integer maxCapacity = switch (role) {
            case ORGANIZER -> event.getMaxOrganizers();
            case VOLUNTEER -> event.getMaxVolunteers();
            case ATTENDEE -> event.getMaxAttendees();
        };

        if (maxCapacity != null && currentCount >= maxCapacity) {
            throw new IllegalStateException("No more slots available for " + role + " role");
        }

        // Get points from event configuration
        int points = switch (role) {
            case ORGANIZER -> event.getOrganizerPoints() != null ? event.getOrganizerPoints() : 50;
            case VOLUNTEER -> event.getVolunteerPoints() != null ? event.getVolunteerPoints() : 20;
            case ATTENDEE -> event.getAttendeePoints() != null ? event.getAttendeePoints() : 10;
        };

        // Create participant record
        EventParticipant participant = new EventParticipant();
        participant.setEvent(event);
        participant.setUser(user);
        participant.setRole(role);
        participant.setPointsAwarded(points);
        participantRepository.save(participant);

        // Award EVENT_PARTICIPATION points
        gamificationService.awardPoints(
                user,
                points,
                "EVENT_PARTICIPATION",
                eventId,
                "Joined event '" + event.getTitle() + "' as " + role
        );

        log.info("User {} successfully joined event {} as {} and earned {} points", userId, eventId, role, points);
    }

    /**
     * Leave an event (with penalty)
     */
    @Transactional
    public void leaveEvent(Long eventId, Long userId) {
        log.info("User {} leaving event {}", userId, eventId);

        Event event = getEventById(eventId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        EventParticipant participant = participantRepository
                .findByEventEventIdAndUserUserId(eventId, userId)
                .orElseThrow(() -> new IllegalStateException("You are not participating in this event"));

        // Apply penalty: -2x the points awarded
        int penalty = participant.getPointsAwarded() * 2;
        participantRepository.delete(participant);

        // Deduct points through gamification service
        gamificationService.deductPoints(
                user,
                penalty,
                "EVENT_LEAVE",
                eventId,
                "Left event '" + event.getTitle() + "' (penalty applied)"
        );

        // Notify user
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setMessage("You left event '" + event.getTitle() + "'. Penalty: -" + penalty + " points");
        notification.setType(NotificationType.POINTS_UPDATE);
        notification.setIsRead(false);
        notificationRepository.save(notification);

        log.info("User {} left event {} with penalty of {} points", userId, eventId, penalty);
    }

    /**
     * Approve an event (Supervisor/Admin only)
     * Awards points to creator for event creation AND updates participant points if creator joined
     */
    @Transactional
    public void approveEvent(Long eventId) {
        log.info("Approving event {}", eventId);

        Event event = getEventById(eventId);

        if (event.getStatus() == EventStatus.APPROVED) {
            throw new IllegalStateException("Event is already approved");
        }

        event.setStatus(EventStatus.APPROVED);
        eventRepository.save(event);

        User creator = event.getCreator();

        // Award EVENT_CREATION points (separate from participation)
        int creationPoints = creator.getRole() == com.example.unihub.enums.UserRole.STUDENT ? 30 : 50;
        gamificationService.awardPoints(
                creator,
                creationPoints,
                "EVENT_CREATION",
                eventId,
                "Event approved: " + event.getTitle()
        );

        // If creator is also a participant, award participation points
        participantRepository.findByEventEventIdAndUserUserId(eventId, creator.getUserId())
                .ifPresent(participant -> {
                    if (participant.getPointsAwarded() == 0) {
                        // Calculate participation points based on role
                        int participationPoints = switch (participant.getRole()) {
                            case ORGANIZER -> event.getOrganizerPoints() != null ? event.getOrganizerPoints() : 50;
                            case VOLUNTEER -> event.getVolunteerPoints() != null ? event.getVolunteerPoints() : 20;
                            case ATTENDEE -> event.getAttendeePoints() != null ? event.getAttendeePoints() : 10;
                        };

                        participant.setPointsAwarded(participationPoints);
                        participantRepository.save(participant);

                        gamificationService.awardPoints(
                                creator,
                                participationPoints,
                                "EVENT_PARTICIPATION",
                                eventId,
                                "Joined event '" + event.getTitle() + "' as " + participant.getRole()
                        );

                        log.info("Creator {} awarded {} participation points as {}",
                                creator.getUserId(), participationPoints, participant.getRole());
                    }
                });

        // Notify creator
        Notification notification = new Notification();
        notification.setUser(creator);
        notification.setMessage("Your event '" + event.getTitle() + "' has been approved!");
        notification.setType(NotificationType.EVENT_UPDATE);
        notification.setLinkUrl("/events/" + eventId);
        notification.setIsRead(false);
        notificationRepository.save(notification);

        // Send WebSocket update
        gamificationService.sendDashboardUpdate(creator.getUserId());

        log.info("Event {} approved successfully, {} creation points awarded to creator", eventId, creationPoints);
    }

    /**
     * Reject an event (Supervisor/Admin only)
     */
    @Transactional
    public void rejectEvent(Long eventId, String reason) {
        log.info("Rejecting event {}", eventId);

        Event event = getEventById(eventId);
        event.setStatus(EventStatus.CANCELLED);
        eventRepository.save(event);

        // Notify creator
        Notification notification = new Notification();
        notification.setUser(event.getCreator());
        notification.setMessage("Your event '" + event.getTitle() + "' was rejected. Reason: " + reason);
        notification.setType(NotificationType.EVENT_UPDATE);
        notification.setLinkUrl("/events/" + eventId);
        notification.setIsRead(false);
        notificationRepository.save(notification);

        gamificationService.sendDashboardUpdate(event.getCreator().getUserId());
    }

    /**
     * Cancel an event (Supervisor/Admin only)
     */
    @Transactional
    public void cancelEvent(Long eventId, String reason) {
        log.info("Cancelling event {}", eventId);

        Event event = getEventById(eventId);
        event.setStatus(EventStatus.CANCELLED);
        eventRepository.save(event);

        // Notify all participants
        List<EventParticipant> participants = participantRepository.findByEventEventId(eventId);
        for (EventParticipant participant : participants) {
            Notification notification = new Notification();
            notification.setUser(participant.getUser());
            notification.setMessage("Event '" + event.getTitle() + "' has been cancelled. Reason: " + reason);
            notification.setType(NotificationType.EVENT_UPDATE);
            notification.setLinkUrl("/events/" + eventId);
            notification.setIsRead(false);
            notificationRepository.save(notification);

            gamificationService.sendDashboardUpdate(participant.getUser().getUserId());
        }

        log.info("Event {} cancelled and {} participants notified", eventId, participants.size());
    }

    /**
     * Get events created by a user (newest first)
     */
    public List<Event> getEventsByCreator(Long userId) {
        List<Event> events = eventRepository.findByCreatorUserIdOrderByCreatedAtDesc(userId);
        applyReportCounts(events);
        return events;
    }

    /**
     * Get events a user is participating in
     */
    public List<EventParticipant> getUserParticipations(Long userId) {
        return participantRepository.findByUserUserId(userId);
    }

    /**
     * Get participants for an event
     */
    public List<EventParticipant> getEventParticipants(Long eventId) {
        return participantRepository.findByEventEventId(eventId);
    }

    private void applyReportCounts(List<Event> events) {
        if (events == null) {
            return;
        }
        for (Event event : events) {
            applyReportCount(event);
        }
    }

    private void applyReportCount(Event event) {
        if (event == null || event.getEventId() == null) {
            return;
        }
        long count = eventReportRepository.countByEventEventId(event.getEventId());
        event.setReportCount(count);
    }

    /**
     * Delete an event (Creator can delete PENDING/REJECTED, Admin can delete any)
     */
    @Transactional
    public void deleteEvent(Long eventId, User currentUser) {
        log.info("Attempting to delete event {} by user {}", eventId, currentUser.getUserId());

        Event event = getEventById(eventId);

        // Check permissions
        boolean isCreator = event.getCreator().getUserId().equals(currentUser.getUserId());
        boolean isAdmin = currentUser.getRole().name().equals("ADMIN");

        if (!isCreator && !isAdmin) {
            throw new IllegalStateException("You do not have permission to delete this event");
        }

        // Creators can only delete PENDING or REJECTED events
        if (isCreator && !isAdmin) {
            if (event.getStatus() == EventStatus.APPROVED) {
                throw new IllegalStateException("Cannot delete an approved event. Contact an admin to cancel it.");
            }
        }

        // Delete associated participants first
        List<EventParticipant> participants = participantRepository.findByEventEventId(eventId);
        if (!participants.isEmpty()) {
            participantRepository.deleteAll(participants);
            log.info("Deleted {} participants for event {}", participants.size(), eventId);
        }

        // Delete the event
        eventRepository.delete(event);
        log.info("Event {} deleted successfully by user {}", eventId, currentUser.getUserId());
    }
}
