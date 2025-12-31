package com.example.unihub.controller;

import com.example.unihub.model.User;
import com.example.unihub.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * Get current user profile
     * GET /api/users/me
     */
    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(Authentication authentication) {
        String email = authentication.getName();
        User user = userService.getUserByEmail(email);
        return ResponseEntity.ok(user);
    }

    /**
     * Get user by ID
     * GET /api/users/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        User user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    /**
     * Update current user profile
     * PUT /api/users/me
     */
    @PutMapping("/me")
    public ResponseEntity<User> updateProfile(
            @RequestBody Map<String, String> updates,
            Authentication authentication) {
        String email = authentication.getName();
        User user = userService.getUserByEmail(email);
        
        String newName = updates.get("name");
        String newEmail = updates.get("email");
        
        User updatedUser = userService.updateUser(user.getUserId(), newName, newEmail);
        return ResponseEntity.ok(updatedUser);
    }

    /**
     * Change password
     * PUT /api/users/change-password
     */
    @PutMapping("/change-password")
    public ResponseEntity<String> changePassword(
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        String email = authentication.getName();
        User user = userService.getUserByEmail(email);
        
        String oldPassword = request.get("oldPassword");
        String newPassword = request.get("newPassword");
        
        userService.changePassword(user.getUserId(), oldPassword, newPassword);
        return ResponseEntity.ok("Password changed successfully");
    }

    /**
     * Set password for OAuth2 users
     * PUT /api/users/set-password
     */
    @PutMapping("/set-password")
    public ResponseEntity<String> setPassword(
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        String email = authentication.getName();
        User user = userService.getUserByEmail(email);
        
        String newPassword = request.get("newPassword");
        userService.setPassword(user.getUserId(), newPassword);
        return ResponseEntity.ok("Password set successfully");
    }

    /**
     * Update university
     * PUT /api/users/university
     */
    @PutMapping("/university")
    public ResponseEntity<User> updateUniversity(
            @RequestBody Map<String, Long> request,
            Authentication authentication) {
        String email = authentication.getName();
        User user = userService.getUserByEmail(email);
        
        Long universityId = request.get("universityId");
        User updatedUser = userService.updateUniversity(user.getUserId(), universityId);
        return ResponseEntity.ok(updatedUser);
    }
}
