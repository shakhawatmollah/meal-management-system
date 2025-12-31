package com.shakhawat.meal.controller;

import com.shakhawat.meal.dto.AuthDTO;
import com.shakhawat.meal.dto.EmployeeDTO;
import com.shakhawat.meal.entity.Role;
import com.shakhawat.meal.security.JwtAuthenticationFilter;
import com.shakhawat.meal.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Set;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(
        controllers = AuthController.class,
        excludeFilters = @ComponentScan.Filter(
                type = FilterType.ASSIGNABLE_TYPE,
                classes = {JwtAuthenticationFilter.class}
        )
)
@ActiveProfiles("test")
@Import(ObjectMapper.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Nested
    @DisplayName("Login Tests")
    class LoginTests {

        @Test
        @DisplayName("Should login successfully")
        void shouldLoginSuccessfully() throws Exception {
            // Given
            AuthDTO.LoginRequest loginRequest = new AuthDTO.LoginRequest("admin@shakhawatmollah.com", "12345678");

            AuthDTO.LoginResponse loginResponse = AuthDTO.LoginResponse.builder()
                    .accessToken("jwt.access.token.here")
                    .refreshToken("refresh-token-uuid")
                    .email("admin@shakhawatmollah.com")
                    .expiresIn(900L)
                    .build();

            when(authService.login(any(AuthDTO.LoginRequest.class))).thenReturn(loginResponse);

            // When & Then - ADD .andDo(print()) to see the response
            MvcResult result = mockMvc.perform(post("/api/v1/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(loginRequest)))
                    .andDo(print()) // ← Add this to see what's happening
                    .andExpect(status().isOk())
                    .andReturn();

            // Print the response body
            String responseBody = result.getResponse().getContentAsString();
            System.out.println("Response: " + responseBody);
        }

        @Test
        @DisplayName("Should login successfully with valid credentials")
        void shouldLoginSuccessfullyWithValidCredentials() throws Exception {
            // Given
            AuthDTO.LoginRequest loginRequest = new AuthDTO.LoginRequest(
                    "admin@shakhawatmollah.com",
                    "12345678"
            );

            AuthDTO.LoginResponse loginResponse = AuthDTO.LoginResponse.builder()
                    .accessToken("jwt.access.token.here")
                    .refreshToken("refresh-token-uuid")
                    .tokenType("Bearer")
                    .expiresIn(900L)
                    .id(1L)
                    .email("admin@shakhawatmollah.com")
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
                    .andExpect(jsonPath("$.data.accessToken").value("jwt.access.token.here"))
                    .andExpect(jsonPath("$.data.refreshToken").value("refresh-token-uuid"))
                    .andExpect(jsonPath("$.data.email").value("admin@shakhawatmollah.com"))
                    .andExpect(jsonPath("$.data.expiresIn").value(900));

            verify(authService).login(any(AuthDTO.LoginRequest.class));
        }

        @Test
        @DisplayName("Should return 400 when email is invalid")
        void shouldReturn400WhenEmailIsInvalid() throws Exception {
            // Given
            AuthDTO.LoginRequest loginRequest = new AuthDTO.LoginRequest(
                    "invalid-email",
                    "12345678"
            );

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
                    "admin@shakhawatmollah.com",
                    ""
            );

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
                    "john@shakhawatmollah.com",
                    "Password@123",
                    "IT"
            );

            EmployeeDTO.Response employeeResponse = EmployeeDTO.Response.builder()
                    .id(1L)
                    .name("John Doe")
                    .email("john@shakhawatmollah.com")
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
                    .andExpect(jsonPath("$.data.email").value("john@shakhawatmollah.com"));

            verify(authService).register(any(AuthDTO.RegisterRequest.class));
        }

        @Test
        @DisplayName("Should return 400 when password is too short")
        void shouldReturn400WhenPasswordIsTooShort() throws Exception {
            // Given
            AuthDTO.RegisterRequest registerRequest = new AuthDTO.RegisterRequest(
                    "John Doe",
                    "john@shakhawatmollah.com",
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

        @Test
        @DisplayName("Should return 400 when name is missing")
        void shouldReturn400WhenNameIsMissing() throws Exception {
            // Given
            AuthDTO.RegisterRequest registerRequest = new AuthDTO.RegisterRequest(
                    "",
                    "john@shakhawatmollah.com",
                    "Password@123",
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

    @Nested
    @DisplayName("Refresh Token Tests")
    class RefreshTokenTests {

        @Test
        @DisplayName("Should refresh token successfully")
        void shouldRefreshTokenSuccessfully() throws Exception {
            // Given
            AuthDTO.RefreshTokenRequest refreshRequest = new AuthDTO.RefreshTokenRequest(
                    "valid-refresh-token-uuid"
            );

            AuthDTO.RefreshTokenResponse refreshResponse = AuthDTO.RefreshTokenResponse.builder()
                    .accessToken("new.jwt.access.token")
                    .refreshToken("new-refresh-token-uuid")
                    .tokenType("Bearer")
                    .expiresIn(900L)
                    .build();

            when(authService.refreshToken(any())).thenReturn(refreshResponse);

            // When & Then
            mockMvc.perform(post("/api/v1/auth/refresh")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(refreshRequest)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.accessToken").value("new.jwt.access.token"))
                    .andExpect(jsonPath("$.data.refreshToken").value("new-refresh-token-uuid"));

            verify(authService).refreshToken(any(AuthDTO.RefreshTokenRequest.class));
        }

        @Test
        @DisplayName("Should return 400 when refresh token is empty")
        void shouldReturn400WhenRefreshTokenIsEmpty() throws Exception {
            // Given
            AuthDTO.RefreshTokenRequest refreshRequest = new AuthDTO.RefreshTokenRequest("");

            // When & Then
            mockMvc.perform(post("/api/v1/auth/refresh")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(refreshRequest)))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("Logout Tests")
    class LogoutTests {

        @Test
        @DisplayName("Should logout successfully")
        void shouldLogoutSuccessfully() throws Exception {
            // Given
            AuthDTO.LogoutRequest logoutRequest = new AuthDTO.LogoutRequest(
                    "valid-refresh-token-uuid"
            );

            doNothing().when(authService).logout(any());

            // When & Then
            mockMvc.perform(post("/api/v1/auth/logout")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(logoutRequest)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.message").value("Logout successful"));

            verify(authService).logout(any(AuthDTO.LogoutRequest.class));
        }
    }
}
