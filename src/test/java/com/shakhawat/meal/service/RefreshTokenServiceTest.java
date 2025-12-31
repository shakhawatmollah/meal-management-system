package com.shakhawat.meal.service;

import com.shakhawat.meal.entity.Employee;
import com.shakhawat.meal.entity.RefreshToken;
import com.shakhawat.meal.exception.InvalidOperationException;
import com.shakhawat.meal.exception.ResourceNotFoundException;
import com.shakhawat.meal.repository.EmployeeRepository;
import com.shakhawat.meal.repository.RefreshTokenRepository;
import com.shakhawat.meal.security.JwtTokenProvider;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import java.time.Instant;
import java.util.Optional;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RefreshTokenServiceTest {

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private JwtTokenProvider tokenProvider;

    @InjectMocks
    private RefreshTokenService refreshTokenService;

    private Employee employee;
    private RefreshToken refreshToken;

    @BeforeEach
    void setUp() {
        employee = Employee.builder()
                .id(1L)
                .name("Test User")
                .email("test@example.com")
                .build();

        refreshToken = RefreshToken.builder()
                .id(1L)
                .employee(employee)
                .token("test-refresh-token")
                .expiryDate(Instant.now().plusMillis(86400000))
                .revoked(false)
                .build();
    }

    @Test
    @DisplayName("Should create refresh token successfully")
    void shouldCreateRefreshTokenSuccessfully() {
        // Given
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(tokenProvider.generateRefreshToken()).thenReturn("new-refresh-token");
        when(tokenProvider.getRefreshTokenExpiration()).thenReturn(2592000000L);
        when(refreshTokenRepository.save(any())).thenReturn(refreshToken);

        // When
        RefreshToken result = refreshTokenService.createRefreshToken(1L);

        // Then
        assertThat(result).isNotNull();
        verify(refreshTokenRepository).revokeAllByEmployeeId(1L);
        verify(refreshTokenRepository).save(any(RefreshToken.class));
    }

    @Test
    @DisplayName("Should verify token expiration - valid token")
    void shouldVerifyTokenExpiration_ValidToken() {
        // Given
        refreshToken.setExpiryDate(Instant.now().plusMillis(86400000));

        // When
        RefreshToken result = refreshTokenService.verifyExpiration(refreshToken);

        // Then
        assertThat(result).isNotNull();
    }

    @Test
    @DisplayName("Should throw exception for expired token")
    void shouldThrowExceptionForExpiredToken() {
        // Given
        refreshToken.setExpiryDate(Instant.now().minusMillis(86400000));

        // When & Then
        assertThatThrownBy(() -> refreshTokenService.verifyExpiration(refreshToken))
                .isInstanceOf(InvalidOperationException.class)
                .hasMessageContaining("expired");

        verify(refreshTokenRepository).delete(refreshToken);
    }

    @Test
    @DisplayName("Should throw exception for revoked token")
    void shouldThrowExceptionForRevokedToken() {
        // Given
        refreshToken.setRevoked(true);

        // When & Then
        assertThatThrownBy(() -> refreshTokenService.verifyExpiration(refreshToken))
                .isInstanceOf(InvalidOperationException.class)
                .hasMessageContaining("revoked");
    }

    @Test
    @DisplayName("Should revoke token successfully")
    void shouldRevokeTokenSuccessfully() {
        // Given
        when(refreshTokenRepository.findByToken("test-token"))
                .thenReturn(Optional.of(refreshToken));
        when(refreshTokenRepository.save(any())).thenReturn(refreshToken);

        // When
        refreshTokenService.revokeToken("test-token");

        // Then
        verify(refreshTokenRepository).save(argThat(token -> token.getRevoked()));
    }
}
