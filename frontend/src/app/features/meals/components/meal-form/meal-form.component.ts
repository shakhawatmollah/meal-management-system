import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MealService } from '../../../../core/services/api/meal-api.service';
import { MealRequest } from '../../../../core/models/api.models';
import { withLoading } from '../../../../shared/services/loading.operator';

@Component({
  selector: 'app-meal-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatCheckboxModule
  ],
  template: `
    <div class="meal-form-container">
      <mat-card class="form-card">
        <mat-card-header>
          <mat-card-title>{{ isEditMode ? 'Edit Meal' : 'Add New Meal' }}</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="mealForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Meal Name</mat-label>
              <input matInput 
                     formControlName="name" 
                     placeholder="Enter meal name"
                     required>
              <mat-error *ngIf="mealForm.get('name')?.hasError('required')">
                Meal name is required
              </mat-error>
              <mat-error *ngIf="mealForm.get('name')?.hasError('minlength')">
                Meal name must be at least 2 characters
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Description</mat-label>
              <textarea matInput 
                        formControlName="description" 
                        placeholder="Enter meal description"
                        rows="4"
                        required>
              </textarea>
              <mat-error *ngIf="mealForm.get('description')?.hasError('required')">
                Description is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Type</mat-label>
              <mat-select formControlName="type" required>
                <mat-option value="BREAKFAST">Breakfast</mat-option>
                <mat-option value="LUNCH">Lunch</mat-option>
                <mat-option value="DINNER">Dinner</mat-option>
                <mat-option value="SNACK">Snack</mat-option>
              </mat-select>
              <mat-error *ngIf="mealForm.get('type')?.hasError('required')">
                Type is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Price ($)</mat-label>
              <input matInput 
                     formControlName="price" 
                     type="number" 
                     step="0.01"
                     placeholder="Enter price"
                     required>
              <mat-error *ngIf="mealForm.get('price')?.hasError('required')">
                Price is required
              </mat-error>
              <mat-error *ngIf="mealForm.get('price')?.hasError('min')">
                Price must be greater than 0
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Daily Capacity</mat-label>
              <input matInput 
                     formControlName="dailyCapacity" 
                     type="number" 
                     placeholder="Enter daily capacity"
                     required>
              <mat-error *ngIf="mealForm.get('dailyCapacity')?.hasError('required')">
                Daily capacity is required
              </mat-error>
              <mat-error *ngIf="mealForm.get('dailyCapacity')?.hasError('min')">
                Daily capacity must be greater than 0
              </mat-error>
            </mat-form-field>

            <div class="full-width availability-field">
              <mat-checkbox formControlName="available">
                Available for ordering
              </mat-checkbox>
            </div>

            <div class="button-container">
              <button mat-raised-button 
                      color="primary" 
                      type="submit" 
                      [disabled]="mealForm.invalid || isLoading"
                      class="full-width">
                <span *ngIf="!isLoading">{{ isEditMode ? 'Update' : 'Create' }} Meal</span>
                <mat-spinner *ngIf="isLoading" diameter="20"></mat-spinner>
              </button>
              <button mat-button 
                      type="button" 
                      (click)="cancel()"
                      class="cancel-button">
                Cancel
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .meal-form-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem;
    }

    .form-card {
      width: 100%;
      max-width: 600px;
      padding: 2rem;
    }

    .full-width {
      width: 100%;
      margin-bottom: 1rem;
    }

    .availability-field {
      display: flex;
      align-items: center;
      min-height: 56px;
    }

    .button-container {
      display: flex;
      gap: 1rem;
      margin-top: 1.5rem;
    }

    .full-width {
      flex: 1;
    }

    .cancel-button {
      background-color: #f44336;
      color: white;
    }

    mat-spinner {
      margin-right: 8px;
    }

    @media (max-width: 480px) {
      .meal-form-container {
        padding: 1rem;
      }
      
      .form-card {
        padding: 1.5rem;
      }
      
      .button-container {
        flex-direction: column;
      }
    }
  `]
})
export class MealFormComponent implements OnInit {
  mealForm: FormGroup;
  isLoading = false;
  isEditMode = false;
  mealId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private mealService: MealService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.mealForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.maxLength(500)]],
      type: ['BREAKFAST', Validators.required],
      price: [0, [Validators.required, Validators.min(0.01)]],
      dailyCapacity: [1, [Validators.required, Validators.min(1)]],
      available: [true]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.mealId = +id;
      this.loadMeal(+id);
    }
  }

  loadMeal(id: number): void {
    this.mealService.getMeal(id).pipe(
      withLoading((loading) => {
        this.isLoading = loading;
      })
    ).subscribe({
      next: (response) => {
        const meal = response.data;
        this.mealForm.patchValue({
          name: meal.name,
          description: meal.description,
          type: meal.type,
          price: meal.price,
          dailyCapacity: meal.dailyCapacity,
          available: meal.available
        });
      },
      error: () => {
        this.snackBar.open('Failed to load meal', 'Close', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
      }
    });
  }

  onSubmit(): void {
    if (this.mealForm.valid) {
      const mealRequest: MealRequest = this.mealForm.value;
      
      const operation = this.isEditMode 
        ? this.mealService.updateMeal(this.mealId!, mealRequest)
        : this.mealService.createMeal(mealRequest);
      
      operation.pipe(
        withLoading((loading) => {
          this.isLoading = loading;
        })
      ).subscribe({
        next: () => {
          this.snackBar.open(
            `Meal ${this.isEditMode ? 'updated' : 'created'} successfully!`, 
            'Close', 
            {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'top'
            }
          );
          this.router.navigate(['/meals']);
        },
        error: () => {
          this.snackBar.open(
            `Failed to ${this.isEditMode ? 'update' : 'create'} meal`, 
            'Close', 
            {
              duration: 5000,
              horizontalPosition: 'end',
              verticalPosition: 'top'
            }
          );
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/meals']);
  }
}
