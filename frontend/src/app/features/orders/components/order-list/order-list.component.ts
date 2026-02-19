import { Component, NgZone, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { OrderService } from '../../../../core/services/api/order-api.service';
import { MealOrder, SearchParams } from '../../../../core/models/api.models';
import { finalize, retry } from 'rxjs';

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
          
          <div class="table-container">
            <table mat-table [dataSource]="orders" matSort>
              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>ID</th>
                <td mat-cell *matCellDef="let row">{{ row.id }}</td>
              </ng-container>

              <ng-container matColumnDef="customer">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Customer</th>
                <td mat-cell *matCellDef="let row">{{ row.employeeName }}</td>
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

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>

            <mat-paginator [length]="totalElements" 
                          [pageSize]="pageSize" 
                          [pageSizeOptions]="[10, 25, 50, 100]"
                          (page)="pageEvent($event)">
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
export class OrderListComponent implements OnInit {
  orders: MealOrder[] = [];
  totalElements = 0;
  pageSize = 10;
  isLoading = false;

  displayedColumns: string[] = ['id', 'customer', 'meal', 'quantity', 'totalPrice', 'status', 'actions'];

  constructor(
    private orderService: OrderService,
    private router: Router,
    private snackBar: MatSnackBar,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    setTimeout(() => this.loadOrders(this.getDefaultSearchParams()), 0);
  }

  loadOrders(params?: SearchParams): void {
    const effectiveParams = params ?? this.getDefaultSearchParams();
    this.setLoading(true);
    this.orderService.getOrders(effectiveParams).pipe(
      retry({ count: 1 }),
      finalize(() => {
        this.setLoading(false);
      })
    ).subscribe({
      next: (response) => {
        this.ngZone.run(() => {
          const pageData = this.unwrapPageData<MealOrder>(response.data);
          this.orders = pageData.items;
          this.totalElements = response.pagination?.totalElements ?? pageData.totalElements;
        });
      },
      error: () => {
        this.ngZone.run(() => {
          this.snackBar.open('Failed to load orders', 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });
        });
      }
    });
  }

  private setLoading(value: boolean): void {
    setTimeout(() => {
      this.ngZone.run(() => {
        this.isLoading = value;
      });
    }, 0);
  }

  createOrder(): void {
    this.router.navigate(['/orders/new']);
  }

  viewOrder(id: number): void {
    this.snackBar.open(`Order #${id} selected`, 'Close', { duration: 2000 });
  }

  deleteOrder(id: number): void {
    if (confirm('Are you sure you want to cancel this order?')) {
      this.orderService.cancelOrder(id).subscribe({
        next: () => {
          this.snackBar.open('Order cancelled successfully', 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });
          this.loadOrders();
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

  pageEvent(event: any): void {
    const params: SearchParams = {
      page: event.pageIndex,
      size: event.pageSize,
      sort: 'createdAt',
      direction: 'DESC'
    };
    this.loadOrders(params);
  }

  private unwrapPageData<T>(data: unknown): { items: T[]; totalElements: number } {
    if (Array.isArray(data)) {
      return { items: data, totalElements: data.length };
    }

    if (data && typeof data === 'object' && Array.isArray((data as { content?: T[] }).content)) {
      const page = data as { content: T[]; totalElements?: number };
      return {
        items: page.content,
        totalElements: page.totalElements ?? page.content.length
      };
    }

    return { items: [], totalElements: 0 };
  }

  private getDefaultSearchParams(): SearchParams {
    return {
      page: 0,
      size: this.pageSize,
      sort: 'createdAt',
      direction: 'DESC'
    };
  }
}
