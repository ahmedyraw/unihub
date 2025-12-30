package com.example.unihub.service;

import com.example.unihub.dto.request.LoginRequest;
import com.example.unihub.dto.request.RegisterRequest;
import com.example.unihub.dto.response.AuthResponse;
import com.example.unihub.exception.UnauthorizedException;
import com.example.unihub.model.Badge;
import com.example.unihub.model.University;
import com.example.unihub.model.User;
import com.example.unihub.repository.BadgeRepository;
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

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final UniversityRepository universityRepository;
    private final BadgeRepository badgeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

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
        
        // Create new user
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(UserRole.STUDENT);
        user.setPoints(0);
        
        // Set university if provided
        if (request.getUniversityId() != null) {
            University university = universityRepository.findById(request.getUniversityId())
                .orElseThrow(() -> new IllegalArgumentException("University not found"));
            user.setUniversity(university);
        }
        
        // Assign default badge (lowest threshold)
        Badge defaultBadge = badgeRepository.findTopByPointsThresholdLessThanEqualOrderByPointsThresholdDesc(0)
            .orElse(null);
        user.setCurrentBadge(defaultBadge);
        
        user = userRepository.save(user);
        
        // Generate JWT token
        String token = jwtUtil.generateToken(
            user.getEmail(),
            user.getUserId(),
            user.getRole().name(),
            user.getUniversity() != null ? user.getUniversity().getUniversityId() : null
        );
        
        // Build response
        return buildAuthResponse(user, token);
    }

    /**
     * Login user
     */
    public AuthResponse login(LoginRequest request) {
        log.info("Login attempt for email: {}", request.getEmail());
        
        try {
            // Authenticate user
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
            
            // Get user details
            User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));
            
            // Generate JWT token
            String token = jwtUtil.generateToken(
                user.getEmail(),
                user.getUserId(),
                user.getRole().name(),
                user.getUniversity() != null ? user.getUniversity().getUniversityId() : null
            );
            
            return buildAuthResponse(user, token);
            
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
}
