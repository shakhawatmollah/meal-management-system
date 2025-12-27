package com.shakhawat.meal.controller;

import com.shakhawat.meal.dto.AuthDTO;
import com.shakhawat.meal.dto.EmployeeDTO;
import com.shakhawat.meal.service.AuthService;
import com.shakhawat.meal.util.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication APIs")
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "User login", description = "Authenticate user and get JWT token")
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthDTO.LoginResponse>> login(
            @Valid @RequestBody AuthDTO.LoginRequest request) {
        AuthDTO.LoginResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @Operation(summary = "User registration", description = "Register a new employee")
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<EmployeeDTO.Response>> register(
            @Valid @RequestBody AuthDTO.RegisterRequest request) {
        EmployeeDTO.Response response = authService.register(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Registration successful", response));
    }
}
