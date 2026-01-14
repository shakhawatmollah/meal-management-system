import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DatePipe, DecimalPipe, NgForOf } from '@angular/common';
import { DailyOperationsReport } from '../../../../core/services/report.service';

@Component({
  selector: 'app-daily-operations-report',
  templateUrl: './daily-operations-report.component.html',
  standalone: true,
  imports: [NgForOf, DatePipe, DecimalPipe],
  styles: [`
    .daily-operations-report {
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
    
    .summary-section {
      background: #fff;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 2rem;
    }
    
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }
    
    .summary-item {
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
  `]
})
export class DailyOperationsReportComponent implements OnChanges {
  
  @Input() data?: DailyOperationsReport;
  
  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] && this.data) {
      console.log('Daily report data loaded:', this.data);
    }
  }
}
