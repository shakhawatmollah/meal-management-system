package com.shakhawat.meal.service;

import com.shakhawat.meal.dto.reports.*;
import java.time.LocalDate;

public interface ReportService {

    DailyOperationsReport generateDailyReport(LocalDate date);
    
    MonthlyFinancialReport generateMonthlyReport(Integer year, Integer month);
    
    EmployeePerformanceReport generateEmployeePerformanceReport(Integer year, Integer month);
    
    MealPerformanceReport generateMealPerformanceReport(Integer year, Integer month);
    
    AuditReport generateAuditReport(LocalDate startDate, LocalDate endDate);
}
