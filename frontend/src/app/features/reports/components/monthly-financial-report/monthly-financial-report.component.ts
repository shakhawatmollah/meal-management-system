import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { MonthlyFinancialReport } from '../../../../core/services/report.service';

@Component({
  selector: 'app-monthly-financial-report',
  templateUrl: './monthly-financial-report.component.html',
  standalone: true,
  imports: [CommonModule, DatePipe, DecimalPipe],
  styles: [`
    .monthly-financial-report {
      padding: 1rem;
    }
    
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }
    
    .metric-card {
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      padding: 1.5rem;
      text-align: center;
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
    }
    
    .budget-analysis {
      background: #fff;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 2rem;
    }
    
    .budget-metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }
    
    .budget-metric {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0;
      border-bottom: 1px solid #eee;
    }
    
    .label {
      font-weight: 500;
      color: #666;
    }
    
    .value {
      font-weight: bold;
      color: #333;
    }
    
    .table {
      width: 100%;
      font-size: 0.9rem;
      margin-bottom: 2rem;
    }
    
    .table th {
      background-color: #f8f9fa;
      font-weight: 600;
      border-bottom: 2px solid #dee2e6;
    }
    
    .table td, .table th {
      padding: 0.75rem;
      border-bottom: 1px solid #dee2e6;
    }
    
    .status-badge {
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    
    .status-badge.primary {
      background: #e3f2fd;
      color: #1976d2;
    }
    
    .status-badge.warn {
      background: #fff3e0;
      color: #f57c00;
    }
    
    .status-badge.accent {
      background: #f3e5f5;
      color: #7b1fa2;
    }
  `]
})
export class MonthlyFinancialReportComponent implements OnChanges {
  
  @Input() data!: MonthlyFinancialReport;
  
  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] && this.data) {
      console.log('Monthly report data loaded:', this.data);
    }
  }
  
  getBudgetStatus(): string {
    const utilization = this.data.budgetUtilizationRate;
    if (utilization > 100) return 'OVER BUDGET';
    if (utilization < 50) return 'UNDER UTILIZED';
    return 'ON TRACK';
  }
  
  getStatusClass(status: string): string {
    switch (status) {
      case 'ON_TRACK': return 'primary';
      case 'OVER_BUDGET': return 'warn';
      case 'UNDER_UTILIZED': return 'accent';
      default: return 'primary';
    }
  }
}
