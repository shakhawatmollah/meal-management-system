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
import { MealPerformanceReportComponent } from '../meal-performance-report/meal-performance-report.component';
import { AuditReportComponent } from '../audit-report/audit-report.component';

@Component({
  selector: 'app-reports-dashboard',
  template: `
    <div class="reports-container">
      <mat-card class="mb-4">
        <mat-card-header>
          <mat-card-title class="d-flex justify-content-between align-items-center">
            <span>Management Reports Dashboard</span>
            <button mat-icon-button (click)="exportCurrentReport()" 
                    [disabled]="!generatedReport || loading"
                    matTooltip="Export Report">
              <mat-icon>download</mat-icon>
            </button>
          </mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <!-- Report Type Selection -->
          <div class="row mb-3">
            <div class="col-md-4">
              <mat-form-field appearance="outline" class="w-100">
                <mat-label>Report Type</mat-label>
                <mat-select [(ngModel)]="selectedReportType" 
                           (selectionChange)="onReportTypeChange()">
                  <mat-option value="daily">Daily Operations</mat-option>
                  <mat-option value="monthly">Monthly Financial</mat-option>
                  <mat-option value="employee">Employee Performance</mat-option>
                  <mat-option value="meal">Meal Performance</mat-option>
                  <mat-option value="audit">Audit Trail</mat-option>
                </mat-select>
              </mat-form-field>
            </div>
            
            <div class="col-md-4" *ngIf="selectedReportType !== 'audit'">
              <mat-form-field appearance="outline" class="w-100">
                <mat-label *ngIf="selectedReportType === 'daily'">Select Date</mat-label>
                <mat-label *ngIf="selectedReportType === 'monthly' || selectedReportType === 'employee' || selectedReportType === 'meal'">Select Month</mat-label>
                <input matInput 
                       [matDatepicker]="datePicker" 
                       [(ngModel)]="selectedDate"
                       [matDatepickerFilter]="dateFilter">
                <mat-datepicker-toggle matSuffix [for]="datePicker"></mat-datepicker-toggle>
                <mat-datepicker #datePicker></mat-datepicker>
              </mat-form-field>
            </div>
            
            <div class="col-md-4" *ngIf="selectedReportType === 'audit'">
              <mat-form-field appearance="outline" class="w-100">
                <mat-label>Start Date</mat-label>
                <input matInput 
                       [matDatepicker]="startDatePicker" 
                       [(ngModel)]="auditStartDate">
                <mat-datepicker-toggle matSuffix [for]="startDatePicker"></mat-datepicker-toggle>
                <mat-datepicker #startDatePicker></mat-datepicker>
              </mat-form-field>
            </div>
            
            <div class="col-md-4" *ngIf="selectedReportType === 'audit'">
              <mat-form-field appearance="outline" class="w-100">
                <mat-label>End Date</mat-label>
                <input matInput 
                       [matDatepicker]="endDatePicker" 
                       [(ngModel)]="auditEndDate">
                <mat-datepicker-toggle matSuffix [for]="endDatePicker"></mat-datepicker-toggle>
                <mat-datepicker #endDatePicker></mat-datepicker>
              </mat-form-field>
            </div>
            
            <div class="col-md-4 d-flex align-items-end">
              <button mat-raised-button 
                      color="primary" 
                      (click)="generateReport()" 
                      [disabled]="!selectedReportType || !canGenerateReport() || loading"
                      class="me-2">
                <mat-icon *ngIf="!loading">assessment</mat-icon>
                <mat-icon *ngIf="loading" class="spin">refresh</mat-icon>
                {{ loading ? 'Generating...' : 'Generate Report' }}
              </button>
              
              <button mat-stroked-button 
                      (click)="resetForm()"
                      [disabled]="loading">
                <mat-icon>clear</mat-icon>
                Reset
              </button>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
      
      <!-- Report Display -->
      <mat-card *ngIf="generatedReport" class="report-card">
        <mat-card-header>
          <mat-card-title>{{ getReportTitle() }}</mat-card-title>
          <mat-card-subtitle>{{ getReportSubtitle() }}</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <!-- Daily Report -->
          <div *ngIf="selectedReportType === 'daily' && generatedReport" class="daily-report">
            <!-- <app-daily-operations-report [data]="generatedReport"></app-daily-operations-report> -->
            <div class="placeholder">
              <h4>Daily Operations Report</h4>
              <p>Report data: {{ generatedReport | json }}</p>
            </div>
          </div>
          
          <!-- Monthly Report -->
          <div *ngIf="selectedReportType === 'monthly' && generatedReport" class="monthly-report">
            <!-- <app-monthly-financial-report [data]="generatedReport"></app-monthly-financial-report> -->
            <div class="placeholder">
              <h4>Monthly Financial Report</h4>
              <p>Report data: {{ generatedReport | json }}</p>
            </div>
          </div>
          
          <!-- Employee Performance Report -->
          <div *ngIf="selectedReportType === 'employee' && generatedReport" class="employee-report">
            <!-- <app-employee-performance-report [data]="generatedReport"></app-employee-performance-report> -->
            <div class="placeholder">
              <h4>Employee Performance Report</h4>
              <p>Report data: {{ generatedReport | json }}</p>
            </div>
          </div>
          
          <!-- Meal Performance Report -->
          <div *ngIf="selectedReportType === 'meal' && generatedReport" class="meal-report">
            <app-meal-performance-report [data]="generatedReport"></app-meal-performance-report>
          </div>
          
          <!-- Audit Report -->
          <div *ngIf="selectedReportType === 'audit' && generatedReport" class="audit-report">
            <app-audit-report [data]="generatedReport"></app-audit-report>
          </div>
        </mat-card-content>
      </mat-card>
      
      <!-- Loading State -->
      <div *ngIf="loading" class="text-center py-5">
        <mat-spinner diameter="50"></mat-spinner>
        <p class="mt-3">Generating report...</p>
      </div>
    </div>
  `,
  styles: [`
    .reports-container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }
    
    .report-card {
      margin-top: 1rem;
    }
    
    .spin {
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      100% { transform: rotate(360deg); }
    }
    
    .daily-report, .monthly-report, .employee-report, .meal-report, .audit-report {
      margin-top: 2rem;
    }
    
    .placeholder {
      padding: 2rem;
      text-align: center;
      background-color: #f5f5f5;
      border-radius: 4px;
    }
    
    .placeholder h4 {
      margin-bottom: 1rem;
      color: #333;
    }
    
    .placeholder p {
      color: #666;
      font-family: monospace;
      font-size: 0.8rem;
      white-space: pre-wrap;
      max-height: 300px;
      overflow-y: auto;
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
  
  exportCurrentReport() {
    if (!this.generatedReport || !this.selectedReportType) {
      return;
    }

    const payload = {
      reportType: this.selectedReportType,
      generatedAt: new Date().toISOString(),
      params: this.getExportParams(),
      data: this.generatedReport
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json'
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.selectedReportType}-report-${this.formatDate(new Date())}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    this.snackBar.open('Report exported as JSON', 'Close', { duration: 3000 });
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
}
