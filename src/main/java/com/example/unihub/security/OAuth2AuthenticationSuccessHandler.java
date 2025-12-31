package com.example.unihub.security;

import com.example.unihub.model.User;
import com.example.unihub.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
@Slf4j
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtUtil jwtUtil;
    private final UserService userService;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    public OAuth2AuthenticationSuccessHandler(JwtUtil jwtUtil, @Lazy UserService userService) {
        this.jwtUtil = jwtUtil;
        this.userService = userService;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        
        try {
            String registrationId = getRegistrationId(request);
            log.info("OAuth2 authentication success for provider: {}", registrationId);
            log.debug("OAuth2 user attributes: {}", oAuth2User.getAttributes());
            
            User user = userService.processOAuth2User(oAuth2User, registrationId);
            String token = jwtUtil.generateToken(
                user.getEmail(), 
                user.getUserId(), 
                user.getRole().name(), 
                user.getUniversity() != null ? user.getUniversity().getUniversityId() : null
            );
            
            log.info("JWT token generated for user: {}", user.getEmail());
            
            String targetUrl = frontendUrl + "/#/oauth2/redirect?token=" + token;
            
            log.info("Redirecting to: {}", targetUrl);
            getRedirectStrategy().sendRedirect(request, response, targetUrl);
        } catch (Exception e) {
            log.error("OAuth2 authentication failed: {}", e.getMessage(), e);
            String errorUrl = frontendUrl + "/#/login?error=oauth2_error&message=" + e.getMessage();
            
            getRedirectStrategy().sendRedirect(request, response, errorUrl);
        }
    }

    private String getRegistrationId(HttpServletRequest request) {
        String requestUri = request.getRequestURI();
        return requestUri.substring(requestUri.lastIndexOf('/') + 1);
    }
}