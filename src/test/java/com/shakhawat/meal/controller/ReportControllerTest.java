package com.shakhawat.meal.controller;

import com.shakhawat.meal.dto.reports.*;
import com.shakhawat.meal.service.ReportService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
class ReportControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ReportService reportService;

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void shouldGenerateDailyReport() throws Exception {
        // Given
        LocalDate testDate = LocalDate.of(2026, 1, 15);
        DailyOperationsReport mockReport = DailyOperationsReport.builder()
            .reportDate(testDate)
            .totalOrders(10)
            .uniqueEmployees(5)
            .totalMealsAvailable(20)
            .dailyRevenue(150.0)
            .avgOrderValue(15.0)
            .peakHour("12:00")
            .budgetUtilizationRate(75.0)
            .build();

        when(reportService.generateDailyReport(testDate)).thenReturn(mockReport);

        // When & Then
        mockMvc.perform(get("/api/v1/reports/daily/{date}", testDate)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.reportDate").value("2026-01-15"))
                .andExpect(jsonPath("$.data.totalOrders").value(10))
                .andExpect(jsonPath("$.data.uniqueEmployees").value(5))
                .andExpect(jsonPath("$.data.dailyRevenue").value(150.0));
    }

    @Test
    @WithMockUser(roles = {"CAFETERIA_STAFF"})
    void shouldGenerateMonthlyReport() throws Exception {
        // Given
        int year = 2026;
        int month = 1;
        MonthlyFinancialReport mockReport = MonthlyFinancialReport.builder()
            .reportPeriod(LocalDate.of(year, month, 1))
            .monthlyRevenue(java.math.BigDecimal.valueOf(5000.0))
            .totalBudget(java.math.BigDecimal.valueOf(6000.0))
            .totalSpent(java.math.BigDecimal.valueOf(4500.0))
            .budgetVariance(java.math.BigDecimal.valueOf(1500.0))
            .budgetUtilizationRate(75.0)
            .build();

        when(reportService.generateMonthlyReport(year, month)).thenReturn(mockReport);

        // When & Then
        mockMvc.perform(get("/api/v1/reports/monthly/{year}/{month}", year, month)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.reportPeriod").value("2026-01-01"))
                .andExpect(jsonPath("$.data.monthlyRevenue").value(5000.0))
                .andExpect(jsonPath("$.data.budgetUtilizationRate").value(75.0));
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void shouldGenerateEmployeePerformanceReport() throws Exception {
        // Given
        int year = 2026;
        int month = 1;
        EmployeePerformanceReport mockReport = EmployeePerformanceReport.builder()
            .reportPeriod(LocalDate.of(year, month, 1))
            .build();

        when(reportService.generateEmployeePerformanceReport(year, month)).thenReturn(mockReport);

        // When & Then
        mockMvc.perform(get("/api/v1/reports/employee-performance/{year}/{month}", year, month)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.reportPeriod").value("2026-01-01"));
    }

    @Test
    @WithMockUser(roles = {"CAFETERIA_STAFF"})
    void shouldGenerateMealPerformanceReport() throws Exception {
        // Given
        int year = 2026;
        int month = 1;
        MealPerformanceReport mockReport = MealPerformanceReport.builder()
            .reportPeriod(LocalDate.of(year, month, 1))
            .build();

        when(reportService.generateMealPerformanceReport(year, month)).thenReturn(mockReport);

        // When & Then
        mockMvc.perform(get("/api/v1/reports/meal-performance/{year}/{month}", year, month)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.reportPeriod").value("2026-01-01"));
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void shouldGenerateAuditReport() throws Exception {
        // Given
        LocalDate startDate = LocalDate.of(2026, 1, 1);
        LocalDate endDate = LocalDate.of(2026, 1, 31);
        AuditReport mockReport = AuditReport.builder()
            .startDate(startDate)
            .endDate(endDate)
            .totalActions(100)
            .build();

        when(reportService.generateAuditReport(startDate, endDate)).thenReturn(mockReport);

        // When & Then
        mockMvc.perform(get("/api/v1/reports/audit/{startDate}/{endDate}", startDate, endDate)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.startDate").value("2026-01-01"))
                .andExpect(jsonPath("$.data.endDate").value("2026-01-31"))
                .andExpect(jsonPath("$.data.totalActions").value(100));
    }

    @Test
    @WithMockUser(roles = {"EMPLOYEE"})
    void shouldDenyAccessToEmployeePerformanceReport() throws Exception {
        // When & Then
        mockMvc.perform(get("/api/v1/reports/employee-performance/{year}/{month}", 2026, 1)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = {"EMPLOYEE"})
    void shouldDenyAccessToAuditReport() throws Exception {
        // When & Then
        mockMvc.perform(get("/api/v1/reports/audit/{startDate}/{endDate}", 
                LocalDate.of(2026, 1, 1), LocalDate.of(2026, 1, 31))
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    void shouldDenyAccessToUnauthenticatedUser() throws Exception {
        // When & Then
        mockMvc.perform(get("/api/v1/reports/daily/{date}", LocalDate.of(2026, 1, 15))
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }
}
