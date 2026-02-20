package com.shakhawat.meal.dto;

import com.shakhawat.meal.entity.EmployeeStatus;
import com.shakhawat.meal.entity.Role;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.Set;

public class EmployeeDTO {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {
        @NotBlank(message = "Name is required")
        @Size(min = 2, max = 100)
        private String name;

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        // Required on create; optional on update.
        private String password;

        @NotBlank(message = "Department is required")
        private String department;

        private EmployeeStatus status;
        private Set<Role> roles;
        private BigDecimal monthlyBudget;
        private Integer monthlyOrderLimit;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {
        @NotBlank(message = "Name is required")
        @Size(min = 2, max = 100)
        private String name;

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Department is required")
        private String department;

        private EmployeeStatus status;
        private Set<Role> roles;
        private BigDecimal monthlyBudget;
        private Integer monthlyOrderLimit;
    }

    @Data
    @Builder
    public static class Response {
        private Long id;
        private String name;
        private String email;
        private String department;
        private EmployeeStatus status;
        private Set<Role> roles;
        private BigDecimal monthlyBudget;
        private BigDecimal currentMonthSpent;
        private Integer monthlyOrderLimit;
        private Boolean accountNonLocked;
    }
}
