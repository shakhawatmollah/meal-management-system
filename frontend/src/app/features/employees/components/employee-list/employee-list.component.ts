import { Component, NgZone, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
import { Employee, SearchParams } from '../../../../core/models/api.models';
import { MatChip } from "@angular/material/chips";
import { finalize, retry } from 'rxjs';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
                     [(ngModel)]="filters.search"
                     name="search"
                     placeholder="Search employees..."
                     (keyup)="applyFilter()">
            </mat-form-field>

            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Department</mat-label>
              <mat-select [(ngModel)]="filters.department" name="department" (selectionChange)="applyFilter()">
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
              <mat-select [(ngModel)]="filters.status" name="status" (selectionChange)="applyFilter()">
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
          
          <div class="table-container">
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
export class EmployeeListComponent implements OnInit {
  employees: Employee[] = [];
  totalElements = 0;
  pageSize = 10;
  isLoading = true;
  filters = {
    search: '',
    department: '',
    status: ''
  };

  displayedColumns: string[] = ['id', 'name', 'email', 'department', 'status', 'monthlyBudget', 'currentMonthSpent', 'actions'];

  constructor(
    private employeeService: EmployeeService,
    private router: Router,
    private snackBar: MatSnackBar,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.loadEmployees(this.getDefaultSearchParams());
  }

  loadEmployees(params?: SearchParams): void {
    const effectiveParams = params ?? this.getDefaultSearchParams();
    this.isLoading = true;
    this.employeeService.getEmployees(effectiveParams).pipe(
      retry({ count: 1 }),
      finalize(() => {
        this.ngZone.run(() => {
          this.isLoading = false;
        });
      })
    ).subscribe({
      next: (response) => {
        this.ngZone.run(() => {
          const pageData = this.unwrapPageData<Employee>(response.data);
          this.employees = pageData.items;
          this.totalElements = response.pagination?.totalElements ?? pageData.totalElements;
        });
      },
      error: () => {
        this.ngZone.run(() => {
          this.snackBar.open('Failed to load employees', 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });
        });
      }
    });
  }

  applyFilter(): void {
    const params: SearchParams = {
      page: 0,
      size: this.pageSize,
      sort: 'name',
      direction: 'ASC'
    };

    if (this.filters.search) params.search = this.filters.search;
    if (this.filters.department) params.department = this.filters.department;
    if (this.filters.status) params.status = this.filters.status;

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
      sort: 'name',
      direction: 'ASC'
    };
  }
}
