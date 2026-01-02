package com.example.unihub.controller;
import com.example.unihub.util.AuthenticationUtil;

import com.example.unihub.dto.request.CreateEventRequest;
import com.example.unihub.dto.request.JoinEventRequest;
import com.example.unihub.enums.EventStatus;
import com.example.unihub.model.Event;
import com.example.unihub.model.EventParticipant;
import com.example.unihub.model.User;
import com.example.unihub.service.EventService;
import com.example.unihub.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;
    private final UserService userService;

    /**
     * Get all events with optional filters
     * GET /api/events?universityId=1&status=APPROVED
     */
    @GetMapping
    public ResponseEntity<List<Event>> getAllEvents(
            @RequestParam(required = false) Long universityId,
            @RequestParam(required = false) EventStatus status) {
        List<Event> events = eventService.getAllEvents(universityId, status);
        return ResponseEntity.ok(events);
    }

    /**
     * Get event by ID
     * GET /api/events/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Event> getEventById(@PathVariable Long id) {
        Event event = eventService.getEventById(id);
        return ResponseEntity.ok(event);
    }

    /**
     * Create a new event
     * POST /api/events
     */
    @PostMapping
    public ResponseEntity<Event> createEvent(
            @Valid @RequestBody CreateEventRequest request,
            Authentication authentication) {
        String email = AuthenticationUtil.getEmailFromAuthentication(authentication);
        User creator = userService.getUserByEmail(email);
        Event event = eventService.createEvent(request, creator);
        return ResponseEntity.status(HttpStatus.CREATED).body(event);
    }

    /**
     * Update an existing event (Creator only, PENDING events only)
     * PUT /api/events/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<Event> updateEvent(
            @PathVariable Long id,
            @Valid @RequestBody CreateEventRequest request,
            Authentication authentication) {
        String email = AuthenticationUtil.getEmailFromAuthentication(authentication);
        User currentUser = userService.getUserByEmail(email);
        Event event = eventService.updateEvent(id, request, currentUser);
        return ResponseEntity.ok(event);
    }

    /**
     * Join an event
     * POST /api/events/{id}/join
     */
    @PostMapping("/{id}/join")
    public ResponseEntity<String> joinEvent(
            @PathVariable Long id,
            @Valid @RequestBody JoinEventRequest request,
            Authentication authentication) {
        String email = AuthenticationUtil.getEmailFromAuthentication(authentication);
        User user = userService.getUserByEmail(email);
        eventService.joinEvent(id, user.getUserId(), request.getRole());
        return ResponseEntity.ok("Successfully joined event");
    }

    /**
     * Leave an event (with penalty)
     * POST /api/events/{id}/leave
     */
    @PostMapping("/{id}/leave")
    public ResponseEntity<String> leaveEvent(
            @PathVariable Long id,
            Authentication authentication) {
        String email = AuthenticationUtil.getEmailFromAuthentication(authentication);
        User user = userService.getUserByEmail(email);
        eventService.leaveEvent(id, user.getUserId());
        return ResponseEntity.ok("Left event successfully (penalty applied)");
    }

    /**
     * Approve an event (Supervisor/Admin only)
     * PUT /api/events/{id}/approve
     */
    @PutMapping("/{id}/approve")
    public ResponseEntity<String> approveEvent(@PathVariable Long id) {
        eventService.approveEvent(id);
        return ResponseEntity.ok("Event approved successfully");
    }

    /**
     * Reject an event (Supervisor/Admin only)
     * PUT /api/events/{id}/reject
     */
    @PutMapping("/{id}/reject")
    public ResponseEntity<String> rejectEvent(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String reason = body.getOrDefault("reason", "Not specified");
        eventService.rejectEvent(id, reason);
        return ResponseEntity.ok("Event rejected");
    }

    /**
     * Cancel an event (Supervisor/Admin only)
     * PUT /api/events/{id}/cancel
     */
    @PutMapping("/{id}/cancel")
    public ResponseEntity<String> cancelEvent(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String reason = body.getOrDefault("reason", "Not specified");
        eventService.cancelEvent(id, reason);
        return ResponseEntity.ok("Event cancelled");
    }

    /**
     * Get events created by current user
     * GET /api/events/my-events
     */
    @GetMapping("/my-events")
    public ResponseEntity<List<Event>> getMyEvents(Authentication authentication) {
        String email = AuthenticationUtil.getEmailFromAuthentication(authentication);
        User user = userService.getUserByEmail(email);
        List<Event> events = eventService.getEventsByCreator(user.getUserId());
        return ResponseEntity.ok(events);
    }

    /**
     * Get events user is participating in
     * GET /api/events/my-participations
     */
    @GetMapping("/my-participations")
    public ResponseEntity<List<EventParticipant>> getMyParticipations(Authentication authentication) {
        String email = AuthenticationUtil.getEmailFromAuthentication(authentication);
        User user = userService.getUserByEmail(email);
        List<EventParticipant> participations = eventService.getUserParticipations(user.getUserId());
        return ResponseEntity.ok(participations);
    }

    /**
     * Get participants for an event
     * GET /api/events/{id}/participants
     */
    @GetMapping("/{id}/participants")
    public ResponseEntity<List<EventParticipant>> getEventParticipants(@PathVariable Long id) {
        List<EventParticipant> participants = eventService.getEventParticipants(id);
        return ResponseEntity.ok(participants);
    }

    /**
     * Delete an event (Creator or Admin only)
     * DELETE /api/events/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteEvent(
            @PathVariable Long id,
            Authentication authentication) {
        String email = AuthenticationUtil.getEmailFromAuthentication(authentication);
        User user = userService.getUserByEmail(email);
        eventService.deleteEvent(id, user);
        return ResponseEntity.ok("Event deleted successfully");
    }
}
