import { Component, OnInit, OnDestroy } from '@angular/core';
import { ReportService } from '../../../../core/services/report.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';

// Angular Material imports
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Report component imports
import { DailyOperationsReportComponent } from '../daily-operations-report/daily-operations-report.component';
import { MonthlyFinancialReportComponent } from '../monthly-financial-report/monthly-financial-report.component';
import { EmployeePerformanceReportComponent } from '../employee-performance-report/employee-performance-report.component';
import { MealPerformanceReportComponent } from '../meal-performance-report/meal-performance-report.component';
import { AuditReportComponent } from '../audit-report/audit-report.component';

@Component({
  selector: 'app-reports-dashboard',
  template: `
    <div class="reports-shell">
      <div class="hero">
        <div>
          <p class="eyebrow">Analytics Center</p>
          <h1>Management Reports Dashboard</h1>
          <p class="subtitle">Generate operational and financial insights by date range, team, and meal performance.</p>
        </div>
        <button
          mat-raised-button
          color="primary"
          (click)="exportCurrentReport('csv')"
          [disabled]="!generatedReport || loading">
          <mat-icon>download</mat-icon>
          Export CSV
        </button>
        <button
          mat-stroked-button
          (click)="exportCurrentReport('json')"
          [disabled]="!generatedReport || loading">
          <mat-icon>data_object</mat-icon>
          Export JSON
        </button>
      </div>

      <mat-card class="control-card">
        <mat-card-content>
          <div class="control-grid">
            <mat-form-field appearance="outline">
              <mat-label>Report Type</mat-label>
              <mat-select [(ngModel)]="selectedReportType" (selectionChange)="onReportTypeChange()">
                <mat-option value="daily">Daily Operations</mat-option>
                <mat-option value="monthly">Monthly Financial</mat-option>
                <mat-option value="employee">Employee Performance</mat-option>
                <mat-option value="meal">Meal Performance</mat-option>
                <mat-option value="audit">Audit Trail</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" *ngIf="selectedReportType !== 'audit'">
              <mat-label>{{ selectedReportType === 'daily' ? 'Select Date' : 'Select Month' }}</mat-label>
              <input
                matInput
                [matDatepicker]="datePicker"
                [(ngModel)]="selectedDate"
                [matDatepickerFilter]="dateFilter">
              <mat-datepicker-toggle matSuffix [for]="datePicker"></mat-datepicker-toggle>
              <mat-datepicker #datePicker></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline" *ngIf="selectedReportType === 'audit'">
              <mat-label>Start Date</mat-label>
              <input matInput [matDatepicker]="startDatePicker" [(ngModel)]="auditStartDate">
              <mat-datepicker-toggle matSuffix [for]="startDatePicker"></mat-datepicker-toggle>
              <mat-datepicker #startDatePicker></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline" *ngIf="selectedReportType === 'audit'">
              <mat-label>End Date</mat-label>
              <input matInput [matDatepicker]="endDatePicker" [(ngModel)]="auditEndDate">
              <mat-datepicker-toggle matSuffix [for]="endDatePicker"></mat-datepicker-toggle>
              <mat-datepicker #endDatePicker></mat-datepicker>
            </mat-form-field>
          </div>

          <div class="preset-row">
            <span class="preset-label">Quick Range</span>
            <button mat-stroked-button type="button" (click)="applyPreset('thisMonth')">This Month</button>
            <button mat-stroked-button type="button" (click)="applyPreset('lastMonth')">Last Month</button>
            <button mat-stroked-button type="button" (click)="applyPreset('last7Days')">Last 7 Days</button>
          </div>

          <div class="action-row">
            <button
              mat-raised-button
              color="primary"
              (click)="generateReport()"
              [disabled]="!selectedReportType || !canGenerateReport() || loading">
              <mat-icon *ngIf="!loading">assessment</mat-icon>
              <mat-icon *ngIf="loading" class="spin">refresh</mat-icon>
              {{ loading ? 'Generating...' : 'Generate Report' }}
            </button>

            <button mat-stroked-button (click)="resetForm()" [disabled]="loading">
              <mat-icon>clear</mat-icon>
              Reset
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card *ngIf="generatedReport" class="report-card">
        <mat-card-header>
          <mat-card-title>{{ getReportTitle() }}</mat-card-title>
          <mat-card-subtitle>{{ getReportSubtitle() }}</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <div class="kpi-grid">
            <mat-card class="kpi" *ngFor="let metric of getHeadlineMetrics()">
              <p class="kpi-label">{{ metric.label }}</p>
              <h3 class="kpi-value">{{ metric.value }}</h3>
            </mat-card>
          </div>

          <div *ngIf="selectedReportType === 'daily'" class="generic-report">
            <app-daily-operations-report [data]="generatedReport"></app-daily-operations-report>
          </div>

          <div *ngIf="selectedReportType === 'monthly'" class="generic-report">
            <app-monthly-financial-report [data]="generatedReport"></app-monthly-financial-report>
          </div>

          <div *ngIf="selectedReportType === 'employee'" class="generic-report">
            <app-employee-performance-report [data]="generatedReport"></app-employee-performance-report>
          </div>

          <div *ngIf="selectedReportType === 'meal'" class="meal-report">
            <app-meal-performance-report [data]="generatedReport"></app-meal-performance-report>
          </div>

          <div *ngIf="selectedReportType === 'audit'" class="audit-report">
            <app-audit-report [data]="generatedReport"></app-audit-report>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card *ngIf="!generatedReport && !loading" class="empty-state">
        <mat-card-content>
          <mat-icon>insights</mat-icon>
          <h3>Select filters and generate a report</h3>
          <p>Pick a report type and date scope to view operational insights.</p>
        </mat-card-content>
      </mat-card>

      <div *ngIf="loading" class="loading-state">
        <mat-spinner diameter="52"></mat-spinner>
        <p>Generating report...</p>
      </div>
    </div>
  `,
  styles: [`
    .reports-shell {
      --bg-1: #0f172a;
      --bg-2: #111827;
      --ink: #0f172a;
      --muted: #64748b;
      --line: #dbe2ea;
      --brand: #0ea5e9;
      padding: 1.25rem;
      max-width: 1280px;
      margin: 0 auto;
    }

    .hero {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem;
      padding: 1.5rem;
      border-radius: 18px;
      color: #e2e8f0;
      background: radial-gradient(1200px circle at 10% 0%, #1d4ed8 0%, var(--bg-1) 40%, var(--bg-2) 100%);
      margin-bottom: 1rem;
    }

    .eyebrow {
      margin: 0 0 0.35rem;
      font-size: 0.75rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #93c5fd;
    }

    .hero h1 {
      margin: 0;
      font-size: 1.6rem;
      line-height: 1.2;
      font-weight: 700;
    }

    .subtitle {
      margin: 0.45rem 0 0;
      color: #cbd5e1;
      max-width: 56ch;
      font-size: 0.95rem;
    }

    .control-card {
      border: 1px solid var(--line);
      border-radius: 16px;
      margin-bottom: 1rem;
      box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05);
    }

    .control-grid {
      display: grid;
      gap: 0.9rem;
      grid-template-columns: repeat(3, minmax(220px, 1fr));
      margin-bottom: 0.9rem;
    }

    .action-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.65rem;
    }

    .preset-row {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.55rem;
      margin-bottom: 0.75rem;
    }

    .preset-label {
      font-size: 0.8rem;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-right: 0.2rem;
    }

    .report-card {
      border: 1px solid var(--line);
      border-radius: 16px;
      box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05);
    }

    .kpi-grid {
      display: grid;
      gap: 0.75rem;
      grid-template-columns: repeat(4, minmax(160px, 1fr));
      margin-bottom: 1rem;
    }

    .kpi {
      border: 1px solid var(--line);
      border-radius: 12px;
      padding: 0.85rem 0.95rem;
      background: linear-gradient(160deg, #ffffff 0%, #f8fbff 100%);
    }

    .kpi-label {
      margin: 0;
      color: var(--muted);
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .kpi-value {
      margin: 0.35rem 0 0;
      color: var(--ink);
      font-size: 1.2rem;
      font-weight: 700;
    }

    .generic-report {
      border: 1px solid var(--line);
      border-radius: 12px;
      padding: 0.35rem;
      background: #f8fafc;
    }

    .empty-state {
      border: 1px dashed var(--line);
      border-radius: 16px;
      text-align: center;
      background: #f8fafc;
    }

    .empty-state mat-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      color: var(--brand);
      margin-bottom: 0.6rem;
    }

    .empty-state h3 {
      margin: 0 0 0.35rem;
    }

    .empty-state p {
      margin: 0;
      color: var(--muted);
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      padding: 1.4rem 0.4rem;
      color: var(--muted);
    }

    .spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      100% { transform: rotate(360deg); }
    }

    @media (max-width: 1024px) {
      .control-grid {
        grid-template-columns: repeat(2, minmax(220px, 1fr));
      }

      .kpi-grid {
        grid-template-columns: repeat(2, minmax(160px, 1fr));
      }
    }

    @media (max-width: 720px) {
      .hero {
        flex-direction: column;
        align-items: stretch;
      }

      .control-grid {
        grid-template-columns: 1fr;
      }

      .kpi-grid {
        grid-template-columns: 1fr;
      }
    }
  `],
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    DailyOperationsReportComponent,
    MonthlyFinancialReportComponent,
    EmployeePerformanceReportComponent,
    MealPerformanceReportComponent,
    AuditReportComponent
  ],
  standalone: true
})
export class ReportsDashboardComponent implements OnInit, OnDestroy {
  
  selectedReportType: string = '';
  selectedDate: Date = new Date();
  auditStartDate: Date = new Date();
  auditEndDate: Date = new Date();
  generatedReport: any = null;
  loading: boolean = false;
  
  private destroy$ = new Subject<void>();
  
  constructor(
    private reportService: ReportService,
    private snackBar: MatSnackBar
  ) {}
  
  ngOnInit() {
    // Set default dates
    const today = new Date();
    this.selectedDate = today;
    this.auditStartDate = new Date(today.getFullYear(), today.getMonth(), 1);
    this.auditEndDate = today;
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  onReportTypeChange() {
    this.generatedReport = null;
    
    // Reset dates based on report type
    if (this.selectedReportType === 'audit') {
      const today = new Date();
      this.auditStartDate = new Date(today.getFullYear(), today.getMonth(), 1);
      this.auditEndDate = today;
    } else {
      this.selectedDate = new Date();
    }
  }
  
  canGenerateReport(): boolean {
    if (this.selectedReportType === 'audit') {
      return this.auditStartDate && this.auditEndDate && this.auditStartDate <= this.auditEndDate;
    }
    return this.selectedDate && this.selectedDate <= new Date();
  }
  
  dateFilter = (date: Date | null): boolean => {
    if (!date) return false;
    return date <= new Date(); // Can't select future dates
  };
  
  generateReport() {
    if (!this.selectedReportType || !this.canGenerateReport()) {
      return;
    }
    
    this.loading = true;
    this.generatedReport = null;
    
    switch (this.selectedReportType) {
      case 'daily':
        this.generateDailyReport();
        break;
      case 'monthly':
        this.generateMonthlyReport();
        break;
      case 'employee':
        this.generateEmployeePerformanceReport();
        break;
      case 'meal':
        this.generateMealPerformanceReport();
        break;
      case 'audit':
        this.generateAuditReport();
        break;
    }
  }
  
  private generateDailyReport() {
    const dateStr = this.formatDate(this.selectedDate);
    
    this.reportService.getDailyReport(dateStr)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.generatedReport = response.data;
          this.loading = false;
          this.snackBar.open('Daily report generated successfully', 'Close', { duration: 3000 });
        },
        error: (error) => {
          this.loading = false;
          this.snackBar.open('Failed to generate daily report', 'Close', { duration: 3000 });
          console.error('Error generating daily report:', error);
        }
      });
  }
  
  private generateMonthlyReport() {
    const year = this.selectedDate.getFullYear();
    const month = this.selectedDate.getMonth() + 1;
    
    this.reportService.getMonthlyReport(year, month)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.generatedReport = response.data;
          this.loading = false;
          this.snackBar.open('Monthly report generated successfully', 'Close', { duration: 3000 });
        },
        error: (error) => {
          this.loading = false;
          this.snackBar.open('Failed to generate monthly report', 'Close', { duration: 3000 });
          console.error('Error generating monthly report:', error);
        }
      });
  }
  
  private generateEmployeePerformanceReport() {
    const year = this.selectedDate.getFullYear();
    const month = this.selectedDate.getMonth() + 1;
    
    this.reportService.getEmployeePerformanceReport(year, month)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.generatedReport = response.data;
          this.loading = false;
          this.snackBar.open('Employee performance report generated successfully', 'Close', { duration: 3000 });
        },
        error: (error) => {
          this.loading = false;
          this.snackBar.open('Failed to generate employee performance report', 'Close', { duration: 3000 });
          console.error('Error generating employee performance report:', error);
        }
      });
  }
  
  private generateMealPerformanceReport() {
    const year = this.selectedDate.getFullYear();
    const month = this.selectedDate.getMonth() + 1;
    
    this.reportService.getMealPerformanceReport(year, month)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.generatedReport = response.data;
          this.loading = false;
          this.snackBar.open('Meal performance report generated successfully', 'Close', { duration: 3000 });
        },
        error: (error) => {
          this.loading = false;
          this.snackBar.open('Failed to generate meal performance report', 'Close', { duration: 3000 });
          console.error('Error generating meal performance report:', error);
        }
      });
  }
  
  private generateAuditReport() {
    const startDateStr = this.formatDate(this.auditStartDate);
    const endDateStr = this.formatDate(this.auditEndDate);
    
    this.reportService.getAuditReport(startDateStr, endDateStr)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.generatedReport = response.data;
          this.loading = false;
          this.snackBar.open('Audit report generated successfully', 'Close', { duration: 3000 });
        },
        error: (error) => {
          this.loading = false;
          this.snackBar.open('Failed to generate audit report', 'Close', { duration: 3000 });
          console.error('Error generating audit report:', error);
        }
      });
  }
  
  exportCurrentReport(format: 'json' | 'csv' = 'json') {
    if (!this.generatedReport || !this.selectedReportType) {
      return;
    }

    if (format === 'csv') {
      const csv = this.buildCsvExport();
      if (!csv) {
        this.snackBar.open('CSV export is not available for this report', 'Close', { duration: 3000 });
        return;
      }
      this.downloadFile(csv, 'text/csv;charset=utf-8;', `${this.selectedReportType}-report-${this.formatDate(new Date())}.csv`);
      this.snackBar.open('Report exported as CSV', 'Close', { duration: 3000 });
      return;
    }

    const payload = {
      reportType: this.selectedReportType,
      generatedAt: new Date().toISOString(),
      params: this.getExportParams(),
      data: this.generatedReport
    };
    this.downloadFile(
      JSON.stringify(payload, null, 2),
      'application/json',
      `${this.selectedReportType}-report-${this.formatDate(new Date())}.json`
    );
    this.snackBar.open('Report exported as JSON', 'Close', { duration: 3000 });
  }

  applyPreset(preset: 'thisMonth' | 'lastMonth' | 'last7Days') {
    const today = new Date();

    if (this.selectedReportType === 'audit') {
      if (preset === 'thisMonth') {
        this.auditStartDate = new Date(today.getFullYear(), today.getMonth(), 1);
        this.auditEndDate = today;
      } else if (preset === 'lastMonth') {
        this.auditStartDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        this.auditEndDate = new Date(today.getFullYear(), today.getMonth(), 0);
      } else {
        this.auditStartDate = new Date(today);
        this.auditStartDate.setDate(today.getDate() - 6);
        this.auditEndDate = today;
      }
      return;
    }

    if (preset === 'thisMonth') {
      this.selectedDate = new Date(today.getFullYear(), today.getMonth(), 1);
      return;
    }

    if (preset === 'lastMonth') {
      this.selectedDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      return;
    }

    this.selectedDate = new Date(today);
    this.selectedDate.setDate(today.getDate() - 6);
  }
  
  resetForm() {
    this.selectedReportType = '';
    this.generatedReport = null;
    this.selectedDate = new Date();
    this.auditStartDate = new Date();
    this.auditEndDate = new Date();
  }
  
  // Helper methods
  getReportTitle(): string {
    switch (this.selectedReportType) {
      case 'daily':
        return `Daily Operations Report - ${this.formatDate(this.selectedDate)}`;
      case 'monthly':
        return `Monthly Financial Report - ${this.getMonthYear()}`;
      case 'employee':
        return `Employee Performance Report - ${this.getMonthYear()}`;
      case 'meal':
        return `Meal Performance Report - ${this.getMonthYear()}`;
      case 'audit':
        return `Audit Report - ${this.formatDate(this.auditStartDate)} to ${this.formatDate(this.auditEndDate)}`;
      default:
        return 'Report';
    }
  }
  
  getReportSubtitle(): string {
    switch (this.selectedReportType) {
      case 'daily':
        return 'Daily operational metrics and performance indicators';
      case 'monthly':
        return 'Monthly financial analysis and budget utilization';
      case 'employee':
        return 'Individual and department performance metrics';
      case 'meal':
        return 'Meal popularity and revenue analysis';
      case 'audit':
        return 'System activity and audit trail';
      default:
        return '';
    }
  }
  
  getExportParams(): any {
    switch (this.selectedReportType) {
      case 'daily':
        return { date: this.formatDate(this.selectedDate) };
      case 'monthly':
      case 'employee':
      case 'meal':
        return { 
          year: this.selectedDate.getFullYear(), 
          month: this.selectedDate.getMonth() + 1 
        };
      case 'audit':
        return { 
          startDate: this.formatDate(this.auditStartDate), 
          endDate: this.formatDate(this.auditEndDate) 
        };
      default:
        return {};
    }
  }
  
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
  
  private getMonthYear(): string {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                   'July', 'August', 'September', 'October', 'November', 'December'];
    return `${months[this.selectedDate.getMonth()]} ${this.selectedDate.getFullYear()}`;
  }

  getHeadlineMetrics(): Array<{ label: string; value: string }> {
    if (!this.generatedReport) return [];

    switch (this.selectedReportType) {
      case 'daily':
        return [
          { label: 'Total Orders', value: this.formatNumber(this.generatedReport.totalOrders) },
          { label: 'Unique Employees', value: this.formatNumber(this.generatedReport.uniqueEmployees) },
          { label: 'Daily Revenue', value: this.formatCurrency(this.generatedReport.dailyRevenue) },
          { label: 'Avg Order Value', value: this.formatCurrency(this.generatedReport.avgOrderValue) }
        ];
      case 'monthly':
        return [
          { label: 'Monthly Revenue', value: this.formatCurrency(this.generatedReport.monthlyRevenue) },
          { label: 'Total Budget', value: this.formatCurrency(this.generatedReport.totalBudget) },
          { label: 'Total Spent', value: this.formatCurrency(this.generatedReport.totalSpent) },
          { label: 'Utilization', value: `${this.formatNumber(this.generatedReport.budgetUtilizationRate)}%` }
        ];
      case 'employee':
        return [
          { label: 'Top Performers', value: this.formatNumber(this.generatedReport.topPerformers?.length) },
          { label: 'Budget Overruns', value: this.formatNumber(this.generatedReport.budgetOverruns?.length) },
          { label: 'Departments', value: this.formatNumber(this.generatedReport.departmentStats?.length) },
          { label: 'Employees', value: this.formatNumber(this.generatedReport.employeeStats?.length) }
        ];
      case 'meal':
        return [
          { label: 'Tracked Meals', value: this.formatNumber(this.generatedReport.mealPerformance?.length) },
          { label: 'Top Meals', value: this.formatNumber(this.generatedReport.topMeals?.length) },
          { label: 'Meal Types', value: this.formatNumber(this.generatedReport.mealTypeBreakdown?.length) },
          { label: 'Availability Buckets', value: this.formatNumber(this.generatedReport.availabilityAnalysis?.length) }
        ];
      case 'audit':
        return [
          { label: 'Total Actions', value: this.formatNumber(this.generatedReport.totalActions) },
          { label: 'Action Types', value: this.formatNumber(this.generatedReport.actionBreakdown?.length) },
          { label: 'Active Users', value: this.formatNumber(this.generatedReport.userActivity?.length) },
          { label: 'Alerts', value: this.formatNumber(this.generatedReport.suspiciousActivity?.length) }
        ];
      default:
        return [];
    }
  }

  private formatNumber(value: unknown): string {
    const numeric = Number(value ?? 0);
    return Number.isFinite(numeric) ? numeric.toLocaleString() : '0';
  }

  private formatCurrency(value: unknown): string {
    const numeric = Number(value ?? 0);
    if (!Number.isFinite(numeric)) return '$0.00';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(numeric);
  }

  private buildCsvExport(): string | null {
    const data = this.generatedReport;
    if (!data) return null;

    switch (this.selectedReportType) {
      case 'daily':
        const dailyRows = Array.isArray(data.hourlyBreakdown) ? data.hourlyBreakdown : [];
        return this.toCsv(
          ['hour', 'orderCount', 'revenue'],
          dailyRows.map((row: unknown) => [
            this.getField(row, 'hour'),
            this.getField(row, 'orderCount'),
            this.getField(row, 'revenue')
          ])
        );
      case 'monthly':
        const monthlyRows = Array.isArray(data.employeeBudgetAnalysis) ? data.employeeBudgetAnalysis : [];
        return this.toCsv(
          ['employeeName', 'department', 'monthlyBudget', 'currentSpent', 'remainingBudget', 'utilizationPercentage', 'status'],
          monthlyRows.map((row: unknown) => [
            this.getField(row, 'employeeName'),
            this.getField(row, 'department'),
            this.getField(row, 'monthlyBudget'),
            this.getField(row, 'currentSpent'),
            this.getField(row, 'remainingBudget'),
            this.getField(row, 'utilizationPercentage'),
            this.getField(row, 'status')
          ])
        );
      case 'employee':
        const employeeRows = Array.isArray(data.employeeStats) ? data.employeeStats : [];
        return this.toCsv(
          ['employeeName', 'department', 'totalOrders', 'avgOrderValue', 'monthlyBudget', 'currentSpent', 'utilizationPercentage', 'lastOrderDate'],
          employeeRows.map((row: unknown) => [
            this.getField(row, 'employeeName'),
            this.getField(row, 'department'),
            this.getField(row, 'totalOrders'),
            this.getField(row, 'avgOrderValue'),
            this.getField(row, 'monthlyBudget'),
            this.getField(row, 'currentSpent'),
            this.getField(row, 'utilizationPercentage'),
            this.getField(row, 'lastOrderDate')
          ])
        );
      case 'meal':
        const mealRows = Array.isArray(data.mealPerformance) ? data.mealPerformance : [];
        return this.toCsv(
          ['mealName', 'mealType', 'timesOrdered', 'totalQuantity', 'totalRevenue', 'avgOrderValue', 'currentlyAvailable'],
          mealRows.map((row: unknown) => [
            this.getField(row, 'mealName'),
            this.getField(row, 'mealType'),
            this.getField(row, 'timesOrdered'),
            this.getField(row, 'totalQuantity'),
            this.getField(row, 'totalRevenue'),
            this.getField(row, 'avgOrderValue'),
            this.getField(row, 'currentlyAvailable')
          ])
        );
      case 'audit':
        const auditRows = Array.isArray(data.suspiciousActivity) ? data.suspiciousActivity : [];
        return this.toCsv(
          ['timestamp', 'userId', 'action', 'entityType', 'reason', 'ipAddress'],
          auditRows.map((row: unknown) => [
            this.getField(row, 'timestamp'),
            this.getField(row, 'userId'),
            this.getField(row, 'action'),
            this.getField(row, 'entityType'),
            this.getField(row, 'reason'),
            this.getField(row, 'ipAddress')
          ])
        );
      default:
        return null;
    }
  }

  private toCsv(headers: string[], rows: unknown[][]): string {
    const csvRows = [headers.map((h) => this.csvEscape(h)).join(',')];
    rows.forEach((row) => {
      csvRows.push(row.map((value) => this.csvEscape(value)).join(','));
    });
    return csvRows.join('\n');
  }

  private csvEscape(value: unknown): string {
    const text = String(value ?? '');
    if (/[",\n]/.test(text)) {
      return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
  }

  private getField(row: unknown, key: string): unknown {
    if (row && typeof row === 'object') {
      return (row as Record<string, unknown>)[key];
    }
    return '';
  }

  private downloadFile(content: string, mimeType: string, fileName: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}
