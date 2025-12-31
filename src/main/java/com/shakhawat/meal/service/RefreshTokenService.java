package com.shakhawat.meal.service;

import com.shakhawat.meal.entity.Employee;
import com.shakhawat.meal.entity.RefreshToken;
import com.shakhawat.meal.exception.InvalidOperationException;
import com.shakhawat.meal.exception.ResourceNotFoundException;
import com.shakhawat.meal.repository.EmployeeRepository;
import com.shakhawat.meal.repository.RefreshTokenRepository;
import com.shakhawat.meal.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;

@Service
@RequiredArgsConstructor
@Slf4j
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final EmployeeRepository employeeRepository;
    private final JwtTokenProvider tokenProvider;

    /**
     * Create refresh token for employee
     */
    @Transactional
    public RefreshToken createRefreshToken(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", employeeId));

        // Revoke existing tokens for this employee
        refreshTokenRepository.revokeAllByEmployeeId(employeeId);

        // Create new refresh token
        RefreshToken refreshToken = RefreshToken.builder()
                .employee(employee)
                .token(tokenProvider.generateRefreshToken())
                .expiryDate(Instant.now().plusMillis(tokenProvider.getRefreshTokenExpiration()))
                .revoked(false)
                .build();

        refreshToken = refreshTokenRepository.save(refreshToken);

        log.info("Created refresh token for employee: {}", employeeId);

        return refreshToken;
    }

    /**
     * Find refresh token by token string
     */
    @Transactional(readOnly = true)
    public RefreshToken findByToken(String token) {
        return refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("RefreshToken", token));
    }

    /**
     * Verify refresh token validity
     */
    @Transactional
    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token.isExpired()) {
            refreshTokenRepository.delete(token);
            throw new InvalidOperationException(
                    "Refresh token expired. Please login again.");
        }

        if (token.getRevoked()) {
            throw new InvalidOperationException(
                    "Refresh token has been revoked. Please login again.");
        }

        return token;
    }

    /**
     * Revoke refresh token
     */
    @Transactional
    public void revokeToken(String token) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("RefreshToken", token));

        refreshToken.setRevoked(true);
        refreshTokenRepository.save(refreshToken);

        log.info("Revoked refresh token for employee: {}", refreshToken.getEmployee().getId());
    }

    /**
     * Revoke all tokens for an employee
     */
    @Transactional
    public void revokeAllTokensForEmployee(Long employeeId) {
        refreshTokenRepository.revokeAllByEmployeeId(employeeId);
        log.info("Revoked all refresh tokens for employee: {}", employeeId);
    }

    /**
     * Clean up expired tokens (scheduled task)
     */
    @Scheduled(cron = "0 0 2 * * ?") // Run at 2 AM daily
    @Transactional
    public void cleanUpExpiredTokens() {
        log.info("Starting cleanup of expired refresh tokens");
        refreshTokenRepository.deleteExpiredTokens(Instant.now());
        log.info("Completed cleanup of expired refresh tokens");
    }
}
