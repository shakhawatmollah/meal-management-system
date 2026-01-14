package com.shakhawat.meal.service;

import com.shakhawat.meal.dto.reports.*;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class ReportServiceImplTest {

    @Autowired
    private ReportService reportService;

    @Test
    void shouldGenerateDailyReport() {
        // Given
        LocalDate testDate = LocalDate.of(2026, 1, 15);
        
        // When
        DailyOperationsReport report = reportService.generateDailyReport(testDate);
        
        // Then
        assertThat(report).isNotNull();
        assertThat(report.getReportDate()).isEqualTo(testDate);
        assertThat(report.getTotalOrders()).isGreaterThanOrEqualTo(0);
        assertThat(report.getDailyRevenue()).isGreaterThanOrEqualTo(0.0);
        assertThat(report.getUniqueEmployees()).isGreaterThanOrEqualTo(0);
        assertThat(report.getTotalMealsAvailable()).isGreaterThanOrEqualTo(0);
    }

    @Test
    void shouldGenerateMonthlyReport() {
        // Given
        int year = 2026;
        int month = 1;
        
        // When
        MonthlyFinancialReport report = reportService.generateMonthlyReport(year, month);
        
        // Then
        assertThat(report).isNotNull();
        assertThat(report.getReportPeriod().getYear()).isEqualTo(year);
        assertThat(report.getReportPeriod().getMonthValue()).isEqualTo(month);
        assertThat(report.getMonthlyRevenue()).isGreaterThanOrEqualTo(BigDecimal.ZERO);
        assertThat(report.getTotalBudget()).isGreaterThanOrEqualTo(BigDecimal.ZERO);
        assertThat(report.getTotalSpent()).isGreaterThanOrEqualTo(BigDecimal.ZERO);
    }

    @Test
    void shouldGenerateEmployeePerformanceReport() {
        // Given
        int year = 2026;
        int month = 1;
        
        // When
        EmployeePerformanceReport report = reportService.generateEmployeePerformanceReport(year, month);
        
        // Then
        assertThat(report).isNotNull();
        assertThat(report.getReportPeriod().getYear()).isEqualTo(year);
        assertThat(report.getReportPeriod().getMonthValue()).isEqualTo(month);
        assertThat(report.getEmployeeStats()).isNotNull();
        assertThat(report.getDepartmentStats()).isNotNull();
        assertThat(report.getBudgetAnalysis()).isNotNull();
    }

    @Test
    void shouldGenerateMealPerformanceReport() {
        // Given
        int year = 2026;
        int month = 1;
        
        // When
        MealPerformanceReport report = reportService.generateMealPerformanceReport(year, month);
        
        // Then
        assertThat(report).isNotNull();
        assertThat(report.getReportPeriod().getYear()).isEqualTo(year);
        assertThat(report.getReportPeriod().getMonthValue()).isEqualTo(month);
        assertThat(report.getMealPerformance()).isNotNull();
        assertThat(report.getMealTypeBreakdown()).isNotNull();
        assertThat(report.getAvailabilityAnalysis()).isNotNull();
    }

    @Test
    void shouldGenerateAuditReport() {
        // Given
        LocalDate startDate = LocalDate.of(2026, 1, 1);
        LocalDate endDate = LocalDate.of(2026, 1, 31);
        
        // When
        AuditReport report = reportService.generateAuditReport(startDate, endDate);
        
        // Then
        assertThat(report).isNotNull();
        assertThat(report.getStartDate()).isEqualTo(startDate);
        assertThat(report.getEndDate()).isEqualTo(endDate);
        assertThat(report.getTotalActions()).isGreaterThanOrEqualTo(0);
        assertThat(report.getActionBreakdown()).isNotNull();
        assertThat(report.getUserActivity()).isNotNull();
    }

    @Test
    void shouldCalculateBudgetUtilizationCorrectly() {
        // Given
        LocalDate testDate = LocalDate.now();
        
        // When
        DailyOperationsReport report = reportService.generateDailyReport(testDate);
        
        // Then
        assertThat(report.getBudgetUtilizationRate()).isBetween(0.0, 200.0);
    }

    @Test
    void shouldHandleEmptyDataGracefully() {
        // Given
        LocalDate futureDate = LocalDate.now().plusYears(1);
        
        // When
        DailyOperationsReport report = reportService.generateDailyReport(futureDate);
        
        // Then
        assertThat(report).isNotNull();
        assertThat(report.getTotalOrders()).isEqualTo(0);
        assertThat(report.getDailyRevenue()).isEqualTo(0.0);
        assertThat(report.getUniqueEmployees()).isEqualTo(0);
    }
}
