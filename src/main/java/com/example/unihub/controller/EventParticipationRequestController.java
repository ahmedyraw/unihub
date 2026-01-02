package com.example.unihub.controller;
import com.example.unihub.util.AuthenticationUtil;

import com.example.unihub.dto.ParticipationRequestDTO;
import com.example.unihub.dto.ParticipationRequestResponseDTO;
import com.example.unihub.model.User;
import com.example.unihub.service.EventParticipationRequestService;
import com.example.unihub.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/event-participation-requests")
@RequiredArgsConstructor
public class EventParticipationRequestController {
    private final EventParticipationRequestService requestService;
    private final UserService userService;

    @PostMapping("/events/{eventId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ParticipationRequestResponseDTO> submitRequest(
            @PathVariable Long eventId,
            @RequestBody ParticipationRequestDTO dto,
            Authentication authentication) {
        String email = AuthenticationUtil.getEmailFromAuthentication(authentication);
        User user = userService.getUserByEmail(email);
        return ResponseEntity.ok(requestService.submitRequest(eventId, user.getUserId(), dto));
    }

    @GetMapping("/events/{eventId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ParticipationRequestResponseDTO>> getEventRequests(@PathVariable Long eventId) {
        return ResponseEntity.ok(requestService.getEventRequests(eventId));
    }

    @GetMapping("/my-requests")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ParticipationRequestResponseDTO>> getMyRequests(Authentication authentication) {
        String email = AuthenticationUtil.getEmailFromAuthentication(authentication);
        User user = userService.getUserByEmail(email);
        return ResponseEntity.ok(requestService.getUserRequests(user.getUserId()));
    }

    @PostMapping("/{requestId}/approve")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> approveRequest(
            @PathVariable Long requestId,
            Authentication authentication) {
        String email = AuthenticationUtil.getEmailFromAuthentication(authentication);
        User user = userService.getUserByEmail(email);
        requestService.approveRequest(requestId, user.getUserId());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{requestId}/reject")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> rejectRequest(
            @PathVariable Long requestId,
            Authentication authentication) {
        String email = AuthenticationUtil.getEmailFromAuthentication(authentication);
        User user = userService.getUserByEmail(email);
        requestService.rejectRequest(requestId, user.getUserId());
        return ResponseEntity.ok().build();
    }
}
