package com.shakhawat.meal.dto;

import com.shakhawat.meal.entity.MealType;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;

public class MealDTO {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {
        @NotBlank(message = "Meal name is required")
        private String name;

        @NotBlank(message = "Description is required")
        private String description;

        @NotNull(message = "Meal type is required")
        private MealType type;

        @NotNull(message = "Price is required")
        @DecimalMin(value = "0.0", inclusive = false)
        private BigDecimal price;

        private Boolean available;
        private Integer dailyCapacity;
    }

    @Data
    @Builder
    public static class Response {
        private Long id;
        private String name;
        private String description;
        private MealType type;
        private BigDecimal price;
        private Boolean available;
        private Integer dailyCapacity;
    }
}
