package com.example.unihub.service;

import com.example.unihub.dto.request.LoginRequest;
import com.example.unihub.dto.request.RegisterRequest;
import com.example.unihub.dto.response.AuthResponse;
import com.example.unihub.exception.UnauthorizedException;
import com.example.unihub.model.Badge;
import com.example.unihub.model.EmailVerificationToken;
import com.example.unihub.model.University;
import com.example.unihub.model.User;
import com.example.unihub.repository.BadgeRepository;
import com.example.unihub.repository.EmailVerificationTokenRepository;
import com.example.unihub.repository.UniversityRepository;
import com.example.unihub.repository.UserRepository;
import com.example.unihub.security.JwtUtil;
import com.example.unihub.enums.UserRole;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final UniversityRepository universityRepository;
    private final BadgeRepository badgeRepository;
    private final EmailVerificationTokenRepository verificationTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    /**
     * Register a new user
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        log.info("Registering new user with email: {}", request.getEmail());
        
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }
        
        // Validate password strength (additional backend validation)
        List<String> passwordErrors = com.example.unihub.util.PasswordValidator.validate(request.getPassword());
        if (!passwordErrors.isEmpty()) {
            throw new IllegalArgumentException("Password validation failed: " + String.join(", ", passwordErrors));
        }
        
        // Validate university and email domain
        University university = null;
        if (request.getUniversityId() != null) {
            university = universityRepository.findById(request.getUniversityId())
                .orElseThrow(() -> new IllegalArgumentException("University not found"));
            
            // Validate email domain matches university
            if (university.getEmailDomain() != null && !university.getEmailDomain().isEmpty()) {
                String emailDomain = request.getEmail().substring(request.getEmail().indexOf('@') + 1).toLowerCase();
                if (!emailDomain.equals(university.getEmailDomain().toLowerCase())) {
                    throw new IllegalArgumentException("Email must be from " + university.getEmailDomain() + " domain");
                }
            }
        }
        
        // Create new user
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(UserRole.STUDENT);
        user.setPoints(0);
        user.setEmailVerified(false);
        user.setUniversity(university);
        
        // Assign default badge (lowest threshold)
        Badge defaultBadge = badgeRepository.findTopByPointsThresholdLessThanEqualOrderByPointsThresholdDesc(0)
            .orElse(null);
        user.setCurrentBadge(defaultBadge);
        
        user = userRepository.save(user);
        
        // Create verification token
        String token = UUID.randomUUID().toString();
        EmailVerificationToken verificationToken = new EmailVerificationToken();
        verificationToken.setToken(token);
        verificationToken.setUser(user);
        verificationToken.setExpiryDate(LocalDateTime.now().plusHours(24));
        verificationTokenRepository.save(verificationToken);
        
        // Send verification email
        emailService.sendVerificationEmail(user.getEmail(), user.getName(), token);
        
        // Build response (no JWT token until verified)
        AuthResponse response = new AuthResponse();
        response.setUserId(user.getUserId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());
        return response;
    }

    /**
     * Login user
     */
    public AuthResponse login(LoginRequest request) {
        log.info("Login attempt for email: {}", request.getEmail());
        
        try {
            // Get user first to check verification
            User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));
            
            // Check if email is verified
            if (!user.getEmailVerified()) {
                throw new UnauthorizedException("Please verify your email before logging in");
            }
            
            // Authenticate user
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
            
            // Generate JWT token
            String token = jwtUtil.generateToken(
                user.getEmail(),
                user.getUserId(),
                user.getRole().name(),
                user.getUniversity() != null ? user.getUniversity().getUniversityId() : null
            );
            
            return buildAuthResponse(user, token);
            
        } catch (UnauthorizedException e) {
            throw e;
        } catch (Exception e) {
            log.error("Authentication failed for email: {}", request.getEmail(), e);
            throw new UnauthorizedException("Invalid email or password");
        }
    }

    /**
     * Build auth response
     */
    private AuthResponse buildAuthResponse(User user, String token) {
        AuthResponse response = new AuthResponse();
        response.setToken(token);
        response.setUserId(user.getUserId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());
        response.setPoints(user.getPoints());
        response.setHasPassword(user.getPasswordHash() != null && !user.getPasswordHash().isEmpty());
        
        if (user.getUniversity() != null) {
            response.setUniversityId(user.getUniversity().getUniversityId());
            response.setUniversityName(user.getUniversity().getName());
        }
        
        if (user.getCurrentBadge() != null) {
            response.setCurrentBadgeName(user.getCurrentBadge().getName());
        }
        
        return response;
    }

    /**
     * Get current user by email
     */
    public AuthResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new UnauthorizedException("User not found"));
        return buildAuthResponse(user, null);
    }

    /**
     * Verify email with token
     */
    @Transactional
    public AuthResponse verifyEmail(String token) {
        EmailVerificationToken verificationToken = verificationTokenRepository.findByToken(token)
            .orElseThrow(() -> new IllegalArgumentException("Invalid verification token"));
        
        if (verificationToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Verification token has expired");
        }
        
        User user = verificationToken.getUser();
        user.setEmailVerified(true);
        userRepository.save(user);
        
        verificationTokenRepository.delete(verificationToken);
        
        // Generate JWT token
        String jwtToken = jwtUtil.generateToken(
            user.getEmail(),
            user.getUserId(),
            user.getRole().name(),
            user.getUniversity() != null ? user.getUniversity().getUniversityId() : null
        );
        
        return buildAuthResponse(user, jwtToken);
    }

    /**
     * Resend verification email
     */
    @Transactional
    public void resendVerificationEmail(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        if (user.getEmailVerified()) {
            throw new IllegalArgumentException("Email already verified");
        }
        
        // Delete old token if exists
        verificationTokenRepository.findByUser(user).ifPresent(verificationTokenRepository::delete);
        
        // Create new token
        String token = UUID.randomUUID().toString();
        EmailVerificationToken verificationToken = new EmailVerificationToken();
        verificationToken.setToken(token);
        verificationToken.setUser(user);
        verificationToken.setExpiryDate(LocalDateTime.now().plusHours(24));
        verificationTokenRepository.save(verificationToken);
        
        emailService.sendVerificationEmail(user.getEmail(), user.getName(), token);
    }
}
