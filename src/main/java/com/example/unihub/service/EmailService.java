package com.example.unihub.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${app.email.from:noreply@unihub.com}")
    private String fromEmail;

    public void sendPasswordResetEmail(String email, String name, String token) {
        String resetLink = frontendUrl + "/#/reset-password?token=" + token;
        
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(email);
            message.setSubject("Reset Your UniHub Password");
            message.setText(String.format(
                "Hi %s,\n\n" +
                "You requested to reset your password for UniHub.\n\n" +
                "Click the link below to reset your password:\n" +
                "%s\n\n" +
                "This link will expire in 15 minutes.\n\n" +
                "If you didn't request this, please ignore this email.\n\n" +
                "Best regards,\n" +
                "UniHub Team",
                name, resetLink));
            
            mailSender.send(message);
            log.info("Password reset email sent to: {}", email);
        } catch (Exception e) {
            log.error("Failed to send password reset email to: {}", email, e);
            // Fallback: log the link
            log.info("Password reset link: {}", resetLink);
        }
    }

    public void sendVerificationEmail(String email, String name, String token) {
        String verificationLink = frontendUrl + "/#/verify-email?token=" + token;
        
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(email);
            message.setSubject("Verify Your UniHub Email Address");
            message.setText(String.format(
                "Hi %s,\n\n" +
                "Welcome to UniHub! 🎓\n\n" +
                "Please verify your email address by clicking the link below:\n" +
                "%s\n\n" +
                "This link will expire in 24 hours.\n\n" +
                "If you didn't create an account, please ignore this email.\n\n" +
                "Best regards,\n" +
                "UniHub Team",
                name, verificationLink));
            
            mailSender.send(message);
            log.info("Verification email sent to: {}", email);
        } catch (Exception e) {
            log.error("Failed to send verification email to: {}", email, e);
            // Fallback: log the link
            log.info("Verification link: {}", verificationLink);
        }
    }
}
