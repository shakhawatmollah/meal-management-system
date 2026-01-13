package com.shakhawat.meal.dto.reports;

import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyOperationsReport {
    
    private LocalDate reportDate;
    private Integer totalOrders;
    private Integer uniqueEmployees;
    private Integer totalMealsAvailable;
    private Double dailyRevenue;
    private Double avgOrderValue;
    private String peakHour;
    private Double budgetUtilizationRate;
    
    // Detailed breakdowns
    private List<MealTypeStats> mealTypeBreakdown;
    private List<HourlyStats> hourlyBreakdown;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MealTypeStats {
        private String mealType;
        private Integer orderCount;
        private Double revenue;
        private Double percentage;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HourlyStats {
        private Integer hour;
        private Integer orderCount;
        private Double revenue;
    }
}
