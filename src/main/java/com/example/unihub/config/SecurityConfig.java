package com.example.unihub.config;

import com.example.unihub.security.CustomUserDetailsService;
import com.example.unihub.security.JwtAuthenticationFilter;
import com.example.unihub.security.OAuth2AuthenticationSuccessHandler;
import com.example.unihub.security.RateLimitingFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final RateLimitingFilter rateLimitingFilter;
    private final CorsConfigurationSource corsConfigurationSource;
    private final OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource))
            .authorizeHttpRequests(auth -> auth
                // Preflight
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // Public endpoints
                .requestMatchers("/api/auth/login", "/api/auth/register", "/api/auth/forgot-password", 
                                "/api/auth/reset-password", "/api/auth/validate-reset-token",
                                "/api/auth/verify-email", "/api/auth/resend-verification").permitAll()
                .requestMatchers("/login/oauth2/**", "/oauth2/**").permitAll()
                .requestMatchers("/api/auth/session").authenticated()
                .requestMatchers("/api/auth/logout").authenticated()
                .requestMatchers("/ws/**").permitAll()
                .requestMatchers("/api/gamification/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/admin/universities").permitAll()

                // Events - public reads, authenticated writes
                .requestMatchers(HttpMethod.GET, "/api/events/my-events", "/api/events/my-participations").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/events/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/events", "/api/events/*/join", "/api/events/*/leave").authenticated()
                .requestMatchers(HttpMethod.PUT, "/api/events/*").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/events/*").authenticated()

                // Admin endpoints (except universities list)
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                
                // Supervisor and Admin endpoints
                .requestMatchers("/api/events/*/approve", "/api/events/*/reject", "/api/events/*/cancel").hasAnyRole("SUPERVISOR", "ADMIN")
                .requestMatchers("/api/blogs/*/approve", "/api/blogs/*/reject").hasAnyRole("SUPERVISOR", "ADMIN")

                // Blogs - public reads, authenticated writes
                .requestMatchers(HttpMethod.GET, "/api/blogs/my-blogs").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/blogs/pending").hasAnyRole("SUPERVISOR", "ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/blogs/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/blogs").authenticated()
                .requestMatchers(HttpMethod.PUT, "/api/blogs/*").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/blogs/*").authenticated()
                
                // Reports - Students can submit, Supervisors/Admins can view and manage
                .requestMatchers("/api/reports/blogs/*/review", "/api/reports/blogs/*/dismiss").hasAnyRole("SUPERVISOR", "ADMIN")
                .requestMatchers("/api/reports/events/*/review", "/api/reports/events/*/dismiss").hasAnyRole("SUPERVISOR", "ADMIN")
                // Allow students to submit reports (POST)
                .requestMatchers(HttpMethod.POST, "/api/reports/blogs/*", "/api/reports/events/*").authenticated()
                // List reports (GET) - only Supervisors/Admins
                .requestMatchers(HttpMethod.GET, "/api/reports/blogs", "/api/reports/events").hasAnyRole("SUPERVISOR", "ADMIN")
                .requestMatchers("/api/reports/**").authenticated()
                
                // All authenticated users
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .oauth2Login(oauth2 -> oauth2
                .successHandler(oAuth2AuthenticationSuccessHandler)
            )
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint((request, response, authException) -> {
                    response.sendError(401, "Unauthorized");
                })
            )
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(rateLimitingFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
