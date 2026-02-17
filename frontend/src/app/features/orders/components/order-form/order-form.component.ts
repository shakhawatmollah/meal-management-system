import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MealService } from '../../../../core/services/api/meal-api.service';
import { OrderService } from '../../../../core/services/api/order-api.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Meal, MealOrderRequest } from '../../../../core/models/api.models';
import { withLoading } from '../../../../shared/services/loading.operator';

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="order-form-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>{{ isEdit ? 'Edit Order' : 'Create New Order' }}</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="orderForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Meal</mat-label>
              <mat-select formControlName="mealId">
                <mat-option value="">Select a meal</mat-option>
                <mat-option *ngFor="let meal of availableMeals" [value]="meal.id">
                  {{ meal.name }} - {{ meal.price | currency:'USD' }}
                </mat-option>
              </mat-select>
              <mat-error *ngIf="orderForm.get('mealId')?.hasError('required')">
                Meal selection is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Order Date</mat-label>
              <input matInput type="date" formControlName="orderDate" [min]="minOrderDate">
              <mat-error *ngIf="orderForm.get('orderDate')?.hasError('required')">
                Order date is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Quantity</mat-label>
              <input matInput type="number" formControlName="quantity" placeholder="Enter quantity" min="1">
              <mat-error *ngIf="orderForm.get('quantity')?.hasError('required')">
                Quantity is required
              </mat-error>
              <mat-error *ngIf="orderForm.get('quantity')?.hasError('min')">
                Quantity must be at least 1
              </mat-error>
            </mat-form-field>

            <div class="form-actions">
              <button mat-raised-button type="submit" color="primary" [disabled]="orderForm.invalid || isLoading">
                <mat-icon>{{ isEdit ? 'save' : 'add' }}</mat-icon>
                {{ isEdit ? 'Update Order' : 'Create Order' }}
              </button>
              <button mat-button type="button" (click)="cancel()" [disabled]="isLoading">
                Cancel
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .order-form-container {
      padding: 2rem;
      max-width: 600px;
      margin: 0 auto;
    }

    .full-width {
      width: 100%;
      margin-bottom: 1rem;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
    }

    .mat-mdc-button {
      margin-right: 0.5rem;
    }
  `]
})
export class OrderFormComponent {
  orderForm: FormGroup;
  isEdit = false;
  isLoading = false;
  availableMeals: Meal[] = [];
  minOrderDate: string;

  constructor(
    private fb: FormBuilder,
    private mealService: MealService,
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.minOrderDate = tomorrow.toISOString().split('T')[0];

    this.orderForm = this.fb.group({
      mealId: ['', Validators.required],
      orderDate: [this.minOrderDate, Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.loadAvailableMeals();
  }

  loadAvailableMeals(): void {
    this.mealService.getAvailableMeals().pipe(
      withLoading((loading) => {
        this.isLoading = loading;
      })
    ).subscribe({
      next: (response) => {
        this.availableMeals = response.data ?? [];
      },
      error: () => {
        this.snackBar.open('Failed to load available meals', 'Close', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
      }
    });
  }

  onSubmit(): void {
    if (!this.orderForm.valid) {
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.id) {
      this.snackBar.open('Please sign in again to place an order', 'Close', {
        duration: 4000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
      return;
    }

    const formValue = this.orderForm.value;
    const orderData: MealOrderRequest = {
      employeeId: currentUser.id,
      mealId: Number(formValue.mealId),
      orderDate: formValue.orderDate,
      quantity: Number(formValue.quantity)
    };

    this.orderService.createOrder(orderData).pipe(
      withLoading((loading) => {
        this.isLoading = loading;
      })
    ).subscribe({
      next: () => {
        this.snackBar.open('Order created successfully', 'Close', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });

        this.router.navigate(['/my-orders']);
      },
      error: () => {
        this.snackBar.open('Failed to create order', 'Close', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/my-orders']);
  }
}
