package com.example.unihub.controller;`r`n`r`nimport com.example.unihub.util.AuthenticationUtil;

import com.example.unihub.model.Badge;
import com.example.unihub.model.Event;
import com.example.unihub.model.User;
import com.example.unihub.model.UserBadge;
import com.example.unihub.repository.BadgeRepository;
import com.example.unihub.service.LeaderboardService;
import com.example.unihub.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/gamification")
@RequiredArgsConstructor
public class GamificationController {

    private final LeaderboardService leaderboardService;
    private final UserService userService;
    private final BadgeRepository badgeRepository;

    /**
     * Get leaderboard
     * GET /api/gamification/leaderboard?scope=GLOBAL&type=MEMBERS&universityId=1
     */
    @GetMapping("/leaderboard")
    public ResponseEntity<Map<String, Object>> getLeaderboard(
            @RequestParam(defaultValue = "GLOBAL") String scope,
            @RequestParam(defaultValue = "MEMBERS") String type,
            @RequestParam(required = false) Long universityId) {
        
        Map<String, Object> response = new HashMap<>();
        response.put("scope", scope);
        response.put("type", type);
        
        if ("MEMBERS".equalsIgnoreCase(type)) {
            List<User> leaderboard = leaderboardService.getMembersLeaderboard(scope, universityId);
            response.put("rankings", leaderboard);
        } else if ("EVENTS".equalsIgnoreCase(type)) {
            List<Event> leaderboard = leaderboardService.getEventsLeaderboard(scope, universityId);
            response.put("rankings", leaderboard);
        } else {
            throw new IllegalArgumentException("Invalid leaderboard type. Use MEMBERS or EVENTS");
        }
        
        return ResponseEntity.ok(response);
    }

    /**
     * Get top members (for dashboard snippets)
     * GET /api/gamification/top-members?scope=GLOBAL&limit=3
     */
    @GetMapping("/top-members")
    public ResponseEntity<List<User>> getTopMembers(
            @RequestParam(defaultValue = "GLOBAL") String scope,
            @RequestParam(required = false) Long universityId,
            @RequestParam(defaultValue = "10") int limit) {
        List<User> topMembers = leaderboardService.getTopMembers(scope, universityId, limit);
        return ResponseEntity.ok(topMembers);
    }

    /**
     * Get top events (for dashboard snippets)
     * GET /api/gamification/top-events?scope=GLOBAL&limit=3
     */
    @GetMapping("/top-events")
    public ResponseEntity<List<Event>> getTopEvents(
            @RequestParam(defaultValue = "GLOBAL") String scope,
            @RequestParam(required = false) Long universityId,
            @RequestParam(defaultValue = "10") int limit) {
        List<Event> topEvents = leaderboardService.getTopEvents(scope, universityId, limit);
        return ResponseEntity.ok(topEvents);
    }

    /**
     * Get my rank
     * GET /api/gamification/my-rank?scope=GLOBAL
     */
    @GetMapping("/my-rank")
    public ResponseEntity<Map<String, Object>> getMyRank(
            @RequestParam(defaultValue = "GLOBAL") String scope,
            Authentication authentication) {
        String email = AuthenticationUtil.getEmailFromAuthentication(authentication);
        User user = userService.getUserByEmail(email);
        
        Long universityId = "UNIVERSITY".equalsIgnoreCase(scope) && user.getUniversity() != null 
            ? user.getUniversity().getUniversityId() : null;
        int rank = leaderboardService.getUserRank(user.getUserId(), scope, universityId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("rank", rank);
        response.put("scope", scope);
        response.put("points", user.getPoints());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Get user rank by ID
     * GET /api/gamification/rank/{userId}?scope=GLOBAL
     */
    @GetMapping("/rank/{userId}")
    public ResponseEntity<Map<String, Object>> getUserRank(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "GLOBAL") String scope) {
        User user = userService.getUserById(userId);
        Long universityId = "UNIVERSITY".equalsIgnoreCase(scope) && user.getUniversity() != null 
            ? user.getUniversity().getUniversityId() : null;
        int rank = leaderboardService.getUserRank(userId, scope, universityId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("rank", rank);
        response.put("scope", scope);
        response.put("points", user.getPoints());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Get all badges
     * GET /api/gamification/badges
     */
    @GetMapping("/badges")
    public ResponseEntity<List<Badge>> getAllBadges() {
        List<Badge> badges = badgeRepository.findAllByOrderByPointsThresholdAsc();
        return ResponseEntity.ok(badges);
    }

    /**
     * Get badges with user's progress
     * GET /api/gamification/my-badges
     */
    @GetMapping("/my-badges")
    public ResponseEntity<Map<String, Object>> getMyBadges(Authentication authentication) {
        String email = AuthenticationUtil.getEmailFromAuthentication(authentication);
        User user = userService.getUserByEmail(email);
        
        List<Badge> allBadges = badgeRepository.findAllByOrderByPointsThresholdAsc();
        List<UserBadge> earnedBadges = userService.getUserBadges(user.getUserId());
        
        Map<String, Object> response = new HashMap<>();
        response.put("allBadges", allBadges);
        response.put("earnedBadges", earnedBadges);
        response.put("currentPoints", user.getPoints());
        response.put("currentBadge", user.getCurrentBadge());
        
        return ResponseEntity.ok(response);
    }
}
