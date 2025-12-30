package com.example.unihub.service;

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
public class EventRequestService {

    private final EventRequestRepository eventRequestRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;
    private final EventParticipantRepository participantRepository;
    private final GamificationService gamificationService;

    @Transactional
    public EventRequest createRequest(Long eventId, Long userId, ParticipantRole role) {
        log.info("User {} requesting to join event {} as {}", userId, eventId, role);

        Event event = eventRepository.findById(eventId)
            .orElseThrow(() -> new ResourceNotFoundException("Event", "id", eventId));
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Check if already requested
        if (eventRequestRepository.existsByEventEventIdAndUserUserId(eventId, userId)) {
            throw new IllegalStateException("You have already requested to join this event");
        }

        // Check if already participating
        if (participantRepository.existsByEventEventIdAndUserUserId(eventId, userId)) {
            throw new IllegalStateException("You are already participating in this event");
        }

        EventRequest request = new EventRequest();
        request.setEvent(event);
        request.setUser(user);
        request.setRequestedRole(role);
        request.setStatus("PENDING");

        EventRequest savedRequest = eventRequestRepository.save(request);

        // Notify event owner
        Notification notification = new Notification();
        notification.setUser(event.getCreator());
        notification.setMessage(user.getName() + " requested to join '" + event.getTitle() + "' as " + role);
        notification.setType(NotificationType.EVENT_UPDATE);
        notification.setLinkUrl("/events/" + eventId);
        notification.setIsRead(false);
        notificationRepository.save(notification);

        log.info("Event request created: {}", savedRequest.getRequestId());
        return savedRequest;
    }

    @Transactional
    public void acceptRequest(Long requestId, Long approverId) {
        EventRequest request = eventRequestRepository.findById(requestId)
            .orElseThrow(() -> new ResourceNotFoundException("EventRequest", "id", requestId));

        if (!"PENDING".equals(request.getStatus())) {
            throw new IllegalStateException("Request has already been processed");
        }

        // Add user as participant
        Event event = request.getEvent();
        User user = request.getUser();
        ParticipantRole role = request.getRequestedRole();

        int points = switch(role) {
            case ORGANIZER -> event.getOrganizerPoints() != null ? event.getOrganizerPoints() : 50;
            case VOLUNTEER -> event.getVolunteerPoints() != null ? event.getVolunteerPoints() : 20;
            case ATTENDEE -> event.getAttendeePoints() != null ? event.getAttendeePoints() : 10;
        };

        EventParticipant participant = new EventParticipant();
        participant.setEvent(event);
        participant.setUser(user);
        participant.setRole(role);
        participant.setPointsAwarded(points);
        participantRepository.save(participant);

        // Award points
        gamificationService.awardPoints(user, points, "EVENT", event.getEventId(),
            "Joined event '" + event.getTitle() + "' as " + role);

        // Update request status
        request.setStatus("ACCEPTED");
        eventRequestRepository.save(request);

        // Notify user
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setMessage("Your request to join '" + event.getTitle() + "' as " + role + " was accepted!");
        notification.setType(NotificationType.EVENT_UPDATE);
        notification.setLinkUrl("/events/" + event.getEventId());
        notification.setIsRead(false);
        notificationRepository.save(notification);

        log.info("Event request {} accepted", requestId);
    }

    @Transactional
    public void rejectRequest(Long requestId, String reason) {
        EventRequest request = eventRequestRepository.findById(requestId)
            .orElseThrow(() -> new ResourceNotFoundException("EventRequest", "id", requestId));

        if (!"PENDING".equals(request.getStatus())) {
            throw new IllegalStateException("Request has already been processed");
        }

        request.setStatus("REJECTED");
        eventRequestRepository.save(request);

        // Notify user
        Notification notification = new Notification();
        notification.setUser(request.getUser());
        notification.setMessage("Your request to join '" + request.getEvent().getTitle() + "' was rejected. Reason: " + reason);
        notification.setType(NotificationType.EVENT_UPDATE);
        notification.setLinkUrl("/events/" + request.getEvent().getEventId());
        notification.setIsRead(false);
        notificationRepository.save(notification);

        log.info("Event request {} rejected", requestId);
    }

    public List<EventRequest> getPendingRequestsForEvent(Long eventId) {
        return eventRequestRepository.findByEventEventIdAndStatus(eventId, "PENDING");
    }

    public List<EventRequest> getPendingRequestsForUser(Long userId) {
        return eventRequestRepository.findByUserUserIdAndStatus(userId, "PENDING");
    }

    public List<EventRequest> getMyPendingRequests(Long creatorId) {
        return eventRequestRepository.findByEventCreatorUserIdAndStatus(creatorId, "PENDING");
    }
}
