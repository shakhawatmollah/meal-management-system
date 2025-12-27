package com.shakhawat.meal.controller;

import com.shakhawat.meal.dto.AuthDTO;
import com.shakhawat.meal.dto.EmployeeDTO;
import com.shakhawat.meal.entity.Role;
import com.shakhawat.meal.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.context.ActiveProfiles;
import java.util.Set;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@ActiveProfiles("test")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AuthService authService;

    @Nested
    @DisplayName("Login Tests")
    class LoginTests {

        @Test
        @DisplayName("Should login successfully with valid credentials")
        void shouldLoginSuccessfullyWithValidCredentials() throws Exception {
            // Given
            AuthDTO.LoginRequest loginRequest = new AuthDTO.LoginRequest(
                    "admin@shakhawat.com", "Admin@123");

            AuthDTO.LoginResponse loginResponse = AuthDTO.LoginResponse.builder()
                    .token("jwt.token.here")
                    .type("Bearer")
                    .id(1L)
                    .email("admin@shakhawat.com")
                    .name("Admin")
                    .roles(Set.of("ROLE_ADMIN"))
                    .build();

            when(authService.login(any())).thenReturn(loginResponse);

            // When & Then
            mockMvc.perform(post("/api/v1/auth/login")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(loginRequest)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.token").value("jwt.token.here"))
                    .andExpect(jsonPath("$.data.email").value("admin@shakhawat.com"));

            verify(authService).login(any(AuthDTO.LoginRequest.class));
        }

        @Test
        @DisplayName("Should return 400 when email is invalid")
        void shouldReturn400WhenEmailIsInvalid() throws Exception {
            // Given
            AuthDTO.LoginRequest loginRequest = new AuthDTO.LoginRequest(
                    "invalid-email", "Admin@123");

            // When & Then
            mockMvc.perform(post("/api/v1/auth/login")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(loginRequest)))
                    .andExpect(status().isBadRequest());

            verify(authService, never()).login(any());
        }

        @Test
        @DisplayName("Should return 400 when password is empty")
        void shouldReturn400WhenPasswordIsEmpty() throws Exception {
            // Given
            AuthDTO.LoginRequest loginRequest = new AuthDTO.LoginRequest(
                    "admin@shakhawat.com", "");

            // When & Then
            mockMvc.perform(post("/api/v1/auth/login")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(loginRequest)))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("Registration Tests")
    class RegistrationTests {

        @Test
        @DisplayName("Should register user successfully")
        void shouldRegisterUserSuccessfully() throws Exception {
            // Given
            AuthDTO.RegisterRequest registerRequest = new AuthDTO.RegisterRequest(
                    "John Doe",
                    "john@shakhawat.com",
                    "Password@123",
                    "IT"
            );

            EmployeeDTO.Response employeeResponse = EmployeeDTO.Response.builder()
                    .id(1L)
                    .name("John Doe")
                    .email("john@shakhawat.com")
                    .department("IT")
                    .roles(Set.of(Role.ROLE_EMPLOYEE))
                    .build();

            when(authService.register(any())).thenReturn(employeeResponse);

            // When & Then
            mockMvc.perform(post("/api/v1/auth/register")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(registerRequest)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.name").value("John Doe"))
                    .andExpect(jsonPath("$.data.email").value("john@shakhawat.com"));

            verify(authService).register(any(AuthDTO.RegisterRequest.class));
        }

        @Test
        @DisplayName("Should return 400 when password is too short")
        void shouldReturn400WhenPasswordIsTooShort() throws Exception {
            // Given
            AuthDTO.RegisterRequest registerRequest = new AuthDTO.RegisterRequest(
                    "John Doe",
                    "john@shakhawat.com",
                    "Pass@1", // Only 6 characters
                    "IT"
            );

            // When & Then
            mockMvc.perform(post("/api/v1/auth/register")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(registerRequest)))
                    .andExpect(status().isBadRequest());
        }
    }
}
