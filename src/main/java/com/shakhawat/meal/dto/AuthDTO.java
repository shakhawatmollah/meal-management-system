package com.shakhawat.meal.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.util.Set;

public class AuthDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoginRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Password is required")
        private String password;
    }

    @Data
    @Builder
    @AllArgsConstructor
    public static class LoginResponse {
        private String accessToken;
        private String refreshToken;
        private String tokenType = "Bearer";
        private Long expiresIn; // seconds
        private Long id;
        private String email;
        private String name;
        private Set<String> roles;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RefreshTokenRequest {
        @NotBlank(message = "Refresh token is required")
        private String refreshToken;
    }

    @Data
    @Builder
    @AllArgsConstructor
    public static class RefreshTokenResponse {
        private String accessToken;
        private String refreshToken;
        private String tokenType = "Bearer";
        private Long expiresIn; // seconds
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RegisterRequest {
        @NotBlank(message = "Name is required")
        @Size(min = 2, max = 100)
        private String name;

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Password is required")
        @Size(min = 8, message = "Password must be at least 8 characters")
        private String password;

        @NotBlank(message = "Department is required")
        private String department;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LogoutRequest {
        @NotBlank(message = "Refresh token is required")
        private String refreshToken;
    }
}
