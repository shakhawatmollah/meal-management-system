package com.shakhawat.meal.dto;

import com.shakhawat.meal.entity.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class DashboardDTO {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long totalOrders;
        private Long totalMeals;
        private Long totalEmployees;
        private Long todayOrders;
        private BigDecimal monthlyRevenue;
        private List<TopMeal> topMeals;
        private List<RecentOrder> recentOrders;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopMeal {
        private Long mealId;
        private String mealName;
        private Long orderCount;
        private BigDecimal totalRevenue;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentOrder {
        private Long id;
        private EmployeeSummary employee;
        private MealSummary meal;
        private LocalDate orderDate;
        private Integer quantity;
        private BigDecimal totalPrice;
        private OrderStatus status;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EmployeeSummary {
        private Long id;
        private String name;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MealSummary {
        private Long id;
        private String name;
    }
}
