import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.models';

export interface DailyOperationsReport {
  reportDate: string;
  totalOrders: number;
  uniqueEmployees: number;
  totalMealsAvailable: number;
  dailyRevenue: number;
  avgOrderValue: number;
  peakHour: string;
  budgetUtilizationRate: number;
  mealTypeBreakdown: MealTypeStats[];
  hourlyBreakdown: HourlyStats[];
}

export interface MealTypeStats {
  mealType: string;
  orderCount: number;
  revenue: number;
  percentage: number;
}

export interface HourlyStats {
  hour: number;
  orderCount: number;
  revenue: number;
}

export interface MonthlyFinancialReport {
  reportPeriod: string;
  monthlyRevenue: number;
  totalBudget: number;
  totalSpent: number;
  budgetVariance: number;
  budgetUtilizationRate: number;
  departmentBreakdown: DepartmentStats[];
  mealPerformance: MealPerformance[];
  employeeBudgetAnalysis: EmployeeBudgetAnalysis[];
}

export interface DepartmentStats {
  department: string;
  orderCount: number;
  revenue: number;
  uniqueEmployees: number;
  percentageOfTotal: number;
}

export interface MealPerformance {
  mealName: string;
  mealType: string;
  unitPrice: number;
  timesOrdered: number;
  totalRevenue: number;
  avgOrderValue: number;
}

export interface EmployeeBudgetAnalysis {
  employeeName: string;
  department: string;
  monthlyBudget: number;
  currentSpent: number;
  remainingBudget: number;
  utilizationPercentage: number;
  status: 'ON_TRACK' | 'OVER_BUDGET' | 'UNDER_UTILIZED';
}

export interface EmployeePerformanceReport {
  reportPeriod: string;
  employeeStats: EmployeeStats[];
  departmentStats: DepartmentPerformanceStats[];
  budgetAnalysis: BudgetAnalysis[];
  topPerformers: EmployeeStats[];
  budgetOverruns: EmployeeStats[];
}

export interface EmployeeStats {
  employeeName: string;
  department: string;
  monthlyBudget: number;
  currentSpent: number;
  totalOrders: number;
  avgOrderValue: number;
  lastOrderDate: string;
  mostOrderedMeal: string;
  timesOrdered: number;
  utilizationPercentage: number;
}

export interface DepartmentPerformanceStats {
  department: string;
  totalEmployees: number;
  activeEmployees: number;
  totalBudget: number;
  totalSpent: number;
  utilizationRate: number;
  totalOrders: number;
}

export interface BudgetAnalysis {
  category: string;
  employeeCount: number;
  totalBudget: number;
  totalSpent: number;
  percentageOfEmployees: number;
}

export interface MealPerformanceReport {
  reportPeriod: string;
  mealPerformance: MealStats[];
  mealTypeBreakdown: MealTypeStats[];
  availabilityAnalysis: AvailabilityStats[];
  topMeals: MealStats[];
  leastPopularMeals: MealStats[];
  revenueByMealType: MealTypeRevenue[];
}

export interface MealStats {
  mealName: string;
  mealType: string;
  unitPrice: number;
  timesOrdered: number;
  totalQuantity: number;
  totalRevenue: number;
  avgOrderValue: number;
  currentlyAvailable: boolean;
}

export interface AvailabilityStats {
  mealType: string;
  totalMeals: number;
  availableMeals: number;
  unavailableMeals: number;
  availabilityPercentage: number;
}

export interface MealTypeRevenue {
  mealType: string;
  revenue: number;
  percentageOfTotal: number;
}

export interface AuditReport {
  startDate: string;
  endDate: string;
  totalActions: number;
  actionBreakdown: ActionStats[];
  userActivity: UserActivityStats[];
  entityActivity: { [key: string]: number };
  suspiciousActivity: SuspiciousActivity[];
}

export interface ActionStats {
  action: string;
  actionCount: number;
  percentageOfTotal: number;
  firstAction: string;
  lastAction: string;
}

export interface UserActivityStats {
  userId: string;
  actionCount: number;
  actionsPerformed: string[];
  lastActivity: string;
  mostFrequentAction: string;
}

export interface SuspiciousActivity {
  userId: string;
  action: string;
  timestamp: string;
  entityType: string;
  reason: string;
  ipAddress: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  
  constructor(private http: HttpClient) {}
  
  getDailyReport(date: string): Observable<ApiResponse<DailyOperationsReport>> {
    return this.http.get<ApiResponse<DailyOperationsReport>>(
      `${environment.apiUrl}/reports/daily/${date}`
    );
  }
  
  getMonthlyReport(year: number, month: number): Observable<ApiResponse<MonthlyFinancialReport>> {
    return this.http.get<ApiResponse<MonthlyFinancialReport>>(
      `${environment.apiUrl}/reports/monthly/${year}/${month}`
    );
  }
  
  getEmployeePerformanceReport(year: number, month: number): Observable<ApiResponse<EmployeePerformanceReport>> {
    return this.http.get<ApiResponse<EmployeePerformanceReport>>(
      `${environment.apiUrl}/reports/employee-performance/${year}/${month}`
    );
  }
  
  getMealPerformanceReport(year: number, month: number): Observable<ApiResponse<MealPerformanceReport>> {
    return this.http.get<ApiResponse<MealPerformanceReport>>(
      `${environment.apiUrl}/reports/meal-performance/${year}/${month}`
    );
  }
  
  getAuditReport(startDate: string, endDate: string): Observable<ApiResponse<AuditReport>> {
    return this.http.get<ApiResponse<AuditReport>>(
      `${environment.apiUrl}/reports/audit/${startDate}/${endDate}`
    );
  }
}
