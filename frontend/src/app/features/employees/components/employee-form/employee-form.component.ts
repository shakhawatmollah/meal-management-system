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
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmployeeService } from '../../../../core/services/api/employee-api.service';
import { EmployeeRequest } from '../../../../core/models/api.models';
import { withLoading } from '../../../../shared/services/loading.operator';

@Component({
  selector: 'app-employee-form',
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
    MatSelectModule
  ],
  template: `
    <div class="employee-form-container">
      <mat-card class="form-card">
        <mat-card-header>
          <mat-card-title>{{ isEditMode ? 'Edit Employee' : 'Add New Employee' }}</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="employeeForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Name</mat-label>
              <input matInput 
                     formControlName="name" 
                     placeholder="Enter employee name"
                     required>
              <mat-error *ngIf="employeeForm.get('name')?.hasError('required')">
                Name is required
              </mat-error>
              <mat-error *ngIf="employeeForm.get('name')?.hasError('minlength')">
                Name must be at least 2 characters
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput 
                     formControlName="email" 
                     type="email"
                     placeholder="Enter email address"
                     required>
              <mat-error *ngIf="employeeForm.get('email')?.hasError('required')">
                Email is required
              </mat-error>
              <mat-error *ngIf="employeeForm.get('email')?.hasError('email')">
                Please enter a valid email
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width" *ngIf="!isEditMode">
              <mat-label>Password</mat-label>
              <input matInput 
                     formControlName="password" 
                     type="password"
                     placeholder="Enter password"
                     required>
              <mat-error *ngIf="employeeForm.get('password')?.hasError('required')">
                Password is required
              </mat-error>
              <mat-error *ngIf="employeeForm.get('password')?.hasError('minlength')">
                Password must be at least 6 characters
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Department</mat-label>
              <mat-select formControlName="department" required>
                <mat-option value="IT">IT</mat-option>
                <mat-option value="HR">HR</mat-option>
                <mat-option value="Finance">Finance</mat-option>
                <mat-option value="Marketing">Marketing</mat-option>
                <mat-option value="Operations">Operations</mat-option>
              </mat-select>
              <mat-error *ngIf="employeeForm.get('department')?.hasError('required')">
                Department is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Monthly Budget ($)</mat-label>
              <input matInput 
                     formControlName="monthlyBudget" 
                     type="number" 
                     step="0.01"
                     placeholder="Enter monthly budget"
                     required>
              <mat-error *ngIf="employeeForm.get('monthlyBudget')?.hasError('required')">
                Monthly budget is required
              </mat-error>
              <mat-error *ngIf="employeeForm.get('monthlyBudget')?.hasError('min')">
                Budget must be greater than 0
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Monthly Order Limit</mat-label>
              <input matInput 
                     formControlName="monthlyOrderLimit" 
                     type="number"
                     placeholder="Enter monthly order limit"
                     required>
              <mat-error *ngIf="employeeForm.get('monthlyOrderLimit')?.hasError('required')">
                Monthly order limit is required
              </mat-error>
              <mat-error *ngIf="employeeForm.get('monthlyOrderLimit')?.hasError('min')">
                Order limit must be greater than 0
              </mat-error>
            </mat-form-field>

            <div class="form-actions">
              <button mat-raised-button 
                      type="submit" 
                      color="primary" 
                      [disabled]="employeeForm.invalid || isLoading">
                <mat-icon *ngIf="!isLoading">{{ isEditMode ? 'save' : 'add' }}</mat-icon>
                {{ isEditMode ? 'Update Employee' : 'Create Employee' }}
              </button>
              
              <button mat-raised-button 
                      type="button" 
                      color="warn" 
                      (click)="cancel()"
                      [disabled]="isLoading">
                <mat-icon>cancel</mat-icon>
                Cancel
              </button>
            </div>

            <div *ngIf="isLoading" class="loading-container">
              <mat-spinner diameter="40"></mat-spinner>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .employee-form-container {
      padding: 2rem;
      max-width: 600px;
      margin: 0 auto;
    }

    .form-card {
      margin-bottom: 2rem;
    }

    .full-width {
      width: 100%;
      margin-bottom: 1rem;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
      justify-content: flex-end;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100px;
      margin-top: 1rem;
    }

    @media (max-width: 768px) {
      .employee-form-container {
        padding: 1rem;
      }
      
      .form-actions {
        flex-direction: column;
        gap: 0.5rem;
      }
      
      .form-actions button {
        width: 100%;
      }
    }
  `]
})
export class EmployeeFormComponent implements OnInit {
  employeeForm: FormGroup;
  isEditMode = false;
  isLoading = false;
  employeeId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.employeeForm = this.createEmployeeForm();
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode = true;
      this.employeeId = Number(id);
      this.loadEmployee(this.employeeId);
    }
  }

  private createEmployeeForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      department: ['', Validators.required],
      monthlyBudget: [0, [Validators.required, Validators.min(0)]],
      monthlyOrderLimit: [0, [Validators.required, Validators.min(1)]]
    });
  }

  private loadEmployee(id: number): void {
    this.employeeService.getEmployee(id).pipe(
      withLoading((loading) => {
        this.isLoading = loading;
      })
    ).subscribe({
      next: (response) => {
        const employee = response.data;
        this.employeeForm.patchValue({
          name: employee.name,
          email: employee.email,
          department: employee.department,
          monthlyBudget: employee.monthlyBudget,
          monthlyOrderLimit: employee.monthlyOrderLimit
        });
        
        // Remove password field in edit mode
        this.employeeForm.removeControl('password');
      },
      error: () => {
        this.snackBar.open('Failed to load employee', 'Close', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
        this.router.navigate(['/employees']);
      }
    });
  }

  onSubmit(): void {
    if (this.employeeForm.invalid) {
      return;
    }

    const employeeData: EmployeeRequest = this.employeeForm.value;

    if (this.isEditMode && this.employeeId) {
      this.updateEmployee(this.employeeId, employeeData);
    } else {
      this.createEmployee(employeeData);
    }
  }

  private createEmployee(employeeData: EmployeeRequest): void {
    this.employeeService.createEmployee(employeeData).pipe(
      withLoading((loading) => {
        this.isLoading = loading;
      })
    ).subscribe({
      next: () => {
        this.snackBar.open('Employee created successfully', 'Close', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
        this.router.navigate(['/employees']);
      },
      error: () => {
        this.snackBar.open('Failed to create employee', 'Close', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
      }
    });
  }

  private updateEmployee(id: number, employeeData: EmployeeRequest): void {
    this.employeeService.updateEmployee(id, employeeData).pipe(
      withLoading((loading) => {
        this.isLoading = loading;
      })
    ).subscribe({
      next: () => {
        this.snackBar.open('Employee updated successfully', 'Close', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
        this.router.navigate(['/employees']);
      },
      error: () => {
        this.snackBar.open('Failed to update employee', 'Close', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/employees']);
  }
}
