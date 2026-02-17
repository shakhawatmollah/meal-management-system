import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { EmployeeService } from '../../../../core/services/api/employee-api.service';
import { Employee, EmployeeRequest, SearchParams } from '../../../../core/models/api.models';
import { MatChip } from "@angular/material/chips";
import { withLoading } from '../../../../shared/services/loading.operator';

@Component({
  selector: 'app-employee-list',
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
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatChip
  ],
  template: `
    <div class="employee-list-container">
      <!-- Search and Filters -->
      <mat-card class="filter-card">
        <mat-card-content>
          <div class="filter-row">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Search</mat-label>
              <input matInput 
                     formControlName="search" 
                     placeholder="Search employees..."
                     (keyup)="applyFilter()">
            </mat-form-field>

            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Department</mat-label>
              <mat-select formControlName="department" (selectionChange)="applyFilter()">
                <mat-option value="">All Departments</mat-option>
                <mat-option value="IT">IT</mat-option>
                <mat-option value="HR">HR</mat-option>
                <mat-option value="Finance">Finance</mat-option>
                <mat-option value="Marketing">Marketing</mat-option>
                <mat-option value="Operations">Operations</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Status</mat-label>
              <mat-select formControlName="status" (selectionChange)="applyFilter()">
                <mat-option value="">All Status</mat-option>
                <mat-option value="ACTIVE">Active</mat-option>
                <mat-option value="INACTIVE">Inactive</mat-option>
              </mat-select>
            </mat-form-field>

            <button mat-raised-button 
                    color="primary" 
                    (click)="addEmployee()">
              <mat-icon>add</mat-icon>
              Add Employee
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Employees Table -->
      <mat-card class="table-card">
        <mat-card-content>
          <div *ngIf="isLoading" class="loading-container">
            <mat-spinner diameter="40"></mat-spinner>
          </div>
          
          <div class="table-container" *ngIf="!isLoading">
            <table mat-table 
                   [dataSource]="employees" 
                   matSort 
                   matSortActive="sort"
                   matSortDirectionChange="sortData($event)">
              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef>ID</th>
                <td mat-cell *matCellDef="let row">{{ row.id }}</td>
              </ng-container>

              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
                <td mat-cell *matCellDef="let row">
                  <button mat-button 
                          color="primary" 
                          (click)="viewEmployee(row.id)">
                    {{ row.name }}
                  </button>
                </td>
              </ng-container>

              <ng-container matColumnDef="email">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Email</th>
                <td mat-cell *matCellDef="let row">{{ row.email }}</td>
              </ng-container>

              <ng-container matColumnDef="department">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Department</th>
                <td mat-cell *matCellDef="let row">
                  <mat-chip [color]="getDepartmentColor(row.department)">{{ row.department }}</mat-chip>
                </td>
              </ng-container>

              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
                <td mat-cell *matCellDef="let row">
                  <mat-chip [color]="row.status === 'ACTIVE' ? 'primary' : 'warn'">
                    {{ row.status }}
                  </mat-chip>
                </td>
              </ng-container>

              <ng-container matColumnDef="monthlyBudget">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Monthly Budget</th>
                <td mat-cell *matCellDef="let row">{{ row.monthlyBudget | currency:'USD' }}</td>
              </ng-container>

              <ng-container matColumnDef="currentMonthSpent">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Spent</th>
                <td mat-cell *matCellDef="let row">{{ row.currentMonthSpent | currency:'USD' }}</td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let row">
                  <button mat-icon-button 
                          color="primary" 
                          (click)="editEmployee(row.id)">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button 
                          color="warn" 
                          (click)="deleteEmployee(row.id)">
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
    .employee-list-container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .filter-card {
      margin-bottom: 2rem;
    }

    .filter-row {
      display: flex;
      gap: 1rem;
      align-items: center;
      flex-wrap: wrap;
    }

    .search-field {
      flex: 1;
      min-width: 250px;
    }

    .filter-field {
      min-width: 150px;
    }

    .table-card {
      margin-bottom: 2rem;
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
      min-width: 1000px;
    }

    .mat-mdc-button {
      margin-right: 0.5rem;
    }

    @media (max-width: 768px) {
      .filter-row {
        flex-direction: column;
        align-items: stretch;
      }
      
      .search-field,
      .filter-field {
        min-width: auto;
        margin-bottom: 1rem;
      }
      
      .employee-list-container {
        padding: 1rem;
      }
    }
  `]
})
export class EmployeeListComponent {
  employees: Employee[] = [];
  totalElements = 0;
  pageSize = 10;
  isLoading = false;

  displayedColumns: string[] = ['id', 'name', 'email', 'department', 'status', 'monthlyBudget', 'currentMonthSpent', 'actions'];

  constructor(
    private employeeService: EmployeeService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(params?: SearchParams): void {
    this.employeeService.getEmployees(params).pipe(
      withLoading((loading) => {
        this.isLoading = loading;
      })
    ).subscribe({
      next: (response) => {
        this.employees = response.data ?? [];
        this.totalElements = response.pagination?.totalElements ?? this.employees.length;
      },
      error: () => {
        this.snackBar.open('Failed to load employees', 'Close', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
      }
    });
  }

  applyFilter(): void {
    const searchValue = (document.querySelector('input[formcontrolname="search"]') as HTMLInputElement)?.value || '';
    const departmentValue = (document.querySelector('mat-select[formcontrolname="department"]') as any)?.value || '';
    const statusValue = (document.querySelector('mat-select[formcontrolname="status"]') as any)?.value || '';

    const params: SearchParams = {
      page: 0,
      size: this.pageSize,
      sort: 'name',
      direction: 'ASC'
    };

    if (searchValue) params.search = searchValue;
    if (departmentValue) params.department = departmentValue;
    if (statusValue) params.status = statusValue;

    this.loadEmployees(params);
  }

  sortData(event: any): void {
    const params: SearchParams = {
      page: 0,
      size: this.pageSize,
      sort: event.active,
      direction: event.direction
    };
    this.loadEmployees(params);
  }

  pageEvent(event: any): void {
    const params: SearchParams = {
      page: event.pageIndex,
      size: event.pageSize,
      sort: 'name',
      direction: 'ASC'
    };
    this.loadEmployees(params);
  }

  viewEmployee(id: number): void {
    this.router.navigate(['/employees', id]);
  }

  editEmployee(id: number): void {
    this.router.navigate(['/employees', id, 'edit']);
  }

  addEmployee(): void {
    this.router.navigate(['/employees', 'new']);
  }

  deleteEmployee(id: number): void {
    if (confirm('Are you sure you want to delete this employee?')) {
      this.employeeService.deleteEmployee(id).subscribe({
        next: () => {
          this.snackBar.open('Employee deleted successfully', 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });
          this.loadEmployees();
        },
        error: () => {
          this.snackBar.open('Failed to delete employee', 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });
        }
      });
    }
  }

  getDepartmentColor(department: string): string {
    switch (department) {
      case 'IT': return 'primary';
      case 'HR': return 'accent';
      case 'Finance': return 'warn';
      case 'Marketing': return 'primary';
      case 'Operations': return 'accent';
      default: return '';
    }
  }
}
