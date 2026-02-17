import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChip } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { OrderService } from '../../../../core/services/api/order-api.service';
import { AuthService } from '../../../../core/services/auth.service';
import { MealOrder } from '../../../../core/models/api.models';
import { withLoading } from '../../../../shared/services/loading.operator';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatChip
  ],
  template: `
    <div class="my-orders-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>My Orders</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="actions">
            <button mat-raised-button color="primary" (click)="createNewOrder()">
              <mat-icon>add</mat-icon>
              Create New Order
            </button>
          </div>
          
          <div *ngIf="isLoading" class="loading-container">
            <mat-spinner diameter="40"></mat-spinner>
          </div>
          
          <div class="table-container" *ngIf="!isLoading && orders.length > 0">
            <table mat-table [dataSource]="orders" matSort>
              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Order ID</th>
                <td mat-cell *matCellDef="let row">#{{ row.id }}</td>
              </ng-container>

              <ng-container matColumnDef="mealName">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Meal</th>
                <td mat-cell *matCellDef="let row">{{ row.mealName }}</td>
              </ng-container>

              <ng-container matColumnDef="quantity">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Quantity</th>
                <td mat-cell *matCellDef="let row">{{ row.quantity }}</td>
              </ng-container>

              <ng-container matColumnDef="totalPrice">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Total Price</th>
                <td mat-cell *matCellDef="let row">{{ row.totalPrice | currency:'USD' }}</td>
              </ng-container>

              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
                <td mat-cell *matCellDef="let row">
                  <mat-chip [color]="getStatusColor(row.status)">{{ row.status }}</mat-chip>
                </td>
              </ng-container>

              <ng-container matColumnDef="orderDate">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Order Date</th>
                <td mat-cell *matCellDef="let row">{{ row.orderDate | date:'medium' }}</td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let row">
                  <button mat-icon-button color="primary" (click)="viewOrderDetails(row.id)">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button mat-icon-button 
                          color="warn" 
                          (click)="cancelOrder(row.id)"
                          *ngIf="row.status === 'PENDING'">
                    <mat-icon>cancel</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>

            <mat-paginator [length]="totalElements" 
                          [pageSize]="pageSize" 
                          [pageSizeOptions]="[10, 25, 50, 100]">
            </mat-paginator>
          </div>

          <div class="empty-state" *ngIf="!isLoading && orders.length === 0">
            <mat-icon class="empty-icon">restaurant_menu</mat-icon>
            <h3>No orders yet</h3>
            <p>You haven't placed any orders yet. Start by creating your first order!</p>
            <button mat-raised-button color="primary" (click)="createNewOrder()">
              <mat-icon>add</mat-icon>
              Create Your First Order
            </button>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .my-orders-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .actions {
      margin-bottom: 1rem;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 200px;
    }

    .table-container {
      overflow-x: auto;
    }

    table {
      width: 100%;
      min-width: 800px;
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
    }

    .empty-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    .mat-mdc-button {
      margin-right: 0.5rem;
    }

    @media (max-width: 768px) {
      .my-orders-container {
        padding: 1rem;
      }
      
      .table-container {
        min-width: auto;
      }
    }
  `]
})
export class MyOrdersComponent {
  orders: MealOrder[] = [];
  totalElements = 0;
  pageSize = 10;
  isLoading = false;

  displayedColumns: string[] = ['id', 'mealName', 'quantity', 'totalPrice', 'status', 'orderDate', 'actions'];

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadMyOrders();
  }

  loadMyOrders(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.id) {
      this.snackBar.open('Please sign in again to load your orders', 'Close', {
        duration: 4000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
      this.isLoading = false;
      return;
    }

    this.orderService.getMyOrders(currentUser.id).pipe(
      withLoading((loading) => {
        this.isLoading = loading;
      })
    ).subscribe({
      next: (response) => {
        this.orders = response.data ?? [];
        this.totalElements = this.orders.length;
      },
      error: () => {
        this.snackBar.open('Failed to load your orders', 'Close', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
      }
    });
  }

  createNewOrder(): void {
    this.router.navigate(['/orders/new']);
  }

  viewOrderDetails(id: number): void {
    this.snackBar.open(`Order #${id} selected`, 'Close', { duration: 2000 });
  }

  cancelOrder(id: number): void {
    if (confirm('Are you sure you want to cancel this order?')) {
      this.orderService.cancelOrder(id).subscribe({
        next: () => {
          this.snackBar.open('Order cancelled successfully', 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });
          this.loadMyOrders();
        },
        error: () => {
          this.snackBar.open('Failed to cancel order', 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });
        }
      });
    }
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
}
