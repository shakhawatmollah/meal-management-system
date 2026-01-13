package com.shakhawat.meal.service.impl;

import com.shakhawat.meal.dto.reports.*;
import com.shakhawat.meal.entity.AuditLog;
import com.shakhawat.meal.repository.*;
import com.shakhawat.meal.service.ReportService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportServiceImpl implements ReportService {

    private final MealOrderRepository orderRepository;
    private final EmployeeRepository employeeRepository;
    private final MealRepository mealRepository;
    private final AuditLogRepository auditLogRepository;

    @Override
    @Transactional(readOnly = true)
    public DailyOperationsReport generateDailyReport(LocalDate date) {
        log.info("Generating daily report for date: {}", date);

        // Get daily order summary
        List<Object[]> hourlyBreakdown = orderRepository.findHourlyOrderBreakdown(date);
        List<Object[]> mealTypeBreakdown = orderRepository.findMealTypeBreakdown(date);
        
        // Get unique employees count
        Long uniqueEmployees = orderRepository.countDistinctEmployeesByDate(date);
        
        // Get available meals count
        Long availableMeals = mealRepository.countAvailableMeals();
        
        // Calculate revenue and metrics
        Object result = orderRepository.calculateDailyRevenue(date);

        double dailyRevenue = 0.0;
        int totalOrders = 0;

        if (result != null) {
            Object[] revenueData = (Object[]) result;

            if (revenueData[0] != null) {
                dailyRevenue = ((Number) revenueData[0]).doubleValue();
            }
            if (revenueData[1] != null) {
                totalOrders = ((Number) revenueData[1]).intValue();
            }
        }

        return DailyOperationsReport.builder()
            .reportDate(date)
            .totalOrders(totalOrders)
            .uniqueEmployees(uniqueEmployees.intValue())
            .totalMealsAvailable(availableMeals.intValue())
            .dailyRevenue(dailyRevenue)
            .avgOrderValue(calculateAverageOrderValue(hourlyBreakdown))
            .peakHour(calculatePeakHour(hourlyBreakdown))
            .budgetUtilizationRate(calculateBudgetUtilization(date))
            .mealTypeBreakdown(convertToMealTypeStats(mealTypeBreakdown))
            .hourlyBreakdown(convertToHourlyStats(hourlyBreakdown))
            .build();
    }

    @Override
    @Transactional(readOnly = true)
    public MonthlyFinancialReport generateMonthlyReport(Integer year, Integer month) {
        log.info("Generating monthly report for {}-{}", year, month);
        
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        
        // Get monthly financial data
        List<Object[]> monthlyRevenue = orderRepository.findMonthlyRevenueByDepartment(startDate, endDate);
        List<Object[]> employeeBudgetData = orderRepository.findEmployeeBudgetAnalysisByMonth(year, month);
        List<Object[]> mealPerformance = orderRepository.findMealPerformanceByMonth(startDate, endDate);
        
        // Calculate totals
        BigDecimal totalRevenue = monthlyRevenue.stream()
            .map(data -> (BigDecimal) data[2])
            .reduce(BigDecimal.ZERO, BigDecimal::add);
            
        BigDecimal totalBudget = employeeBudgetData.stream()
            .map(data -> (BigDecimal) data[2])
            .reduce(BigDecimal.ZERO, BigDecimal::add);
            
        BigDecimal totalSpent = employeeBudgetData.stream()
            .map(data -> (BigDecimal) data[3])
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        return MonthlyFinancialReport.builder()
            .reportPeriod(startDate)
            .monthlyRevenue(totalRevenue)
            .totalBudget(totalBudget)
            .totalSpent(totalSpent)
            .budgetVariance(totalBudget.subtract(totalSpent))
            .budgetUtilizationRate(totalBudget.compareTo(BigDecimal.ZERO) > 0 ? 
                totalSpent.divide(totalBudget, 4, RoundingMode.HALF_UP).doubleValue() * 100 : 0.0)
            .departmentBreakdown(convertToDepartmentStats(monthlyRevenue))
            .mealPerformance(convertToMealPerformance(mealPerformance))
            .employeeBudgetAnalysis(convertToEmployeeBudgetAnalysis(employeeBudgetData))
            .build();
    }

    @Override
    @Transactional(readOnly = true)
    public EmployeePerformanceReport generateEmployeePerformanceReport(Integer year, Integer month) {
        log.info("Generating employee performance report for {}-{}", year, month);
        
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        
        // Get employee performance data
        List<Object[]> employeeStats = orderRepository.findEmployeePerformanceByMonth(startDate, endDate);
        List<Object[]> departmentStats = employeeRepository.findDepartmentBudgetAnalysis();
        List<Object[]> activeEmployeesByDept = employeeRepository.findActiveEmployeesByDepartment();
        
        List<EmployeePerformanceReport.EmployeeStats> employees = convertToEmployeeStats(employeeStats);
        
        return EmployeePerformanceReport.builder()
            .reportPeriod(startDate)
            .employeeStats(employees)
            .departmentStats(convertToDepartmentPerformanceStats(departmentStats, activeEmployeesByDept))
            .budgetAnalysis(calculateBudgetAnalysis(employees))
            .topPerformers(findTopPerformers(employees))
            .budgetOverruns(findBudgetOverruns(employees))
            .build();
    }

    @Override
    @Transactional(readOnly = true)
    public MealPerformanceReport generateMealPerformanceReport(Integer year, Integer month) {
        log.info("Generating meal performance report for {}-{}", year, month);
        
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        
        // Get meal performance data
        List<Object[]> mealStats = orderRepository.findMealPerformanceByMonth(startDate, endDate);
        List<Object[]> mealTypeStats = orderRepository.findMealTypePerformanceByMonth(startDate, endDate);
        List<Object[]> availabilityStats = mealRepository.findAvailabilityStatsByType();
        
        List<MealPerformanceReport.MealStats> meals = convertToMealStats(mealStats);
        
        return MealPerformanceReport.builder()
            .reportPeriod(startDate)
            .mealPerformance(meals)
            .mealTypeBreakdown(convertToMealTypeStatsForMealPerformanceReport(mealTypeStats))
            .availabilityAnalysis(convertToAvailabilityStats(availabilityStats))
            .topMeals(findTopMeals(meals))
            .leastPopularMeals(findLeastPopularMeals(meals))
            .revenueByMealType(calculateRevenueByMealType(mealTypeStats))
            .build();
    }

    @Override
    @Transactional(readOnly = true)
    public AuditReport generateAuditReport(LocalDate startDate, LocalDate endDate) {
        log.info("Generating audit report from {} to {}", startDate, endDate);
        
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(23, 59, 59);
        
        // Get audit data
        List<AuditLog> auditLogs = auditLogRepository.findByTimestampBetween(start, end);
        List<Object[]> actionStats = auditLogRepository.findActionStats(start, end);
        List<Object[]> userActivityStats = auditLogRepository.findUserActivityStats(start, end);
        List<Object[]> entityActivityStats = auditLogRepository.findEntityActivityStats(start, end);
        
        return AuditReport.builder()
            .startDate(startDate)
            .endDate(endDate)
            .totalActions(auditLogs.size())
            .actionBreakdown(convertToActionStats(actionStats))
            .userActivity(convertToUserActivityStats(userActivityStats))
            .entityActivity(convertToEntityActivity(entityActivityStats))
            .suspiciousActivity(findSuspiciousActivity(auditLogs))
            .build();
    }

    // Helper methods
    private Double calculateAverageOrderValue(List<Object[]> hourlyBreakdown) {
        return hourlyBreakdown.stream()
            .mapToDouble(data -> ((BigDecimal) data[2]).doubleValue())
            .average()
            .orElse(0.0);
    }
    
    private String calculatePeakHour(List<Object[]> hourlyBreakdown) {
        return hourlyBreakdown.stream()
            .max(Comparator.comparing(data -> (Integer) data[1]))
            .map(data -> data[0] + ":00")
            .orElse("12:00");
    }
    
    private Double calculateBudgetUtilization(LocalDate date) {
        Object[] budgetData = employeeRepository.findTotalBudgetUtilization();
        if (budgetData == null || budgetData.length < 2) return 0.0;
        
        BigDecimal totalBudget = (BigDecimal) budgetData[0];
        BigDecimal totalSpent = (BigDecimal) budgetData[1];
        
        return totalBudget.compareTo(BigDecimal.ZERO) > 0 ? 
            totalSpent.divide(totalBudget, 4, RoundingMode.HALF_UP).doubleValue() * 100 : 0.0;
    }

    // Conversion methods
    private List<DailyOperationsReport.MealTypeStats> convertToMealTypeStats(List<Object[]> mealTypeBreakdown) {
        return mealTypeBreakdown.stream()
            .map(data -> DailyOperationsReport.MealTypeStats.builder()
                .mealType((String) data[0])
                .orderCount((Integer) data[1])
                .revenue(((BigDecimal) data[2]).doubleValue())
                .build())
            .collect(Collectors.toList());
    }
    
    private List<DailyOperationsReport.HourlyStats> convertToHourlyStats(List<Object[]> hourlyBreakdown) {
        return hourlyBreakdown.stream()
            .map(data -> DailyOperationsReport.HourlyStats.builder()
                .hour((Integer) data[0])
                .orderCount((Integer) data[1])
                .revenue(((BigDecimal) data[2]).doubleValue())
                .build())
            .collect(Collectors.toList());
    }
    
    private List<MonthlyFinancialReport.DepartmentStats> convertToDepartmentStats(List<Object[]> monthlyRevenue) {
        BigDecimal totalRevenue = monthlyRevenue.stream()
            .map(data -> (BigDecimal) data[2])
            .reduce(BigDecimal.ZERO, BigDecimal::add);
            
        return monthlyRevenue.stream()
            .map(data -> MonthlyFinancialReport.DepartmentStats.builder()
                .department((String) data[0])
                .orderCount((Integer) data[1])
                .revenue((BigDecimal) data[2])
                .uniqueEmployees((Integer) data[3])
                .percentageOfTotal(totalRevenue.compareTo(BigDecimal.ZERO) > 0 ? 
                    ((BigDecimal) data[2]).divide(totalRevenue, 4, RoundingMode.HALF_UP).doubleValue() * 100 : 0.0)
                .build())
            .collect(Collectors.toList());
    }
    
    private List<MonthlyFinancialReport.MealPerformance> convertToMealPerformance(List<Object[]> mealPerformance) {
        return mealPerformance.stream()
            .map(data -> MonthlyFinancialReport.MealPerformance.builder()
                .mealName((String) data[0])
                .mealType((String) data[1])
                .unitPrice((BigDecimal) data[2])
                .timesOrdered((Integer) data[3])
                .totalRevenue((BigDecimal) data[4])
                .avgOrderValue(((BigDecimal) data[5]).doubleValue())
                .build())
            .collect(Collectors.toList());
    }
    
    private List<MonthlyFinancialReport.EmployeeBudgetAnalysis> convertToEmployeeBudgetAnalysis(List<Object[]> employeeBudgetData) {
        return employeeBudgetData.stream()
            .map(data -> {
                BigDecimal budget = (BigDecimal) data[2];
                BigDecimal spent = (BigDecimal) data[3];
                double utilization = budget.compareTo(BigDecimal.ZERO) > 0 ?
                    spent.divide(budget, 4, RoundingMode.HALF_UP).doubleValue() * 100 : 0.0;
                
                String status = utilization > 100 ? "OVER_BUDGET" : 
                               utilization < 50 ? "UNDER_UTILIZED" : "ON_TRACK";
                
                return MonthlyFinancialReport.EmployeeBudgetAnalysis.builder()
                    .employeeName((String) data[0])
                    .department((String) data[1])
                    .monthlyBudget(budget)
                    .currentSpent(spent)
                    .remainingBudget(budget.subtract(spent))
                    .utilizationPercentage(utilization)
                    .status(status)
                    .build();
            })
            .collect(Collectors.toList());
    }
    
    private List<EmployeePerformanceReport.EmployeeStats> convertToEmployeeStats(List<Object[]> employeeStats) {
        return employeeStats.stream()
            .map(data -> EmployeePerformanceReport.EmployeeStats.builder()
                .employeeName((String) data[0])
                .department((String) data[1])
                .monthlyBudget((BigDecimal) data[2])
                .currentSpent((BigDecimal) data[3])
                .totalOrders((Integer) data[4])
                .avgOrderValue(BigDecimal.valueOf(((BigDecimal) data[5]).doubleValue()))
                .lastOrderDate((LocalDate) data[6])
                .utilizationPercentage(((BigDecimal) data[2]).compareTo(BigDecimal.ZERO) > 0 ? 
                    ((BigDecimal) data[3]).divide((BigDecimal) data[2], 4, RoundingMode.HALF_UP).doubleValue() * 100 : 0.0)
                .build())
            .collect(Collectors.toList());
    }
    
    private List<EmployeePerformanceReport.DepartmentStats> convertToDepartmentPerformanceStats(
            List<Object[]> departmentStats, List<Object[]> activeEmployeesByDept) {
        
        Map<String, Object[]> activeEmpMap = activeEmployeesByDept.stream()
            .collect(Collectors.toMap(data -> (String) data[0], data -> data));
            
        return departmentStats.stream()
            .map(data -> {
                String dept = (String) data[0];
                Object[] activeEmpData = activeEmpMap.get(dept);
                
                return EmployeePerformanceReport.DepartmentStats.builder()
                    .department(dept)
                    .totalEmployees((Integer) data[1])
                    .activeEmployees(activeEmpData != null ? (Integer) activeEmpData[1] : 0)
                    .totalBudget((BigDecimal) data[2])
                    .totalSpent((BigDecimal) data[3])
                    .utilizationRate(((BigDecimal) data[2]).compareTo(BigDecimal.ZERO) > 0 ? 
                        ((BigDecimal) data[3]).divide((BigDecimal) data[2], 4, RoundingMode.HALF_UP).doubleValue() * 100 : 0.0)
                    .build();
            })
            .collect(Collectors.toList());
    }
    
    private List<EmployeePerformanceReport.BudgetAnalysis> calculateBudgetAnalysis(List<EmployeePerformanceReport.EmployeeStats> employees) {
        Map<String, List<EmployeePerformanceReport.EmployeeStats>> grouped = employees.stream()
            .collect(Collectors.groupingBy(emp -> {
                Double util = emp.getUtilizationPercentage();
                return util > 100 ? "OVER_BUDGET" : util < 50 ? "UNDER_UTILIZED" : "ON_TRACK";
            }));
            
        return grouped.entrySet().stream()
            .map(entry -> {
                List<EmployeePerformanceReport.EmployeeStats> group = entry.getValue();
                return EmployeePerformanceReport.BudgetAnalysis.builder()
                    .category(entry.getKey())
                    .employeeCount(group.size())
                    .totalBudget(group.stream().map(EmployeePerformanceReport.EmployeeStats::getMonthlyBudget).reduce(BigDecimal.ZERO, BigDecimal::add))
                    .totalSpent(group.stream().map(EmployeePerformanceReport.EmployeeStats::getCurrentSpent).reduce(BigDecimal.ZERO, BigDecimal::add))
                    .percentageOfEmployees(group.size() * 100.0 / employees.size())
                    .build();
            })
            .collect(Collectors.toList());
    }
    
    private List<EmployeePerformanceReport.EmployeeStats> findTopPerformers(List<EmployeePerformanceReport.EmployeeStats> employees) {
        return employees.stream()
            .sorted(Comparator.comparing(EmployeePerformanceReport.EmployeeStats::getTotalOrders).reversed())
            .limit(10)
            .collect(Collectors.toList());
    }
    
    private List<EmployeePerformanceReport.EmployeeStats> findBudgetOverruns(List<EmployeePerformanceReport.EmployeeStats> employees) {
        return employees.stream()
            .filter(emp -> emp.getUtilizationPercentage() > 100)
            .sorted(Comparator.comparing(EmployeePerformanceReport.EmployeeStats::getUtilizationPercentage).reversed())
            .collect(Collectors.toList());
    }
    
    private List<MealPerformanceReport.MealStats> convertToMealStats(List<Object[]> mealStats) {
        return mealStats.stream()
            .map(data -> MealPerformanceReport.MealStats.builder()
                .mealName((String) data[0])
                .mealType((String) data[1])
                .unitPrice((BigDecimal) data[2])
                .timesOrdered((Integer) data[3])
                .totalRevenue((BigDecimal) data[4])
                .avgOrderValue(((BigDecimal) data[5]).doubleValue())
                .currentlyAvailable((Boolean) data[6])
                .build())
            .collect(Collectors.toList());
    }

    private List<MealPerformanceReport.MealTypeStats> convertToMealTypeStatsForMealPerformanceReport(List<Object[]> mealTypeStats) {
        BigDecimal totalRevenue = mealTypeStats.stream()
            .map(data -> (BigDecimal) data[3])
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        return mealTypeStats.stream()
            .map(data -> MealPerformanceReport.MealTypeStats.builder()
                .mealType((String) data[0])
                .uniqueMeals((Integer) data[1])
                .totalOrders((Integer) data[2])
                .totalRevenue((BigDecimal) data[3])
                .avgOrderValue(((BigDecimal) data[4]).doubleValue())
                .percentageOfTotalRevenue(totalRevenue.compareTo(BigDecimal.ZERO) > 0 ?
                    ((BigDecimal) data[3]).divide(totalRevenue, 4, RoundingMode.HALF_UP).doubleValue() * 100 : 0.0)
                .build())
            .collect(Collectors.toList());
    }
    
    private List<MealPerformanceReport.AvailabilityStats> convertToAvailabilityStats(List<Object[]> availabilityStats) {
        return availabilityStats.stream()
            .map(data -> {
                String mealType = (String) data[0];
                Integer total = (Integer) data[1];
                Integer available = (Integer) data[2];
                
                return MealPerformanceReport.AvailabilityStats.builder()
                    .mealType(mealType)
                    .totalMeals(total)
                    .availableMeals(available)
                    .unavailableMeals(total - available)
                    .availabilityPercentage(total > 0 ? (available * 100.0 / total) : 0.0)
                    .build();
            })
            .collect(Collectors.toList());
    }
    
    private List<MealPerformanceReport.MealStats> findTopMeals(List<MealPerformanceReport.MealStats> meals) {
        return meals.stream()
            .sorted(Comparator.comparing(MealPerformanceReport.MealStats::getTotalRevenue).reversed())
            .limit(10)
            .collect(Collectors.toList());
    }
    
    private List<MealPerformanceReport.MealStats> findLeastPopularMeals(List<MealPerformanceReport.MealStats> meals) {
        return meals.stream()
            .sorted(Comparator.comparing(MealPerformanceReport.MealStats::getTimesOrdered))
            .limit(5)
            .collect(Collectors.toList());
    }
    
    private List<MealPerformanceReport.MealTypeRevenue> calculateRevenueByMealType(List<Object[]> mealTypeStats) {
        BigDecimal totalRevenue = mealTypeStats.stream()
            .map(data -> (BigDecimal) data[3])
            .reduce(BigDecimal.ZERO, BigDecimal::add);
            
        return mealTypeStats.stream()
            .map(data -> MealPerformanceReport.MealTypeRevenue.builder()
                .mealType((String) data[0])
                .revenue((BigDecimal) data[3])
                .percentageOfTotal(totalRevenue.compareTo(BigDecimal.ZERO) > 0 ? 
                    ((BigDecimal) data[3]).divide(totalRevenue, 4, RoundingMode.HALF_UP).doubleValue() * 100 : 0.0)
                .build())
            .collect(Collectors.toList());
    }
    
    private List<AuditReport.ActionStats> convertToActionStats(List<Object[]> actionStats) {
        Integer totalActions = actionStats.stream()
            .mapToInt(data -> (Integer) data[1])
            .sum();
            
        return actionStats.stream()
            .map(data -> AuditReport.ActionStats.builder()
                .action((String) data[0])
                .actionCount((Integer) data[1])
                .percentageOfTotal(totalActions > 0 ? ((Integer) data[1]) * 100.0 / totalActions : 0.0)
                .firstAction((LocalDateTime) data[2])
                .lastAction((LocalDateTime) data[3])
                .build())
            .collect(Collectors.toList());
    }
    
    private List<AuditReport.UserActivityStats> convertToUserActivityStats(List<Object[]> userActivityStats) {
        return userActivityStats.stream()
            .map(data -> AuditReport.UserActivityStats.builder()
                .userId((String) data[0])
                .actionCount((Integer) data[1])
                .lastActivity((LocalDateTime) data[3])
                .build())
            .collect(Collectors.toList());
    }
    
    private Map<String, Integer> convertToEntityActivity(List<Object[]> entityActivityStats) {
        return entityActivityStats.stream()
            .collect(Collectors.toMap(
                data -> (String) data[0],
                data -> (Integer) data[1]
            ));
    }
    
    private List<AuditReport.SuspiciousActivity> findSuspiciousActivity(List<AuditLog> auditLogs) {
        // Simple suspicious activity detection
        return auditLogs.stream()
            .filter(log -> log.getAction().equals("DELETE") || 
                        log.getUserId().equals("admin") && log.getAction().equals("UPDATE"))
            .map(log -> AuditReport.SuspiciousActivity.builder()
                .userId(log.getUserId())
                .action(log.getAction())
                .timestamp(log.getTimestamp())
                .entityType(log.getEntityType())
                .reason(log.getAction().equals("DELETE") ? "Deletion activity" : "Admin update activity")
                .ipAddress(log.getIpAddress())
                .build())
            .collect(Collectors.toList());
    }
}
