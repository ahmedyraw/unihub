package com.example.unihub.controller;
import com.example.unihub.util.AuthenticationUtil;

import com.example.unihub.enums.ParticipantRole;
import com.example.unihub.model.EventRequest;
import com.example.unihub.model.User;
import com.example.unihub.service.EventRequestService;
import com.example.unihub.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/event-requests")
@RequiredArgsConstructor
public class EventRequestController {

    private final EventRequestService eventRequestService;
    private final UserService userService;

    @PostMapping
    public ResponseEntity<EventRequest> createRequest(
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        String email = AuthenticationUtil.getEmailFromAuthentication(authentication);
        User user = userService.getUserByEmail(email);
        
        Long eventId = Long.valueOf(request.get("eventId").toString());
        ParticipantRole role = ParticipantRole.valueOf(request.get("role").toString());
        
        EventRequest eventRequest = eventRequestService.createRequest(eventId, user.getUserId(), role);
        return ResponseEntity.status(HttpStatus.CREATED).body(eventRequest);
    }

    @PutMapping("/{id}/accept")
    public ResponseEntity<String> acceptRequest(
            @PathVariable Long id,
            Authentication authentication) {
        String email = AuthenticationUtil.getEmailFromAuthentication(authentication);
        User user = userService.getUserByEmail(email);
        
        eventRequestService.acceptRequest(id, user.getUserId());
        return ResponseEntity.ok("Request accepted");
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<String> rejectRequest(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String reason = body.getOrDefault("reason", "Not specified");
        eventRequestService.rejectRequest(id, reason);
        return ResponseEntity.ok("Request rejected");
    }

    @GetMapping("/my-requests")
    public ResponseEntity<List<EventRequest>> getMyRequests(Authentication authentication) {
        String email = AuthenticationUtil.getEmailFromAuthentication(authentication);
        User user = userService.getUserByEmail(email);
        List<EventRequest> requests = eventRequestService.getMyPendingRequests(user.getUserId());
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<EventRequest>> getEventRequests(@PathVariable Long eventId) {
        List<EventRequest> requests = eventRequestService.getPendingRequestsForEvent(eventId);
        return ResponseEntity.ok(requests);
    }
}
