import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { AuditReport } from '../../../../core/services/report.service';

@Component({
  selector: 'app-audit-report',
  template: `
    <div class="audit-report">
      <h3>Audit Trail Report - {{ data.startDate | date:'mediumDate' }} to {{ data.endDate | date:'mediumDate' }}</h3>
      
      <!-- Summary Statistics -->
      <mat-card class="mb-3">
        <mat-card-header>
          <mat-card-title>Audit Summary</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="metrics-grid">
            <div class="metric">
              <div class="metric-value">{{ data.totalActions }}</div>
              <div class="metric-label">Total Actions</div>
            </div>
            <div class="metric">
              <div class="metric-value">{{ getUniqueUsers() }}</div>
              <div class="metric-label">Unique Users</div>
            </div>
            <div class="metric">
              <div class="metric-value">{{ getFailedLogins() }}</div>
              <div class="metric-label">Failed Logins</div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
      
      <!-- Recent Activities -->
      <mat-card>
        <mat-card-header>
          <mat-card-title>Suspicious Activities</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="activity-list">
            <div class="activity-item" *ngFor="let activity of data.suspiciousActivity">
              <div class="activity-header">
                <span class="action">{{ activity.action }}</span>
                <span class="timestamp">{{ activity.timestamp | date:'short' }}</span>
              </div>
              <div class="activity-details">
                <span class="user">User: {{ activity.userId }}</span>
                <span class="ip">IP: {{ activity.ipAddress }}</span>
              </div>
            </div>
            <div class="activity-item" *ngIf="!data.suspiciousActivity?.length">
              <span>No suspicious activities in selected range.</span>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .audit-report {
      padding: 1rem;
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
    
    .activity-list {
      max-height: 400px;
      overflow-y: auto;
    }
    
    .activity-item {
      padding: 1rem;
      border-bottom: 1px solid #e0e0e0;
    }
    
    .activity-item:last-child {
      border-bottom: none;
    }
    
    .activity-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
    }
    
    .action {
      font-weight: 600;
      color: #333;
    }
    
    .timestamp {
      color: #666;
      font-size: 0.9rem;
    }
    
    .activity-details {
      display: flex;
      gap: 1rem;
      font-size: 0.9rem;
      color: #666;
    }
  `],
  imports: [CommonModule, MatCardModule],
  standalone: true
})
export class AuditReportComponent implements OnChanges {
  
  @Input() data!: AuditReport;
  
  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] && this.data) {
      console.log('Audit report data loaded:', this.data);
    }
  }

  getUniqueUsers(): number {
    return this.data?.userActivity?.length || 0;
  }

  getFailedLogins(): number {
    return this.data?.actionBreakdown?.find(a => a.action?.toUpperCase().includes('LOGIN_FAILED'))?.actionCount || 0;
  }
}
