import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-meal-performance-report',
  templateUrl: './meal-performance-report.component.html',
  styles: [`
    .meal-performance-report {
      padding: 1rem;
    }
    
    .meal-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1rem;
    }
    
    .meal-item {
      padding: 1rem;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
    }
    
    .meal-name {
      font-weight: 600;
      margin-bottom: 0.5rem;
    }
    
    .meal-stats {
      display: flex;
      justify-content: space-between;
      font-size: 0.9rem;
      color: #666;
    }
    
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }
    
    .metric {
      text-align: center;
      padding: 1rem;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
    }
    
    .metric-value {
      font-size: 1.5rem;
      font-weight: 600;
      color: #1976d2;
    }
    
    .metric-label {
      font-size: 0.9rem;
      color: #666;
      margin-top: 0.25rem;
    }
  `],
  imports: [CommonModule, MatCardModule],
  standalone: true
})
export class MealPerformanceReportComponent implements OnChanges {
  
  @Input() data: any;
  
  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] && this.data) {
      console.log('Meal performance report data loaded:', this.data);
    }
  }
}
