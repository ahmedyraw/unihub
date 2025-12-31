package com.example.unihub.service;

import com.example.unihub.enums.UserRole;
import com.example.unihub.exception.ResourceNotFoundException;
import com.example.unihub.model.Badge;
import com.example.unihub.model.University;
import com.example.unihub.model.User;
import com.example.unihub.model.UserBadge;
import com.example.unihub.repository.BadgeRepository;
import com.example.unihub.repository.UniversityRepository;
import com.example.unihub.repository.UserBadgeRepository;
import com.example.unihub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final BadgeRepository badgeRepository;
    private final UniversityRepository universityRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Get user by ID
     */
    public User getUserById(Long userId) {
        return userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
    }

    /**
     * Get user by email
     */
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    /**
     * Get all users
     */
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    /**
     * Get users by university
     */
    public List<User> getUsersByUniversity(Long universityId) {
        return userRepository.findByUniversityUniversityId(universityId);
    }

    /**
     * Create a new user (Admin only)
     */
    @Transactional
    public User createUser(String name, String email, String password, UserRole role, Long universityId) {
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already registered");
        }
        
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setRole(role != null ? role : UserRole.STUDENT);
        user.setPoints(0);
        
        if (universityId != null) {
            University university = universityRepository.findById(universityId)
                .orElseThrow(() -> new IllegalArgumentException("University not found"));
            user.setUniversity(university);
        }
        
        Badge defaultBadge = badgeRepository.findTopByPointsThresholdLessThanEqualOrderByPointsThresholdDesc(0)
            .orElse(null);
        user.setCurrentBadge(defaultBadge);
        
        return userRepository.save(user);
    }

    /**
     * Update user profile
     */
    @Transactional
    public User updateUser(Long userId, String name, String email) {
        User user = getUserById(userId);
        
        if (name != null && !name.isBlank()) {
            user.setName(name);
        }
        
        if (email != null && !email.isBlank() && !email.equals(user.getEmail())) {
            // Check if new email already exists
            if (userRepository.existsByEmail(email)) {
                throw new IllegalArgumentException("Email already in use");
            }
            user.setEmail(email);
        }
        
        return userRepository.save(user);
    }

    /**
     * Change user password
     */
    @Transactional
    public void changePassword(Long userId, String oldPassword, String newPassword) {
        User user = getUserById(userId);
        
        // Verify old password
        if (!passwordEncoder.matches(oldPassword, user.getPasswordHash())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }
        
        // Set new password
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        log.info("Password changed for user {}", userId);
    }

    /**
     * Set password for OAuth2 users
     */
    @Transactional
    public void setPassword(Long userId, String newPassword) {
        User user = getUserById(userId);
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        log.info("Password set for OAuth2 user {}", userId);
    }

    /**
     * Update user university
     */
    @Transactional
    public User updateUniversity(Long userId, Long universityId) {
        User user = getUserById(userId);
        
        if (universityId != null) {
            University university = universityRepository.findById(universityId)
                .orElseThrow(() -> new IllegalArgumentException("University not found"));
            user.setUniversity(university);
        } else {
            user.setUniversity(null);
        }
        
        return userRepository.save(user);
    }

    /**
     * Get all badges earned by user (historical)
     */
    public List<UserBadge> getUserBadges(Long userId) {
        return userBadgeRepository.findByUserUserIdOrderByEarnedAtDesc(userId);
    }

    /**
     * Get all available badges with user's progress
     */
    public List<Badge> getAllBadgesWithProgress(Long userId) {
        User user = getUserById(userId);
        List<Badge> allBadges = badgeRepository.findAllByOrderByPointsThresholdAsc();
        
        // The frontend can determine if each badge is earned by comparing
        // user's points with badge threshold
        return allBadges;
    }

    /**
     * Process OAuth2 user login/registration
     */
    @Transactional
    public User processOAuth2User(OAuth2User oAuth2User, String registrationId) {
        String email = getEmailFromOAuth2User(oAuth2User, registrationId);
        String name = getNameFromOAuth2User(oAuth2User, registrationId);
        
        log.info("Processing OAuth2 user - Email: {}, Name: {}, Provider: {}", email, name, registrationId);
        
        Optional<User> existingUser = userRepository.findByEmail(email);
        
        if (existingUser.isPresent()) {
            log.info("Existing user found: {}", email);
            return existingUser.get();
        }
        
        log.info("Creating new OAuth2 user: {}", email);
        
        User newUser = new User();
        newUser.setName(name);
        newUser.setEmail(email);
        newUser.setPasswordHash("");
        newUser.setRole(UserRole.STUDENT);
        newUser.setPoints(0);
        
        Badge defaultBadge = badgeRepository.findTopByPointsThresholdLessThanEqualOrderByPointsThresholdDesc(0)
            .orElse(null);
        newUser.setCurrentBadge(defaultBadge);
        
        User savedUser = userRepository.save(newUser);
        log.info("OAuth2 user created successfully with ID: {}", savedUser.getUserId());
        
        return savedUser;
    }
    
    private String getEmailFromOAuth2User(OAuth2User oAuth2User, String registrationId) {
        if ("google".equals(registrationId)) {
            return oAuth2User.getAttribute("email");
        } else if ("github".equals(registrationId)) {
            log.info("GitHub OAuth2 attributes: {}", oAuth2User.getAttributes());
            String email = oAuth2User.getAttribute("email");
            log.info("GitHub email from attributes: {}", email);
            if (email != null && !email.isEmpty()) {
                return email;
            }
            // Fallback: use GitHub noreply email
            String login = oAuth2User.getAttribute("login");
            Integer id = oAuth2User.getAttribute("id");
            if (login != null && id != null) {
                log.info("Using GitHub noreply email for user: {}", login);
                return id + "+" + login + "@users.noreply.github.com";
            }
            throw new IllegalArgumentException("Unable to retrieve email from GitHub");
        }
        throw new IllegalArgumentException("Unsupported OAuth2 provider: " + registrationId);
    }
    
    private String getNameFromOAuth2User(OAuth2User oAuth2User, String registrationId) {
        if ("google".equals(registrationId)) {
            return oAuth2User.getAttribute("name");
        } else if ("github".equals(registrationId)) {
            String name = oAuth2User.getAttribute("name");
            return name != null ? name : oAuth2User.getAttribute("login");
        }
        throw new IllegalArgumentException("Unsupported OAuth2 provider: " + registrationId);
    }

    /**
     * Deactivate/Delete a user (Admin only)
     */
    @Transactional
    public void deactivateUser(Long userId) {
        User user = getUserById(userId);
        log.info("Deleting user {} ({})", userId, user.getEmail());
        
        // Delete user - cascading will handle related entities
        userRepository.delete(user);
        
        log.info("User {} successfully deleted", userId);
    }
}
