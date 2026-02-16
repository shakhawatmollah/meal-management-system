import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { DashboardService } from '../../../../core/services/api/dashboard-api.service';
import { DashboardStats } from '../../../../core/models/api.models';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatChipsModule,
    MatGridListModule
  ],
  template: `
    <div class="dashboard-container">
      <h1 class="dashboard-title">Dashboard</h1>
      
      <!-- Stats Cards -->
      <div class="stats-grid">
        <mat-card class="stat-card">
          <mat-card-content class="stat-content">
            <mat-icon class="stat-icon">restaurant</mat-icon>
            <div class="stat-info">
              <h3>{{ stats?.totalOrders || 0 }}</h3>
              <p>Total Orders</p>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content class="stat-content">
            <mat-icon class="stat-icon">restaurant_menu</mat-icon>
            <div class="stat-info">
              <h3>{{ stats?.totalMeals || 0 }}</h3>
              <p>Total Meals</p>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content class="stat-content">
            <mat-icon class="stat-icon">people</mat-icon>
            <div class="stat-info">
              <h3>{{ stats?.totalEmployees || 0 }}</h3>
              <p>Total Employees</p>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content class="stat-content">
            <mat-icon class="stat-icon">today</mat-icon>
            <div class="stat-info">
              <h3>{{ stats?.todayOrders || 0 }}</h3>
              <p>Today's Orders</p>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card revenue">
          <mat-card-content class="stat-content">
            <mat-icon class="stat-icon">attach_money</mat-icon>
            <div class="stat-info">
              <h3>{{ stats?.monthlyRevenue | currency:'USD' }}</h3>
              <p>Monthly Revenue</p>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Top Meals and Recent Orders -->
      <div class="content-grid">
        <!-- Top Meals -->
        <mat-card class="content-card">
          <mat-card-header>
            <mat-card-title>Top Meals</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div *ngIf="isLoading" class="loading-container">
              <mat-spinner diameter="40"></mat-spinner>
            </div>
            <div *ngIf="!isLoading" class="meals-list">
              <div *ngFor="let meal of stats?.topMeals; trackBy: trackByMealId" class="meal-item">
                <div class="meal-info">
                  <h4>{{ meal.mealName }}</h4>
                  <p>{{ meal.orderCount }} orders</p>
                  <p class="revenue">{{ meal.totalRevenue | currency:'USD' }}</p>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Recent Orders -->
        <mat-card class="content-card">
          <mat-card-header>
            <mat-card-title>Recent Orders</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div *ngIf="isLoading" class="loading-container">
              <mat-spinner diameter="40"></mat-spinner>
            </div>
            <div *ngIf="!isLoading" class="orders-list">
              <div *ngFor="let order of stats?.recentOrders; trackBy: trackByOrderId" class="order-item">
                <div class="order-header">
                  <span class="order-id">#{{ order.id }}</span>
                  <mat-chip [color]="getStatusColor(order.status)" class="status-chip">
                    {{ order.status }}
                  </mat-chip>
                </div>
                <div class="order-details">
                  <p><strong>{{ order.employee.name }}</strong> - {{ order.meal.name }}</p>
                  <p>{{ order.orderDate | date:'mediumDate' | uppercase }}</p>
                  <p class="price">{{ order.totalPrice | currency:'USD' }}</p>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .dashboard-title {
      margin-bottom: 2rem;
      color: #333;
      font-weight: 300;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      transition: transform 0.2s ease-in-out;
    }

    .stat-card:hover {
      transform: translateY(-5px);
    }

    .stat-content {
      display: flex;
      align-items: center;
      padding: 1.5rem;
    }

    .stat-icon {
      font-size: 2.5rem;
      margin-right: 1rem;
      color: #667eea;
    }

    .stat-info h3 {
      margin: 0;
      font-size: 2rem;
      font-weight: 500;
      color: #333;
    }

    .stat-info p {
      margin: 0.5rem 0 0 0;
      color: #666;
      font-size: 0.9rem;
    }

    .revenue .stat-icon {
      color: #4caf50;
    }

    .content-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }

    .content-card {
      height: 400px;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 200px;
    }

    .meals-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      max-height: 300px;
      overflow-y: auto;
    }

    .meal-item {
      padding: 1rem;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      background: #fafafa;
    }

    .meal-info h4 {
      margin: 0 0 0.5rem 0;
      color: #333;
    }

    .meal-info p {
      margin: 0.25rem 0;
      color: #666;
      font-size: 0.9rem;
    }

    .revenue {
      font-weight: 500;
      color: #4caf50;
    }

    .orders-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      max-height: 300px;
      overflow-y: auto;
    }

    .order-item {
      padding: 1rem;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      background: #fafafa;
    }

    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .order-id {
      font-weight: 500;
      color: #333;
    }

    .status-chip {
      font-size: 0.8rem;
    }

    .order-details p {
      margin: 0.25rem 0;
      color: #666;
      font-size: 0.9rem;
    }

    .price {
      font-weight: 500;
      color: #4caf50;
    }

    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
      }
      
      .content-grid {
        grid-template-columns: 1fr;
      }
      
      .dashboard-container {
        padding: 1rem;
      }
    }
  `]
})
export class DashboardComponent {
  stats: DashboardStats | null = null;
  isLoading = true;

  constructor(
    private dashboardService: DashboardService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadDashboardStats();
  }

  private loadDashboardStats(): void {
    this.dashboardService.getDashboardStats().subscribe({
      next: (response) => {
        this.stats = response.data;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.snackBar.open('Failed to load dashboard data', 'Close', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'PENDING': return 'primary';
      case 'CONFIRMED': return 'accent';
      case 'PREPARED': return 'warn';
      case 'DELIVERED': return 'primary';
      case 'CANCELLED': return 'warn';
      default: return '';
    }
  }

  trackByMealId(index: number, meal: any): number {
    return meal.mealId;
  }

  trackByOrderId(index: number, order: any): number {
    return order.id;
  }
}
