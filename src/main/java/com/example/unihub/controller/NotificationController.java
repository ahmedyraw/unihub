package com.example.unihub.controller;`r`n`r`nimport com.example.unihub.util.AuthenticationUtil;

import com.example.unihub.util.AuthenticationUtil;

import com.example.unihub.enums.NotificationType;
import com.example.unihub.model.Notification;
import com.example.unihub.model.User;
import com.example.unihub.service.NotificationService;
import com.example.unihub.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final UserService userService;

    /**
     * Get all notifications for current user
     * GET /api/notifications?isRead=false&type=BADGE_EARNED
     */
    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications(
            @RequestParam(required = false) Boolean isRead,
            @RequestParam(required = false) NotificationType type,
            Authentication authentication) {
        
        String email = AuthenticationUtil.getEmailFromAuthentication(authentication);
        User user = userService.getUserByEmail(email);
        
        List<Notification> notifications;
        
        if (type != null) {
            notifications = notificationService.getNotificationsByType(user.getUserId(), type);
        } else if (isRead != null && !isRead) {
            notifications = notificationService.getUnreadNotifications(user.getUserId());
        } else {
            notifications = notificationService.getUserNotifications(user.getUserId());
        }
        
        return ResponseEntity.ok(notifications);
    }

    /**
     * Get unread notification count
     * GET /api/notifications/unread-count
     */
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(Authentication authentication) {
        String email = AuthenticationUtil.getEmailFromAuthentication(authentication);
        User user = userService.getUserByEmail(email);
        
        long count = notificationService.getUnreadCount(user.getUserId());
        
        Map<String, Long> response = new HashMap<>();
        response.put("unreadCount", count);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Mark notification as read
     * PUT /api/notifications/{id}/read
     */
    @PutMapping("/{id}/read")
    public ResponseEntity<String> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok("Notification marked as read");
    }

    /**
     * Mark all notifications as read
     * PUT /api/notifications/read-all
     */
    @PutMapping("/read-all")
    public ResponseEntity<String> markAllAsRead(Authentication authentication) {
        String email = AuthenticationUtil.getEmailFromAuthentication(authentication);
        User user = userService.getUserByEmail(email);
        notificationService.markAllAsRead(user.getUserId());
        return ResponseEntity.ok("All notifications marked as read");
    }
}
