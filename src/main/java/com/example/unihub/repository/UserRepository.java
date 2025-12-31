package com.example.unihub.repository;

import com.example.unihub.model.User;
import com.example.unihub.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByEmail(String email);
    
    boolean existsByEmail(String email);
    
    // Leaderboard queries
    List<User> findByUniversityUniversityIdOrderByPointsDesc(Long universityId);
    
    List<User> findAllByOrderByPointsDesc();
    
    // Filter by role
    List<User> findByRole(UserRole role);
    
    List<User> findByUniversityUniversityId(Long universityId);
    
    // Count users
    long countByRole(UserRole role);
    
    long countByUniversityUniversityId(Long universityId);
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.points > 0")
    long countActiveUsers();
    
    long deleteByEmailVerifiedFalseAndCreatedAtBefore(LocalDateTime cutoffDate);
}
