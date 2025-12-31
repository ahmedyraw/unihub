package com.example.unihub.dto.response;

import com.example.unihub.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    
    private String token;
    private Long userId;
    private String name;
    private String email;
    private UserRole role;
    private Integer points;
    private Long universityId;
    private String universityName;
    private String currentBadgeName;
    private Boolean hasPassword;
}
