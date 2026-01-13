package com.shakhawat.meal.controller;

import com.shakhawat.meal.dto.reports.*;
import com.shakhawat.meal.service.ReportService;
import com.shakhawat.meal.util.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
@Tag(name = "Management Reports", description = "API endpoints for generating management reports")
public class ReportController {
    
    private final ReportService reportService;
    
    @Operation(summary = "Generate daily operations report", 
               description = "Get comprehensive daily operations summary including orders, revenue, and employee activity")
    @GetMapping("/daily/{date}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CAFETERIA_STAFF')")
    public ResponseEntity<ApiResponse<DailyOperationsReport>> getDailyReport(
            @PathVariable @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate date) {
        DailyOperationsReport report = reportService.generateDailyReport(date);
        return ResponseEntity.ok(ApiResponse.success("Daily report generated successfully", report));
    }
    
    @Operation(summary = "Generate monthly financial report", 
               description = "Get comprehensive monthly financial analysis including revenue, costs, and budget utilization")
    @GetMapping("/monthly/{year}/{month}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CAFETERIA_STAFF')")
    public ResponseEntity<ApiResponse<MonthlyFinancialReport>> getMonthlyReport(
            @PathVariable Integer year,
            @PathVariable Integer month) {
        MonthlyFinancialReport report = reportService.generateMonthlyReport(year, month);
        return ResponseEntity.ok(ApiResponse.success("Monthly report generated successfully", report));
    }
    
    @Operation(summary = "Generate employee performance report", 
               description = "Get individual and department performance metrics with budget analysis")
    @GetMapping("/employee-performance/{year}/{month}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<EmployeePerformanceReport>> getEmployeePerformanceReport(
            @PathVariable Integer year,
            @PathVariable Integer month) {
        EmployeePerformanceReport report = reportService.generateEmployeePerformanceReport(year, month);
        return ResponseEntity.ok(ApiResponse.success("Employee performance report generated successfully", report));
    }
    
    @Operation(summary = "Generate meal performance report", 
               description = "Get detailed meal popularity analysis and revenue breakdown")
    @GetMapping("/meal-performance/{year}/{month}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CAFETERIA_STAFF')")
    public ResponseEntity<ApiResponse<MealPerformanceReport>> getMealPerformanceReport(
            @PathVariable Integer year,
            @PathVariable Integer month) {
        MealPerformanceReport report = reportService.generateMealPerformanceReport(year, month);
        return ResponseEntity.ok(ApiResponse.success("Meal performance report generated successfully", report));
    }
    
    @Operation(summary = "Generate audit report", 
               description = "Get comprehensive audit trail and activity analysis")
    @GetMapping("/audit/{startDate}/{endDate}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AuditReport>> getAuditReport(
            @PathVariable @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @PathVariable @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        AuditReport report = reportService.generateAuditReport(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success("Audit report generated successfully", report));
    }
}
