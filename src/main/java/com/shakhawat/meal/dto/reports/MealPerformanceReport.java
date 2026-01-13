package com.shakhawat.meal.dto.reports;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MealPerformanceReport {
    
    private LocalDate reportPeriod;
    private List<MealStats> mealPerformance;
    private List<MealTypeStats> mealTypeBreakdown;
    private List<AvailabilityStats> availabilityAnalysis;
    private List<MealStats> topMeals;
    private List<MealStats> leastPopularMeals;
    private List<MealTypeRevenue> revenueByMealType;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MealStats {
        private String mealName;
        private String mealType;
        private BigDecimal unitPrice;
        private Integer timesOrdered;
        private Integer totalQuantity;
        private BigDecimal totalRevenue;
        private Double avgOrderValue;
        private Boolean currentlyAvailable;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MealTypeStats {
        private String mealType;
        private Integer uniqueMeals;
        private Integer totalOrders;
        private BigDecimal totalRevenue;
        private Double avgOrderValue;
        private Double percentageOfTotalRevenue;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AvailabilityStats {
        private String mealType;
        private Integer totalMeals;
        private Integer availableMeals;
        private Integer unavailableMeals;
        private Double availabilityPercentage;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MealTypeRevenue {
        private String mealType;
        private BigDecimal revenue;
        private Double percentageOfTotal;
    }
}
