package com.example.unihub.service;

import com.example.unihub.repository.EmailVerificationTokenRepository;
import com.example.unihub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class TokenCleanupService {

    private final EmailVerificationTokenRepository verificationTokenRepository;
    private final UserRepository userRepository;

    @Scheduled(cron = "0 0 2 * * ?") // Run daily at 2 AM
    @Transactional
    public void cleanupExpiredTokens() {
        log.info("Cleaning up expired email verification tokens");
        verificationTokenRepository.deleteByExpiryDateBefore(LocalDateTime.now());
    }

    @Scheduled(cron = "0 0 3 * * ?") // Run daily at 3 AM
    @Transactional
    public void cleanupUnverifiedAccounts() {
        log.info("Cleaning up unverified accounts older than 7 days");
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(7);
        long deleted = userRepository.deleteByEmailVerifiedFalseAndCreatedAtBefore(cutoffDate);
        log.info("Deleted {} unverified accounts", deleted);
    }
}
