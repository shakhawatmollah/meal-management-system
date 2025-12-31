package com.shakhawat.meal.service;

import com.shakhawat.meal.dto.AuthDTO;
import com.shakhawat.meal.dto.EmployeeDTO;
import com.shakhawat.meal.entity.Employee;
import com.shakhawat.meal.entity.RefreshToken;
import com.shakhawat.meal.entity.Role;
import com.shakhawat.meal.exception.DuplicateResourceException;
import com.shakhawat.meal.repository.EmployeeRepository;
import com.shakhawat.meal.security.JwtTokenProvider;
import com.shakhawat.meal.util.EntityMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final EmployeeRepository employeeRepository;
    private final EntityMapper entityMapper;
    private final JwtTokenProvider tokenProvider;
    private final RefreshTokenService refreshTokenService;

    @Value("${jwt.expiration:900000}") // 15 minutes
    private long jwtExpiration;

    /**
     * Login with access and refresh tokens
     */
    @Transactional
    public AuthDTO.LoginResponse login(AuthDTO.LoginRequest request) {
        log.info("Login attempt for email: {}", request.getEmail());

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Generate access token
        String accessToken = tokenProvider.generateAccessToken(authentication);

        // Get employee
        Employee employee = employeeRepository.findByEmail(request.getEmail())
                .orElseThrow();

        // Create refresh token
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(employee.getId());

        // Reset failed login attempts on successful login
        if (employee.getFailedLoginAttempts() > 0) {
            employee.setFailedLoginAttempts(0);
            employee.setAccountNonLocked(true);
            employee.setLockTime(null);
            employeeRepository.save(employee);
        }

        Set<String> roles = employee.getRoles().stream()
                .map(Enum::name)
                .collect(Collectors.toSet());

        log.info("Login successful for email: {}", request.getEmail());

        return AuthDTO.LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .tokenType("Bearer")
                .expiresIn(jwtExpiration / 1000) // Convert to seconds
                .id(employee.getId())
                .email(employee.getEmail())
                .name(employee.getName())
                .roles(roles)
                .build();
    }

    /**
     * Refresh access token using refresh token
     */
    @Transactional
    public AuthDTO.RefreshTokenResponse refreshToken(AuthDTO.RefreshTokenRequest request) {
        log.info("Refresh token request received");

        String requestRefreshToken = request.getRefreshToken();

        // Find and verify refresh token
        RefreshToken refreshToken = refreshTokenService.findByToken(requestRefreshToken);
        refreshToken = refreshTokenService.verifyExpiration(refreshToken);

        // Get employee
        Employee employee = refreshToken.getEmployee();

        // Get roles
        String roles = employee.getRoles().stream()
                .map(Enum::name)
                .collect(Collectors.joining(","));

        // Generate new access token
        String newAccessToken = tokenProvider.generateAccessTokenFromEmail(
                employee.getEmail(),
                roles
        );

        // Optionally rotate refresh token (recommended for security)
        RefreshToken newRefreshToken = refreshTokenService.createRefreshToken(employee.getId());

        log.info("Access token refreshed for employee: {}", employee.getId());

        return AuthDTO.RefreshTokenResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken.getToken())
                .tokenType("Bearer")
                .expiresIn(jwtExpiration / 1000)
                .build();
    }

    /**
     * Logout - revoke refresh token
     */
    @Transactional
    public void logout(AuthDTO.LogoutRequest request) {
        log.info("Logout request received");

        refreshTokenService.revokeToken(request.getRefreshToken());
        SecurityContextHolder.clearContext();

        log.info("Logout successful");
    }

    /**
     * Register new employee
     */
    @Transactional
    public EmployeeDTO.Response register(AuthDTO.RegisterRequest request) {
        log.info("Registration attempt for email: {}", request.getEmail());

        if (employeeRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already registered");
        }

        EmployeeDTO.Request employeeRequest = EmployeeDTO.Request.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(request.getPassword())
                .department(request.getDepartment())
                .build();

        Employee employee = entityMapper.toEntity(employeeRequest);
        employee.addRole(Role.ROLE_EMPLOYEE);

        Employee savedEmployee = employeeRepository.save(employee);

        log.info("Registration successful for email: {}", request.getEmail());

        return entityMapper.toDto(savedEmployee);
    }
}
