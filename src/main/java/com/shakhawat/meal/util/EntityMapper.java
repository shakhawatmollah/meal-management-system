package com.shakhawat.meal.util;

import com.shakhawat.meal.dto.*;
import com.shakhawat.meal.entity.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.util.HashSet;

@Component
@RequiredArgsConstructor
public class EntityMapper {

    private final PasswordEncoder passwordEncoder;

    public Employee toEntity(EmployeeDTO.Request dto) {
        Employee employee = Employee.builder()
                .name(SecurityUtil.sanitizeInput(dto.getName()))
                .email(dto.getEmail().toLowerCase().trim())
                .password(passwordEncoder.encode(dto.getPassword()))
                .department(SecurityUtil.sanitizeInput(dto.getDepartment()))
                .status(dto.getStatus() != null ? dto.getStatus() : EmployeeStatus.ACTIVE)
                .roles(dto.getRoles() != null ? dto.getRoles() : new HashSet<>())
                .build();

        if (employee.getRoles().isEmpty()) {
            employee.addRole(Role.ROLE_EMPLOYEE);
        }

        if (dto.getMonthlyBudget() != null) {
            employee.setMonthlyBudget(dto.getMonthlyBudget());
        }

        if (dto.getMonthlyOrderLimit() != null) {
            employee.setMonthlyOrderLimit(dto.getMonthlyOrderLimit());
        }

        return employee;
    }

    public EmployeeDTO.Response toDto(Employee entity) {
        return EmployeeDTO.Response.builder()
                .id(entity.getId())
                .name(entity.getName())
                .email(entity.getEmail())
                .department(entity.getDepartment())
                .status(entity.getStatus())
                .roles(entity.getRoles())
                .monthlyBudget(entity.getMonthlyBudget())
                .currentMonthSpent(entity.getCurrentMonthSpent())
                .monthlyOrderLimit(entity.getMonthlyOrderLimit())
                .accountNonLocked(entity.getAccountNonLocked())
                .build();
    }

    public Meal toEntity(MealDTO.Request dto) {
        return Meal.builder()
                .name(SecurityUtil.sanitizeInput(dto.getName()))
                .description(SecurityUtil.sanitizeInput(dto.getDescription()))
                .type(dto.getType())
                .price(dto.getPrice())
                .available(dto.getAvailable() != null ? dto.getAvailable() : true)
                .dailyCapacity(dto.getDailyCapacity() != null ? dto.getDailyCapacity() : 100)
                .build();
    }

    public MealDTO.Response toDto(Meal entity) {
        return MealDTO.Response.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .type(entity.getType())
                .price(entity.getPrice())
                .available(entity.getAvailable())
                .dailyCapacity(entity.getDailyCapacity())
                .build();
    }

    public MealOrderDTO.Response toDto(MealOrder entity) {
        return MealOrderDTO.Response.builder()
                .id(entity.getId())
                .employeeId(entity.getEmployee().getId())
                .employeeName(entity.getEmployee().getName())
                .mealId(entity.getMeal().getId())
                .mealName(entity.getMeal().getName())
                .orderDate(entity.getOrderDate())
                .quantity(entity.getQuantity())
                .totalPrice(entity.getTotalPrice())
                .status(entity.getStatus())
                .build();
    }
}
