package com.example.unihub.repository;

import com.example.unihub.model.EventRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventRequestRepository extends JpaRepository<EventRequest, Long> {
    List<EventRequest> findByEventEventIdAndStatus(Long eventId, String status);
    List<EventRequest> findByUserUserIdAndStatus(Long userId, String status);
    List<EventRequest> findByStatusOrderByCreatedAtDesc(String status);
    boolean existsByEventEventIdAndUserUserId(Long eventId, Long userId);
    List<EventRequest> findByEventCreatorUserIdAndStatus(Long creatorId, String status);
}
