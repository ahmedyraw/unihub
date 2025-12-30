package com.example.unihub.service;

import com.example.unihub.model.PasswordResetToken;
import com.example.unihub.model.User;
import com.example.unihub.repository.PasswordResetTokenRepository;
import com.example.unihub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordResetService {

    private final PasswordResetTokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    
    private static final int TOKEN_EXPIRY_MINUTES = 15;
    private static final int TOKEN_LENGTH = 32;

    @Transactional
    public void createPasswordResetToken(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isEmpty()) {
            log.info("Password reset requested for non-existent email: {}", email);
            return; // Silent fail for security
        }
        
        User user = userOpt.get();
        
        // Delete any existing tokens for this user
        tokenRepository.deleteByUser(user);
        
        // Generate secure random token
        String rawToken = generateSecureToken();
        String tokenHash = passwordEncoder.encode(rawToken);
        
        // Create token entity
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setTokenHash(tokenHash);
        resetToken.setUser(user);
        resetToken.setExpiryDate(LocalDateTime.now().plusMinutes(TOKEN_EXPIRY_MINUTES));
        resetToken.setCreatedAt(LocalDateTime.now());
        
        tokenRepository.save(resetToken);
        
        // Send email with raw token
        emailService.sendPasswordResetEmail(user.getEmail(), user.getName(), rawToken);
        
        log.info("Password reset token created for user: {}", user.getEmail());
    }

    @Transactional
    public void resetPassword(String rawToken, String newPassword) {
        // Find token by trying to match hash
        Optional<PasswordResetToken> tokenOpt = findTokenByRawToken(rawToken);
        
        if (tokenOpt.isEmpty()) {
            throw new IllegalArgumentException("Invalid or expired reset token");
        }
        
        PasswordResetToken token = tokenOpt.get();
        
        if (!token.isValid()) {
            throw new IllegalArgumentException("Token has expired or already been used");
        }
        
        // Update user password
        User user = token.getUser();
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        // Mark token as used
        token.setUsed(true);
        tokenRepository.save(token);
        
        log.info("Password successfully reset for user: {}", user.getEmail());
    }

    public boolean validateToken(String rawToken) {
        Optional<PasswordResetToken> tokenOpt = findTokenByRawToken(rawToken);
        return tokenOpt.isPresent() && tokenOpt.get().isValid();
    }

    private Optional<PasswordResetToken> findTokenByRawToken(String rawToken) {
        // Get all tokens and check which one matches
        return tokenRepository.findAll().stream()
            .filter(token -> passwordEncoder.matches(rawToken, token.getTokenHash()))
            .findFirst();
    }

    private String generateSecureToken() {
        SecureRandom random = new SecureRandom();
        byte[] bytes = new byte[TOKEN_LENGTH];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    @Scheduled(cron = "0 0 * * * *") // Run every hour
    @Transactional
    public void cleanupExpiredTokens() {
        tokenRepository.deleteByExpiryDateBefore(LocalDateTime.now());
        log.info("Cleaned up expired password reset tokens");
    }
}
