package com.shakhawat.meal.controller;

import com.shakhawat.meal.dto.ProfileDTO;
import com.shakhawat.meal.service.ProfileService;
import com.shakhawat.meal.util.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/profile")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Profile", description = "Current user profile APIs")
public class ProfileController {

    private final ProfileService profileService;

    @Operation(summary = "Get current user profile")
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ProfileDTO.Response>> getCurrentProfile() {
        return ResponseEntity.ok(ApiResponse.success(profileService.getCurrentProfile()));
    }

    @Operation(summary = "Update current user profile")
    @PutMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ProfileDTO.Response>> updateCurrentProfile(
            @Valid @RequestBody ProfileDTO.UpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully",
                profileService.updateCurrentProfile(request)));
    }
}
