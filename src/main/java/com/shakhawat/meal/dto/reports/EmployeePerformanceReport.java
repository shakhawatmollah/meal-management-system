package com.shakhawat.meal.dto.reports;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeePerformanceReport {
    
    private LocalDate reportPeriod;
    private List<EmployeeStats> employeeStats;
    private List<DepartmentStats> departmentStats;
    private List<BudgetAnalysis> budgetAnalysis;
    private List<EmployeeStats> topPerformers;
    private List<EmployeeStats> budgetOverruns;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EmployeeStats {
        private String employeeName;
        private String department;
        private BigDecimal monthlyBudget;
        private BigDecimal currentSpent;
        private Integer totalOrders;
        private BigDecimal avgOrderValue;
        private LocalDate lastOrderDate;
        private String mostOrderedMeal;
        private Integer timesOrdered;
        private Double utilizationPercentage;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DepartmentStats {
        private String department;
        private Integer totalEmployees;
        private Integer activeEmployees;
        private BigDecimal totalBudget;
        private BigDecimal totalSpent;
        private Double utilizationRate;
        private Integer totalOrders;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BudgetAnalysis {
        private String category; // "ON_TRACK", "OVER_BUDGET", "UNDER_UTILIZED"
        private Integer employeeCount;
        private BigDecimal totalBudget;
        private BigDecimal totalSpent;
        private Double percentageOfEmployees;
    }
}
