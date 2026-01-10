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
              <mat-label>Customer Name</mat-label>
              <input matInput formControlName="customerName" placeholder="Enter customer name">
              <mat-error *ngIf="orderForm.get('customerName')?.hasError('required')">
                Customer name is required
              </mat-error>
            </mat-form-field>

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
              <mat-label>Quantity</mat-label>
              <input matInput type="number" formControlName="quantity" placeholder="Enter quantity" min="1">
              <mat-error *ngIf="orderForm.get('quantity')?.hasError('required')">
                Quantity is required
              </mat-error>
              <mat-error *ngIf="orderForm.get('quantity')?.hasError('min')">
                Quantity must be at least 1
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Special Instructions</mat-label>
              <textarea matInput formControlName="specialInstructions" 
                        placeholder="Any special requests or instructions"
                        rows="3"></textarea>
            </mat-form-field>

            <div class="form-actions">
              <button mat-raised-button type="submit" color="primary" [disabled]="orderForm.invalid">
                <mat-icon>{{ isEdit ? 'save' : 'add' }}</mat-icon>
                {{ isEdit ? 'Update Order' : 'Create Order' }}
              </button>
              <button mat-button type="button" (click)="cancel()">
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
  availableMeals: any[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.orderForm = this.fb.group({
      customerName: ['', Validators.required],
      mealId: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      specialInstructions: ['']
    });
  }

  ngOnInit(): void {
    this.loadAvailableMeals();
  }

  loadAvailableMeals(): void {
    // TODO: Implement meal service call
    this.availableMeals = [
      { id: 1, name: 'Pizza', price: 10.00 },
      { id: 2, name: 'Burger', price: 12.00 },
      { id: 3, name: 'Salad', price: 8.00 }
    ];
  }

  onSubmit(): void {
    if (this.orderForm.valid) {
      const orderData = this.orderForm.value;
      
      // TODO: Implement order service call
      console.log('Order data:', orderData);
      
      this.snackBar.open(
        this.isEdit ? 'Order updated successfully' : 'Order created successfully',
        'Close',
        {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        }
      );
      
      this.router.navigate(['/orders']);
    }
  }

  cancel(): void {
    this.router.navigate(['/orders']);
  }
}
