package com.example.unihub.repository;

import com.example.unihub.model.PasswordResetToken;
import com.example.unihub.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    
    Optional<PasswordResetToken> findByTokenHash(String tokenHash);
    
    void deleteByUser(User user);
    
    void deleteByExpiryDateBefore(LocalDateTime date);
}
