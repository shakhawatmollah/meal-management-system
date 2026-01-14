package com.shakhawat.meal.dto;

import com.shakhawat.meal.entity.OrderStatus;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

public class MealOrderDTO {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {
        @NotNull(message = "Employee ID is required")
        private Long employeeId;

        @NotNull(message = "Meal ID is required")
        private Long mealId;

        @NotNull(message = "Order date is required")
        @Future(message = "Order date must be in the future")
        private LocalDate orderDate;

        @Builder.Default
        @Min(value = 1, message = "Quantity must be at least 1")
        private Integer quantity = 1;
    }

    @Data
    @Builder
    public static class Response {
        private Long id;
        private Long employeeId;
        private String employeeName;
        private Long mealId;
        private String mealName;
        private LocalDate orderDate;
        private Integer quantity;
        private BigDecimal totalPrice;
        private OrderStatus status;
    }
}
