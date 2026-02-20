import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DashboardService } from '../../../../core/services/api/dashboard-api.service';
import { DashboardStats } from '../../../../core/models/api.models';
import { catchError, map, Observable, of, shareReplay, startWith } from 'rxjs';

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
    <div class="dashboard-container page-enter">
      <section class="dashboard-hero">
        <div>
          <p class="eyebrow">Operations Snapshot</p>
          <h1 class="dashboard-title">Dashboard</h1>
          <p class="dashboard-subtitle">Track orders, meals, staff activity, and revenue in one place.</p>
        </div>
      </section>

      <ng-container *ngIf="stats$ | async as stats; else loadingState">
        <!-- Stats Cards -->
        <div class="stats-grid">
          <mat-card class="stat-card accent-a">
            <mat-card-content class="stat-content">
              <mat-icon class="stat-icon">restaurant</mat-icon>
              <div class="stat-info">
                <h3>{{ stats.totalOrders }}</h3>
                <p>Total Orders</p>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card accent-b">
            <mat-card-content class="stat-content">
              <mat-icon class="stat-icon">restaurant_menu</mat-icon>
              <div class="stat-info">
                <h3>{{ stats.totalMeals }}</h3>
                <p>Total Meals</p>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card accent-c">
            <mat-card-content class="stat-content">
              <mat-icon class="stat-icon">people</mat-icon>
              <div class="stat-info">
                <h3>{{ stats.totalEmployees }}</h3>
                <p>Total Employees</p>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card accent-d">
            <mat-card-content class="stat-content">
              <mat-icon class="stat-icon">today</mat-icon>
              <div class="stat-info">
                <h3>{{ stats.todayOrders }}</h3>
                <p>Today's Orders</p>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card revenue">
            <mat-card-content class="stat-content">
              <mat-icon class="stat-icon">attach_money</mat-icon>
              <div class="stat-info">
                <h3>{{ stats.monthlyRevenue | currency:'USD' }}</h3>
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
              <div class="meals-list" *ngIf="stats.topMeals.length; else emptyMeals">
                <div *ngFor="let meal of stats.topMeals; trackBy: trackByMealId" class="meal-item">
                  <div class="meal-info">
                    <h4>{{ meal.mealName }}</h4>
                    <p>{{ meal.orderCount }} orders</p>
                    <p class="revenue">{{ meal.totalRevenue | currency:'USD' }}</p>
                  </div>
                </div>
              </div>
              <ng-template #emptyMeals>
                <p class="empty-message">No meal analytics available yet.</p>
              </ng-template>
            </mat-card-content>
          </mat-card>

          <!-- Recent Orders -->
          <mat-card class="content-card">
            <mat-card-header>
              <mat-card-title>Recent Orders</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="orders-list" *ngIf="stats.recentOrders.length; else emptyOrders">
                <div *ngFor="let order of stats.recentOrders; trackBy: trackByOrderId" class="order-item">
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
              <ng-template #emptyOrders>
                <p class="empty-message">No recent orders found.</p>
              </ng-template>
            </mat-card-content>
          </mat-card>
        </div>
      </ng-container>

      <ng-template #loadingState>
        <div class="dashboard-skeleton">
          <div class="skeleton-stats">
            <div class="skeleton-card stat-skeleton" *ngFor="let _ of [1,2,3,4,5]">
              <div class="skeleton skeleton-line lg"></div>
              <div class="skeleton skeleton-line"></div>
            </div>
          </div>
          <div class="skeleton-panels">
            <div class="skeleton-card panel-skeleton" *ngFor="let _ of [1,2]">
              <div class="skeleton skeleton-line lg"></div>
              <div class="skeleton skeleton-line"></div>
              <div class="skeleton skeleton-line"></div>
              <div class="skeleton skeleton-line"></div>
            </div>
          </div>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 0.4rem;
      max-width: 1280px;
      margin: 0 auto;
    }

    .dashboard-hero {
      margin-bottom: 1rem;
      padding: 1.2rem 1.25rem;
      border-radius: 18px;
      color: #0f172a;
      border: 1px solid #d8e5f3;
      background: linear-gradient(135deg, #ecfeff 0%, #eaf2ff 52%, #fdf4ff 100%);
    }

    .eyebrow {
      margin: 0 0 0.3rem;
      color: #0f766e;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-size: 0.75rem;
      font-weight: 700;
    }

    .dashboard-title {
      margin: 0;
      font-weight: 700;
      font-size: 1.55rem;
    }

    .dashboard-subtitle {
      margin: 0.35rem 0 0;
      color: #475569;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(215px, 1fr));
      gap: 0.85rem;
      margin-bottom: 1rem;
    }

    .stat-card {
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      border: 1px solid #dce6f3;
      overflow: hidden;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 14px 28px rgba(15, 23, 42, 0.12);
    }

    .accent-a { background: linear-gradient(150deg, #f8fafc 0%, #e0f2fe 100%); }
    .accent-b { background: linear-gradient(150deg, #f8fafc 0%, #dcfce7 100%); }
    .accent-c { background: linear-gradient(150deg, #f8fafc 0%, #ede9fe 100%); }
    .accent-d { background: linear-gradient(150deg, #f8fafc 0%, #ffedd5 100%); }
    .revenue { background: linear-gradient(150deg, #f8fafc 0%, #d1fae5 100%); }

    .content-card {
      min-height: 380px;
    }

    .stat-content {
      display: flex;
      align-items: center;
      padding: 1.1rem 1rem;
    }

    .stat-icon {
      font-size: 2.1rem;
      width: 2.1rem;
      height: 2.1rem;
      margin-right: 0.8rem;
      color: #0284c7;
    }

    .stat-info h3 {
      margin: 0;
      font-size: 1.6rem;
      font-weight: 700;
      color: #0f172a;
    }

    .stat-info p {
      margin: 0.35rem 0 0 0;
      color: #475569;
      font-size: 0.82rem;
    }

    .content-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.95rem;
    }

    .dashboard-skeleton {
      display: grid;
      gap: 0.95rem;
    }

    .skeleton-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(215px, 1fr));
      gap: 0.85rem;
    }

    .stat-skeleton,
    .panel-skeleton {
      padding: 1rem;
      display: grid;
      gap: 0.55rem;
    }

    .skeleton-panels {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.95rem;
    }

    .meals-list {
      display: flex;
      flex-direction: column;
      gap: 0.7rem;
      max-height: 305px;
      overflow-y: auto;
      padding-right: 0.2rem;
    }

    .meal-item {
      padding: 0.85rem;
      border: 1px solid #d8e4f0;
      border-radius: 12px;
      background: linear-gradient(130deg, #ffffff 0%, #f6faff 100%);
    }

    .meal-info h4 {
      margin: 0 0 0.3rem 0;
      color: #0f172a;
      font-size: 0.98rem;
    }

    .meal-info p {
      margin: 0.1rem 0;
      color: #64748b;
      font-size: 0.82rem;
    }

    .revenue {
      font-weight: 700;
      color: #059669;
    }

    .orders-list {
      display: flex;
      flex-direction: column;
      gap: 0.7rem;
      max-height: 305px;
      overflow-y: auto;
      padding-right: 0.2rem;
    }

    .order-item {
      padding: 0.85rem;
      border: 1px solid #d8e4f0;
      border-radius: 12px;
      background: linear-gradient(130deg, #ffffff 0%, #f8fbff 100%);
    }

    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .order-id {
      font-weight: 700;
      color: #0f172a;
    }

    .status-chip {
      font-size: 0.72rem;
    }

    .order-details p {
      margin: 0.18rem 0;
      color: #64748b;
      font-size: 0.82rem;
    }

    .price {
      font-weight: 700;
      color: #059669;
    }

    .empty-message {
      margin: 0.4rem 0 0;
      color: #64748b;
      font-size: 0.9rem;
    }

    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: repeat(auto-fit, minmax(165px, 1fr));
        gap: 0.75rem;
      }

      .content-grid {
        grid-template-columns: 1fr;
      }

      .content-card {
        min-height: 320px;
      }

      .skeleton-panels {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  stats$!: Observable<DashboardStats | null>;
  private readonly emptyStats: DashboardStats = {
    totalOrders: 0,
    totalMeals: 0,
    totalEmployees: 0,
    todayOrders: 0,
    monthlyRevenue: 0,
    topMeals: [],
    recentOrders: []
  };

  constructor(
    private dashboardService: DashboardService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.stats$ = this.dashboardService.getDashboardStats().pipe(
      map((response) => response.data ?? this.emptyStats),
      catchError(() => {
        this.snackBar.open('Failed to load dashboard data', 'Close', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
        return of(this.emptyStats);
      }),
      startWith(null),
      shareReplay(1)
    );
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
