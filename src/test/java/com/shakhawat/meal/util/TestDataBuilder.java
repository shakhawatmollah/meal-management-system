package com.shakhawat.meal.util;

import com.shakhawat.meal.entity.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class TestDataBuilder {

    public static Employee.EmployeeBuilder createEmployeeBuilder() {
        return Employee.builder()
                .name("Test Employee")
                .email("test@example.com")
                .password("$2a$12$encoded_password")
                .department("IT")
                .status(EmployeeStatus.ACTIVE)
                .monthlyBudget(new BigDecimal("500.00"))
                .currentMonthSpent(BigDecimal.ZERO)
                .monthlyOrderLimit(30)
                .accountNonLocked(true)
                .failedLoginAttempts(0)
                .createdAt(LocalDateTime.now())
                .deleted(false);
    }

    public static Meal.MealBuilder createMealBuilder() {
        return Meal.builder()
                .name("Test Meal")
                .description("Test Description")
                .type(MealType.LUNCH)
                .price(new BigDecimal("10.00"))
                .available(true)
                .createdAt(LocalDateTime.now())
                .dailyCapacity(100);
    }

    public static MealOrder.MealOrderBuilder createMealOrderBuilder(Employee employee, Meal meal) {
        return MealOrder.builder()
                .employee(employee)
                .meal(meal)
                .orderDate(LocalDate.now().plusDays(1))
                .quantity(1)
                .totalPrice(meal.getPrice())
                .createdAt(LocalDateTime.now())
                .status(OrderStatus.PENDING);
    }
}
