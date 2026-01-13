package com.shakhawat.meal.dto.reports;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MonthlyFinancialReport {
    
    private LocalDate reportPeriod;
    private BigDecimal monthlyRevenue;
    private BigDecimal totalBudget;
    private BigDecimal totalSpent;
    private BigDecimal budgetVariance;
    private Double budgetUtilizationRate;
    
    // Detailed breakdowns
    private List<DepartmentStats> departmentBreakdown;
    private List<MealPerformance> mealPerformance;
    private List<EmployeeBudgetAnalysis> employeeBudgetAnalysis;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DepartmentStats {
        private String department;
        private Integer orderCount;
        private BigDecimal revenue;
        private Integer uniqueEmployees;
        private Double percentageOfTotal;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EmployeeBudgetAnalysis {
        private String employeeName;
        private String department;
        private BigDecimal monthlyBudget;
        private BigDecimal currentSpent;
        private BigDecimal remainingBudget;
        private Double utilizationPercentage;
        private String status; // "ON_TRACK", "OVER_BUDGET", "UNDER_UTILIZED"
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MealPerformance {
        private String mealName;
        private String mealType;
        private BigDecimal unitPrice;
        private Integer timesOrdered;
        private BigDecimal totalRevenue;
        private Double avgOrderValue;
    }
}
