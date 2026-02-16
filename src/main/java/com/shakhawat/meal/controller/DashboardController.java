package com.shakhawat.meal.controller;

import com.shakhawat.meal.dto.DashboardDTO;
import com.shakhawat.meal.service.DashboardService;
import com.shakhawat.meal.util.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Dashboard", description = "Dashboard overview APIs")
public class DashboardController {

    private final DashboardService dashboardService;

    @Operation(summary = "Get dashboard overview stats")
    @GetMapping
    public ResponseEntity<ApiResponse<DashboardDTO.Response>> getDashboardStats() {
        DashboardDTO.Response response = dashboardService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
