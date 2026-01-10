import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="order-list-container">
      <mat-card>
        <mat-card-content>
          <h2>Order Management</h2>
          <div class="actions">
            <button mat-raised-button color="primary" (click)="createOrder()">
              <mat-icon>add</mat-icon>
              New Order
            </button>
          </div>
          
          <div *ngIf="isLoading" class="loading-container">
            <mat-spinner diameter="40"></mat-spinner>
          </div>
          
          <div class="table-container" *ngIf="!isLoading">
            <table mat-table [dataSource]="orders" matSort>
              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>ID</th>
                <td mat-cell *matCellDef="let row">{{ row.id }}</td>
              </ng-container>

              <ng-container matColumnDef="customer">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Customer</th>
                <td mat-cell *matCellDef="let row">{{ row.customerName }}</td>
              </ng-container>

              <ng-container matColumnDef="meal">
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
                <td mat-cell *matCellDef="let row">{{ row.status }}</td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let row">
                  <button mat-icon-button color="primary" (click)="viewOrder(row.id)">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="deleteOrder(row.id)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>
            </table>

            <mat-paginator [length]="totalElements" 
                          [pageSize]="pageSize" 
                          [pageSizeOptions]="[10, 25, 50, 100]">
            </mat-paginator>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .order-list-container {
      padding: 2rem;
      max-width: 1400px;
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

    .mat-mdc-button {
      margin-right: 0.5rem;
    }
  `]
})
export class OrderListComponent {
  orders: any[] = [];
  totalElements = 0;
  pageSize = 10;
  isLoading = false;

  displayedColumns: string[] = ['id', 'customer', 'meal', 'quantity', 'totalPrice', 'status', 'actions'];

  constructor(
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    // TODO: Implement order service call
    setTimeout(() => {
      this.orders = [
        { id: 1, customerName: 'John Doe', mealName: 'Pizza', quantity: 2, totalPrice: 20.00, status: 'PENDING' },
        { id: 2, customerName: 'Jane Smith', mealName: 'Burger', quantity: 1, totalPrice: 12.00, status: 'COMPLETED' }
      ];
      this.totalElements = 2;
      this.isLoading = false;
    }, 1000);
  }

  createOrder(): void {
    // TODO: Navigate to order form
    console.log('Create new order');
  }

  viewOrder(id: number): void {
    // TODO: Navigate to order details
    console.log('View order:', id);
  }

  deleteOrder(id: number): void {
    if (confirm('Are you sure you want to delete this order?')) {
      // TODO: Implement delete order
      this.snackBar.open('Order deleted successfully', 'Close', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
      this.loadOrders();
    }
  }
}
