package com.example.unihub.repository;

import com.example.unihub.model.EmailVerificationToken;
import com.example.unihub.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, Long> {
    
    Optional<EmailVerificationToken> findByToken(String token);
    
    Optional<EmailVerificationToken> findByUser(User user);
    
    void deleteByExpiryDateBefore(LocalDateTime now);
}
