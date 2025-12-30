package com.example.unihub.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    public void sendPasswordResetEmail(String email, String name, String token) {
        String resetLink = frontendUrl + "/reset-password?token=" + token;
        
        // TODO: Integrate with actual email service (SendGrid, AWS SES, etc.)
        // For now, just log the link
        log.info("=".repeat(80));
        log.info("PASSWORD RESET EMAIL");
        log.info("To: {}", email);
        log.info("Name: {}", name);
        log.info("Reset Link: {}", resetLink);
        log.info("Token expires in 15 minutes");
        log.info("=".repeat(80));
        
        // Example email template:
        String emailBody = String.format(
            "Hi %s,\n\n" +
            "You requested to reset your password for UniHub.\n\n" +
            "Click the link below to reset your password:\n" +
            "%s\n\n" +
            "This link will expire in 15 minutes.\n\n" +
            "If you didn't request this, please ignore this email.\n\n" +
            "Best regards,\n" +
            "UniHub Team",
            name, resetLink);
        
        // TODO: Send actual email
        // emailClient.send(email, "Reset Your Password", emailBody);
    }
}
