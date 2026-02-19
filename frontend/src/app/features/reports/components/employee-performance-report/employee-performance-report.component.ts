import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { EmployeePerformanceReport } from '../../../../core/services/report.service';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-employee-performance-report',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule
  ],
  template: `
    <div class="employee-performance-report">
      <!-- Performance Overview -->
      <div class="row mb-4">
        <div class="col-md-3">
          <mat-card class="metric-card">
            <mat-card-content>
              <div class="metric-value">{{ data.employeeStats.length }}</div>
              <div class="metric-label">Total Employees</div>
              <div class="metric-icon">
                <mat-icon>people</mat-icon>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
        
        <div class="col-md-3">
          <mat-card class="metric-card">
            <mat-card-content>
              <div class="metric-value">{{ getActiveEmployeesCount() }}</div>
              <div class="metric-label">Active Employees</div>
              <div class="metric-icon">
                <mat-icon>person</mat-icon>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
        
        <div class="col-md-3">
          <mat-card class="metric-card">
            <mat-card-content>
              <div class="metric-value">{{ getAverageOrders() }}</div>
              <div class="metric-label">Avg Orders/Employee</div>
              <div class="metric-icon">
                <mat-icon>shopping_cart</mat-icon>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
        
        <div class="col-md-3">
          <mat-card class="metric-card">
            <mat-card-content>
              <div class="metric-value">{{ getAverageUtilization() | number:'1.1' }}%</div>
              <div class="metric-label">Avg Budget Utilization</div>
              <div class="metric-icon">
                <mat-icon>pie_chart</mat-icon>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
      
      <!-- Budget Analysis -->
      <div class="row mb-4">
        <div class="col-md-8">
          <mat-card>
            <mat-card-header>
              <mat-card-title>Budget Analysis</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="row">
                <div class="col-md-4" *ngFor="let analysis of data.budgetAnalysis">
                  <div class="budget-analysis-card" [ngClass]="getBudgetAnalysisClass(analysis.category)">
                    <div class="analysis-header">
                      <h5>{{ analysis.category.replace(/_/g, ' ') }}</h5>
                      <span class="employee-count">{{ analysis.employeeCount }} employees</span>
                    </div>
                    <div class="analysis-metrics">
                      <div class="metric">
                        <span class="label">Budget:</span>
                        <span class="value">&dollar;{{ analysis.totalBudget | number:'1.2-2' }}</span>
                      </div>
                      <div class="metric">
                        <span class="label">Spent:</span>
                        <span class="value">&dollar;{{ analysis.totalSpent | number:'1.2-2' }}</span>
                      </div>
                      <div class="metric">
                        <span class="label">% of Employees:</span>
                        <span class="value">{{ analysis.percentageOfEmployees | number:'1.1' }}%</span>
                      </div>
                    </div>
                    <mat-progress-bar 
                      mode="determinate" 
                      [value]="getUtilizationPercentage(analysis.totalBudget, analysis.totalSpent)"
                      [color]="getProgressBarColor(analysis.category)">
                    </mat-progress-bar>
                  </div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
        
        <div class="col-md-4">
          <mat-card>
            <mat-card-header>
              <mat-card-title>Budget Distribution</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="text-center py-4">
                <mat-icon class="large-icon">pie_chart</mat-icon>
                <p class="mt-2">Budget Distribution Chart</p>
                <div class="row mt-3">
                  <div class="col-4" *ngFor="let analysis of data.budgetAnalysis">
                    <div class="chart-legend-item">
                      <div class="legend-color" [style.background-color]="getLegendColor(analysis.category)"></div>
                      <small>{{ analysis.category.replace(/_/g, ' ') }}</small>
                    </div>
                  </div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
      
      <!-- Department Performance -->
      <div class="row mb-4">
        <div class="col-12">
          <mat-card>
            <mat-card-header>
              <mat-card-title>Department Performance</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Total Employees</th>
                    <th>Active Employees</th>
                    <th>Total Budget</th>
                    <th>Total Spent</th>
                    <th>Utilization Rate</th>
                    <th>Total Orders</th>
                    <th>Performance</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let dept of data.departmentStats">
                    <td>{{ dept.department }}</td>
                    <td>{{ dept.totalEmployees }}</td>
                    <td>
                      <span [ngClass]="getActiveEmployeeClass(dept.totalEmployees, dept.activeEmployees)">
                        {{ dept.activeEmployees }}
                      </span>
                      <small class="text-muted">({{ getActivePercentage(dept.totalEmployees, dept.activeEmployees) | number:'1.1' }}%)</small>
                    </td>
                    <td>{{ dept.totalBudget | currency:'USD' }}</td>
                    <td>{{ dept.totalSpent | currency:'USD' }}</td>
                    <td>
                      <mat-progress-bar 
                        mode="determinate" 
                        [value]="dept.utilizationRate"
                        [color]="getProgressBarColorForRate(dept.utilizationRate)">
                      </mat-progress-bar>
                      <small>{{ dept.utilizationRate | number:'1.1' }}%</small>
                    </td>
                    <td>{{ dept.totalOrders }}</td>
                    <td>
                      <mat-icon [ngClass]="getPerformanceIconClass(dept.utilizationRate)">
                        {{ getPerformanceIcon(dept.utilizationRate) }}
                      </mat-icon>
                    </td>
                  </tr>
                </tbody>
              </table>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
      
      <!-- Top Performers -->
      <div class="row mb-4">
        <div class="col-md-6">
          <mat-card>
            <mat-card-header>
              <mat-card-title>Top Performers</mat-card-title>
              <mat-card-subtitle>Employees with highest order volume</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="performer-list">
                <div class="performer-item" *ngFor="let performer of data.topPerformers">
                  <div class="performer-rank">{{ performer.employeeName.charAt(0) }}</div>
                  <div class="performer-details">
                    <div class="performer-name">{{ performer.employeeName }}</div>
                    <div class="performer-dept">{{ performer.department }}</div>
                  </div>
                  <div class="performer-metrics">
                    <div class="metric">
                      <span class="value">{{ performer.totalOrders }}</span>
                      <span class="label">orders</span>
                    </div>
                    <div class="metric">
                      <span class="value">{{ performer.avgOrderValue | currency:'USD' }}</span>
                      <span class="label">avg</span>
                    </div>
                  </div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
        
        <div class="col-md-6">
          <mat-card>
            <mat-card-header>
              <mat-card-title class="text-warning">Budget Overruns</mat-card-title>
              <mat-card-subtitle>Employees exceeding budget limits</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="overrun-list" *ngIf="data.budgetOverruns.length > 0">
                <div class="overrun-item" *ngFor="let overrun of data.budgetOverruns">
                  <div class="overrun-icon">
                    <mat-icon class="text-warning">warning</mat-icon>
                  </div>
                  <div class="overrun-details">
                    <div class="overrun-name">{{ overrun.employeeName }}</div>
                    <div class="overrun-dept">{{ overrun.department }}</div>
                  </div>
                  <div class="overrun-metrics">
                    <div class="metric">
                      <span class="value text-warning">{{ overrun.utilizationPercentage | number:'1.1' }}%</span>
                      <span class="label">utilization</span>
                    </div>
                    <div class="metric">
                      <span class="value text-danger">{{ overrun.currentSpent - overrun.monthlyBudget | currency:'USD' }}</span>
                      <span class="label">over</span>
                    </div>
                  </div>
                </div>
              </div>
              <div *ngIf="data.budgetOverruns.length === 0" class="text-center py-4">
                <mat-icon class="text-success large-icon">check_circle</mat-icon>
                <p class="text-success mt-2">No budget overruns this month!</p>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
      
      <!-- Detailed Employee Table -->
      <div class="row">
        <div class="col-12">
          <mat-card>
            <mat-card-header>
              <mat-card-title class="d-flex justify-content-between align-items-center">
                <span>Employee Performance Details</span>
                <div>
                  <mat-form-field appearance="outline" class="search-field">
                    <mat-label>Search Employees</mat-label>
                    <input matInput [(ngModel)]="searchTerm" (keyup)="filterEmployees()" placeholder="Search by name or department">
                    <mat-icon matSuffix>search</mat-icon>
                  </mat-form-field>
                </div>
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Department</th>
                      <th>Budget</th>
                      <th>Spent</th>
                      <th>Remaining</th>
                      <th>Orders</th>
                      <th>Avg Order</th>
                      <th>Utilization</th>
                      <th>Last Order</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let emp of filteredEmployees">
                      <td>
                        <div class="employee-info">
                          <div class="employee-name">{{ emp.employeeName }}</div>
                          <small class="text-muted">{{ emp.department }}</small>
                        </div>
                      </td>
                      <td>{{ emp.department }}</td>
                      <td>{{ (emp.monthlyBudget || 0) | currency:'USD' }}</td>
                      <td>{{ (emp.currentSpent || 0) | currency:'USD' }}</td>
                      <td [ngClass]="getRemainingClass((emp.monthlyBudget || 0) - (emp.currentSpent || 0))">
                        {{ ((emp.monthlyBudget || 0) - (emp.currentSpent || 0)) | currency:'USD' }}
                      </td>
                      <td>{{ emp.totalOrders }}</td>
                      <td>{{ emp.avgOrderValue | currency:'USD' }}</td>
                      <td>
                        <mat-progress-bar 
                          mode="determinate" 
                          [value]="emp.utilizationPercentage"
                          [color]="getProgressBarColorForRate(emp.utilizationPercentage)">
                        </mat-progress-bar>
                        <small>{{ emp.utilizationPercentage | number:'1.1' }}%</small>
                      </td>
                      <td>
                      <span [ngClass]="getLastOrderClass(emp.lastOrderDate)">
                        {{ emp.lastOrderDate ? (emp.lastOrderDate | date:'shortDate') : 'N/A' }}
                      </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .employee-performance-report {
      padding: 1rem;
    }
    
    .metric-card {
      text-align: center;
      height: 120px;
      border-left: 4px solid #1976d2;
    }
    
    .metric-value {
      font-size: 2rem;
      font-weight: bold;
      color: #1976d2;
      margin-bottom: 0.5rem;
    }
    
    .metric-label {
      font-size: 0.9rem;
      color: #666;
      margin-bottom: 0.5rem;
    }
    
    .metric-icon {
      color: #1976d2;
    }
    
    .budget-analysis-card {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1rem;
    }
    
    .budget-analysis-card.ON_TRACK {
      border-left: 4px solid #4caf50;
    }
    
    .budget-analysis-card.OVER_BUDGET {
      border-left: 4px solid #f44336;
    }
    
    .budget-analysis-card.UNDER_UTILIZED {
      border-left: 4px solid #ff9800;
    }
    
    .analysis-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    
    .analysis-header h5 {
      margin: 0;
      font-weight: 600;
    }
    
    .employee-count {
      background: #e3f2fd;
      color: #1976d2;
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.75rem;
    }
    
    .analysis-metrics {
      display: flex;
      justify-content: space-between;
      margin-bottom: 1rem;
    }
    
    .analysis-metrics .metric {
      text-align: center;
    }
    
    .analysis-metrics .label {
      display: block;
      font-size: 0.75rem;
      color: #666;
    }
    
    .analysis-metrics .value {
      display: block;
      font-weight: 600;
      color: #333;
    }
    
    .performer-list, .overrun-list {
      max-height: 400px;
      overflow-y: auto;
    }
    
    .performer-item, .overrun-item {
      display: flex;
      align-items: center;
      padding: 0.75rem;
      border-bottom: 1px solid #f0f0f0;
    }
    
    .performer-rank {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #1976d2;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      margin-right: 1rem;
    }
    
    .overrun-icon {
      margin-right: 1rem;
      color: #ff9800;
    }
    
    .performer-details, .overrun-details {
      flex: 1;
    }
    
    .performer-name, .overrun-name {
      font-weight: 600;
      color: #333;
    }
    
    .performer-dept, .overrun-dept {
      font-size: 0.875rem;
      color: #666;
    }
    
    .performer-metrics, .overrun-metrics {
      display: flex;
      gap: 1rem;
    }
    
    .performer-metrics .metric, .overrun-metrics .metric {
      text-align: center;
    }
    
    .performer-metrics .value, .overrun-metrics .value {
      display: block;
      font-weight: bold;
      font-size: 0.875rem;
    }
    
    .performer-metrics .label, .overrun-metrics .label {
      display: block;
      font-size: 0.75rem;
      color: #666;
    }
    
    .employee-info {
      display: flex;
      flex-direction: column;
    }
    
    .employee-name {
      font-weight: 600;
      color: #333;
    }
    
    .search-field {
      width: 300px;
    }
    
    .large-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
    }
    
    .text-success {
      color: #4caf50 !important;
    }
    
    .text-warning {
      color: #ff9800 !important;
    }
    
    .text-danger {
      color: #f44336 !important;
    }
    
    .table {
      font-size: 0.9rem;
    }
    
    .table th {
      background-color: #f8f9fa;
      font-weight: 600;
    }
    
    .chart-legend-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }
    
    .legend-color {
      width: 12px;
      height: 12px;
      border-radius: 2px;
    }
  `]
})
export class EmployeePerformanceReportComponent implements OnChanges {
  
  @Input() data!: EmployeePerformanceReport;
  
  budgetChartData: any[] = [];
  budgetChartLabels: string[] = [];
  filteredEmployees: any[] = [];
  searchTerm: string = '';
  
  pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };
  
  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] && this.data) {
      this.prepareChartData();
      this.filterEmployees();
    }
  }
  
  private prepareChartData() {
    // Prepare budget chart data
    this.budgetChartLabels = this.data.budgetAnalysis.map(b => b.category.replace(/_/g, ' '));
    this.budgetChartData = [{
      data: this.data.budgetAnalysis.map(b => b.employeeCount),
      backgroundColor: [
        '#4caf50',
        '#f44336',
        '#ff9800'
      ],
      borderWidth: 2
    }];
  }
  
  filterEmployees() {
    if (!this.searchTerm) {
      this.filteredEmployees = this.data.employeeStats;
    } else {
      const searchLower = this.searchTerm.toLowerCase();
      this.filteredEmployees = this.data.employeeStats.filter(emp =>
        emp.employeeName.toLowerCase().includes(searchLower) ||
        emp.department.toLowerCase().includes(searchLower)
      );
    }
  }
  
  getActiveEmployeesCount(): number {
    return this.data.departmentStats.reduce((sum, dept) => sum + dept.activeEmployees, 0);
  }
  
  getAverageOrders(): number {
    const totalOrders = this.data.employeeStats.reduce((sum, emp) => sum + emp.totalOrders, 0);
    return this.data.employeeStats.length > 0 ? Math.round(totalOrders / this.data.employeeStats.length) : 0;
  }
  
  getAverageUtilization(): number {
    const totalUtilization = this.data.employeeStats.reduce((sum, emp) => sum + emp.utilizationPercentage, 0);
    return this.data.employeeStats.length > 0 ? totalUtilization / this.data.employeeStats.length : 0;
  }
  
  getActivePercentage(total: number, active: number): number {
    return total > 0 ? (active / total) * 100 : 0;
  }
  
  getActiveEmployeeClass(total: number, active: number): string {
    const percentage = this.getActivePercentage(total, active);
    if (percentage >= 90) return 'text-success';
    if (percentage >= 70) return 'text-warning';
    return 'text-danger';
  }
  
  getUtilizationPercentage(budget: number, spent: number): number {
    return budget > 0 ? (spent / budget) * 100 : 0;
  }
  
  getProgressBarColor(category: string): string {
    switch (category) {
      case 'ON_TRACK': return 'primary';
      case 'OVER_BUDGET': return 'warn';
      case 'UNDER_UTILIZED': return 'accent';
      default: return 'primary';
    }
  }
  
  getProgressBarColorForRate(rate: number): string {
    if (rate > 100) return 'warn';
    if (rate < 50) return 'accent';
    return 'primary';
  }
  
  getPerformanceIcon(rate: number): string {
    if (rate > 100) return 'trending_up';
    if (rate < 50) return 'trending_down';
    return 'trending_flat';
  }
  
  getPerformanceIconClass(rate: number): string {
    if (rate > 100) return 'text-success';
    if (rate < 50) return 'text-danger';
    return 'text-warning';
  }
  
  getBudgetAnalysisClass(category: string): string {
    return category;
  }
  
  getLegendColor(category: string): string {
    switch (category) {
      case 'ON_TRACK': return '#4caf50';
      case 'OVER_BUDGET': return '#f44336';
      case 'UNDER_UTILIZED': return '#ff9800';
      default: return '#1976d2';
    }
  }
  
  getRemainingClass(remaining: number): string {
    if (typeof remaining !== 'number' || isNaN(remaining)) return 'text-warning';
    if (remaining < 0) return 'text-danger';
    if (remaining > 50) return 'text-success';
    return 'text-warning';
  }
  
  getLastOrderClass(lastOrder: string): string {
    const daysSinceOrder = Math.floor((Date.now() - new Date(lastOrder).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceOrder <= 7) return 'text-success';
    if (daysSinceOrder <= 14) return 'text-warning';
    return 'text-danger';
  }
}
