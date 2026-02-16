package com.shakhawat.meal.service;

import com.shakhawat.meal.dto.DashboardDTO;
import com.shakhawat.meal.entity.MealOrder;
import com.shakhawat.meal.repository.EmployeeRepository;
import com.shakhawat.meal.repository.MealOrderRepository;
import com.shakhawat.meal.repository.MealRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class DashboardService {

    private final MealOrderRepository orderRepository;
    private final MealRepository mealRepository;
    private final EmployeeRepository employeeRepository;

    public DashboardDTO.Response getDashboardStats() {
        LocalDate today = LocalDate.now();
        LocalDate firstDayOfMonth = today.withDayOfMonth(1);
        LocalDate lastDayOfMonth = today.withDayOfMonth(today.lengthOfMonth());

        long totalOrders = orderRepository.count();
        long totalMeals = mealRepository.count();
        long totalEmployees = employeeRepository.count();
        long todayOrders = orderRepository.countByOrderDate(today);

        BigDecimal monthlyRevenue = getMonthlyRevenue(firstDayOfMonth, lastDayOfMonth);
        List<DashboardDTO.TopMeal> topMeals = getTopMeals(firstDayOfMonth, lastDayOfMonth);
        List<DashboardDTO.RecentOrder> recentOrders = getRecentOrders();

        log.debug(
                "Dashboard stats computed - totalOrders: {}, totalMeals: {}, totalEmployees: {}, todayOrders: {}",
                totalOrders, totalMeals, totalEmployees, todayOrders);

        return DashboardDTO.Response.builder()
                .totalOrders(totalOrders)
                .totalMeals(totalMeals)
                .totalEmployees(totalEmployees)
                .todayOrders(todayOrders)
                .monthlyRevenue(monthlyRevenue)
                .topMeals(topMeals)
                .recentOrders(recentOrders)
                .build();
    }

    private BigDecimal getMonthlyRevenue(LocalDate startDate, LocalDate endDate) {
        List<Object[]> monthlyRevenueRows = orderRepository.findMonthlyRevenueByDepartment(startDate, endDate);
        return monthlyRevenueRows.stream()
                .map(row -> row[2] == null ? BigDecimal.ZERO : (BigDecimal) row[2])
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private List<DashboardDTO.TopMeal> getTopMeals(LocalDate startDate, LocalDate endDate) {
        Pageable limitFive = PageRequest.of(0, 5);
        List<Object[]> rows = orderRepository.findTopMealsByDateRange(startDate, endDate, limitFive);

        return rows.stream()
                .map(row -> DashboardDTO.TopMeal.builder()
                        .mealId((Long) row[0])
                        .mealName((String) row[1])
                        .orderCount(((Number) row[2]).longValue())
                        .totalRevenue(row[3] == null ? BigDecimal.ZERO : (BigDecimal) row[3])
                        .build())
                .toList();
    }

    private List<DashboardDTO.RecentOrder> getRecentOrders() {
        Pageable limitFive = PageRequest.of(0, 5);
        List<MealOrder> orders = orderRepository.findRecentOrdersWithDetails(limitFive);

        return orders.stream()
                .map(order -> DashboardDTO.RecentOrder.builder()
                        .id(order.getId())
                        .employee(DashboardDTO.EmployeeSummary.builder()
                                .id(order.getEmployee().getId())
                                .name(order.getEmployee().getName())
                                .build())
                        .meal(DashboardDTO.MealSummary.builder()
                                .id(order.getMeal().getId())
                                .name(order.getMeal().getName())
                                .build())
                        .orderDate(order.getOrderDate())
                        .quantity(order.getQuantity())
                        .totalPrice(order.getTotalPrice())
                        .status(order.getStatus())
                        .build())
                .toList();
    }
}
