package com.example.unihub.service;

import com.example.unihub.enums.NotificationType;
import com.example.unihub.model.*;
import com.example.unihub.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class GamificationService {

    private final UserRepository userRepository;
    private final PointsLogRepository pointsLogRepository;
    private final BadgeRepository badgeRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Award points to a user and check for badge promotion
     */
    @Transactional
    public void awardPoints(User user, int points, String sourceType, Long sourceId, String description) {
        log.info("Awarding {} points to user {} from source {}", points, user.getUserId(), sourceType);
        
        // 1. Update user points
        int oldPoints = user.getPoints();
        user.setPoints(oldPoints + points);
        userRepository.save(user);
        
        // 2. Create points log entry
        PointsLog pointsLog = new PointsLog();
        pointsLog.setUser(user);
        pointsLog.setSourceType(sourceType);
        pointsLog.setSourceId(sourceId);
        pointsLog.setPoints(points);
        pointsLog.setDescription(description);
        pointsLogRepository.save(pointsLog);
        
        // 3. Check for badge promotion
        checkAndPromoteBadge(user);
        
        // 4. Send WebSocket update for leaderboard
        sendLeaderboardUpdate();
        // 5. Send dashboard update for instant UI refresh
        sendDashboardUpdate(user.getUserId());
    }

    /**
     * Deduct points from a user (for penalties)
     */
    @Transactional
    public void deductPoints(User user, int points, String sourceType, Long sourceId, String description) {
        log.info("Deducting {} points from user {} for source {}", points, user.getUserId(), sourceType);
        
        // 1. Update user points (ensure not negative)
        int oldPoints = user.getPoints();
        user.setPoints(Math.max(0, oldPoints - points));
        userRepository.save(user);
        
        // 2. Create negative points log entry
        PointsLog pointsLog = new PointsLog();
        pointsLog.setUser(user);
        pointsLog.setSourceType(sourceType);
        pointsLog.setSourceId(sourceId);
        pointsLog.setPoints(-points); // Negative value
        pointsLog.setDescription(description);
        pointsLogRepository.save(pointsLog);
        
        // 3. Check for badge demotion
        checkAndDemoteBadge(user);
        
        // 4. Send WebSocket update for leaderboard
        sendLeaderboardUpdate();
        // 5. Send dashboard update for instant UI refresh
        sendDashboardUpdate(user.getUserId());
    }

    /**
     * Check if user qualifies for a new badge and promote if eligible
     */
    @Transactional
    public void checkAndPromoteBadge(User user) {
        // Find the highest badge user qualifies for based on current points
        Badge newBadge = badgeRepository
            .findTopByPointsThresholdLessThanEqualOrderByPointsThresholdDesc(user.getPoints())
            .orElse(null);
        
        if (newBadge == null) {
            return; // No badge qualifies
        }
        
        Badge currentBadge = user.getCurrentBadge();
        
        // Check if this is a new badge (promotion)
        if (currentBadge == null || !newBadge.getBadgeId().equals(currentBadge.getBadgeId())) {
            log.info("Promoting user {} from badge {} to badge {}", 
                user.getUserId(), 
                currentBadge != null ? currentBadge.getName() : "none", 
                newBadge.getName());
            
            // Update user's current badge
            user.setCurrentBadge(newBadge);
            userRepository.save(user);
            
            // Record badge in user_badges history (if not already recorded)
            if (!userBadgeRepository.existsByUserUserIdAndBadgeBadgeId(user.getUserId(), newBadge.getBadgeId())) {
                UserBadge userBadge = new UserBadge();
                userBadge.setUser(user);
                userBadge.setBadge(newBadge);
                userBadge.setEarnedAt(LocalDateTime.now());
                userBadgeRepository.save(userBadge);
            }
            
            // Create notification
            Notification notification = new Notification();
            notification.setUser(user);
            notification.setMessage("Congratulations! You've earned the " + newBadge.getName() + " badge!");
            notification.setType(NotificationType.BADGE_EARNED);
            notification.setLinkUrl("/badges");
            notification.setIsRead(false);
            notificationRepository.save(notification);
            
            // Send WebSocket notification for pop-up
            sendBadgePromotionNotification(user.getUserId(), newBadge);
        }
    }

    /**
     * Check if user should be demoted to a lower badge (after penalty)
     */
    @Transactional
    public void checkAndDemoteBadge(User user) {
        Badge currentBadge = user.getCurrentBadge();
        
        if (currentBadge == null) {
            return; // No badge to demote from
        }
        
        // If user's points dropped below current badge threshold
        if (user.getPoints() < currentBadge.getPointsThreshold()) {
            // Find the highest badge user now qualifies for
            Badge newBadge = badgeRepository
                .findTopByPointsThresholdLessThanEqualOrderByPointsThresholdDesc(user.getPoints())
                .orElse(null);
            
            if (newBadge == null || !newBadge.getBadgeId().equals(currentBadge.getBadgeId())) {
                log.info("Demoting user {} from badge {} to badge {}", 
                    user.getUserId(), 
                    currentBadge.getName(), 
                    newBadge != null ? newBadge.getName() : "none");
                
                user.setCurrentBadge(newBadge);
                userRepository.save(user);
                
                // Notify user of demotion
                Notification notification = new Notification();
                notification.setUser(user);
                notification.setMessage("Your badge has been updated to " + (newBadge != null ? newBadge.getName() : "Newcomer") + " due to point changes.");
                notification.setType(NotificationType.POINTS_UPDATE);
                notification.setLinkUrl("/badges");
                notification.setIsRead(false);
                notificationRepository.save(notification);
            }
        }
    }

    /**
     * Send badge promotion notification via WebSocket for instant pop-up
     */
    private void sendBadgePromotionNotification(Long userId, Badge badge) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("userId", userId);
        payload.put("badgeId", badge.getBadgeId());
        payload.put("badgeName", badge.getName());
        payload.put("badgeDescription", badge.getDescription());
        payload.put("pointsThreshold", badge.getPointsThreshold());
        payload.put("timestamp", LocalDateTime.now());
        
        messagingTemplate.convertAndSend("/topic/badge-promotion/" + userId, payload);
        log.info("Sent badge promotion WebSocket message to user {}", userId);
    }

    /**
     * Send leaderboard update notification via WebSocket
     */
    public void sendLeaderboardUpdate() {
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "LEADERBOARD_UPDATE");
        payload.put("timestamp", LocalDateTime.now());
        
        messagingTemplate.convertAndSend("/topic/leaderboard-update", payload);
        log.debug("Sent leaderboard update WebSocket message");
    }

    /**
     * Send dashboard update notification via WebSocket
     */
    public void sendDashboardUpdate(Long userId) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "DASHBOARD_UPDATE");
        payload.put("timestamp", LocalDateTime.now());
        
        messagingTemplate.convertAndSend("/topic/dashboard-update/" + userId, payload);
        log.debug("Sent dashboard update WebSocket message to user {}", userId);
    }
}
