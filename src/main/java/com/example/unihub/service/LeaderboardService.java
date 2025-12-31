package com.example.unihub.service;

import com.example.unihub.model.Event;
import com.example.unihub.model.User;
import com.example.unihub.repository.EventRepository;
import com.example.unihub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class LeaderboardService {

    private final UserRepository userRepository;
    private final EventRepository eventRepository;

    /**
     * Get members leaderboard (ranked by points)
     * @param scope UNIVERSITY or GLOBAL
     * @param universityId Required if scope is UNIVERSITY
     */
    public List<User> getMembersLeaderboard(String scope, Long universityId) {
        log.info("Getting members leaderboard - Scope: {}, UniversityId: {}", scope, universityId);
        
        if ("UNIVERSITY".equalsIgnoreCase(scope)) {
            if (universityId == null) {
                throw new IllegalArgumentException("University ID is required for UNIVERSITY scope");
            }
            return userRepository.findByUniversityUniversityIdOrderByPointsDesc(universityId);
        } else {
            // GLOBAL scope
            return userRepository.findAllByOrderByPointsDesc();
        }
    }

    /**
     * Get events leaderboard (ranked by participant count)
     * @param scope UNIVERSITY or GLOBAL
     * @param universityId Required if scope is UNIVERSITY
     */
    public List<Event> getEventsLeaderboard(String scope, Long universityId) {
        log.info("Getting events leaderboard - Scope: {}, UniversityId: {}", scope, universityId);
        
        if ("UNIVERSITY".equalsIgnoreCase(scope)) {
            if (universityId == null) {
                throw new IllegalArgumentException("University ID is required for UNIVERSITY scope");
            }
            return eventRepository.findTopEventsByParticipantsCountForUniversity(universityId);
        } else {
            // GLOBAL scope
            return eventRepository.findTopEventsByParticipantsCount();
        }
    }

    /**
     * Get top N members from leaderboard
     */
    public List<User> getTopMembers(String scope, Long universityId, int limit) {
        List<User> leaderboard = getMembersLeaderboard(scope, universityId);
        return leaderboard.stream().limit(limit).toList();
    }

    /**
     * Get top N events from leaderboard
     */
    public List<Event> getTopEvents(String scope, Long universityId, int limit) {
        List<Event> leaderboard = getEventsLeaderboard(scope, universityId);
        return leaderboard.stream().limit(limit).toList();
    }

    /**
     * Get user's rank in leaderboard
     */
    public int getUserRank(Long userId, String scope, Long universityId) {
        List<User> leaderboard = getMembersLeaderboard(scope, universityId);
        for (int i = 0; i < leaderboard.size(); i++) {
            if (leaderboard.get(i).getUserId().equals(userId)) {
                return i + 1; // Rank starts from 1
            }
        }
        return -1; // User not found
    }
}
