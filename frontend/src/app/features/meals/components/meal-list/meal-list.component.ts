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
import { MealService } from '../../../../core/services/api/meal-api.service';
import { Meal, MealRequest, SearchParams } from '../../../../core/models/api.models';
import { MatChip } from "@angular/material/chips";
import { withLoading } from '../../../../shared/services/loading.operator';

@Component({
  selector: 'app-meal-list',
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
    <div class="meal-list-container">
      <!-- Search and Filters -->
      <mat-card class="filter-card">
        <mat-card-content>
          <div class="filter-row">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Search</mat-label>
              <input matInput 
                     formControlName="search" 
                     placeholder="Search meals..."
                     (keyup)="applyFilter()">
            </mat-form-field>

            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Type</mat-label>
              <mat-select formControlName="type" (selectionChange)="applyFilter()">
                <mat-option value="">All Types</mat-option>
                <mat-option value="BREAKFAST">Breakfast</mat-option>
                <mat-option value="LUNCH">Lunch</mat-option>
                <mat-option value="DINNER">Dinner</mat-option>
                <mat-option value="SNACK">Snack</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Availability</mat-label>
              <mat-select formControlName="available" (selectionChange)="applyFilter()">
                <mat-option value="">All</mat-option>
                <mat-option [value]="true">Available</mat-option>
                <mat-option [value]="false">Not Available</mat-option>
              </mat-select>
            </mat-form-field>

            <button mat-raised-button 
                    color="primary" 
                    (click)="addMeal()"
                    *ngIf="isAdmin">
              <mat-icon>add</mat-icon>
              Add Meal
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Meals Table -->
      <mat-card class="table-card">
        <mat-card-content>
          <div *ngIf="isLoading" class="loading-container">
            <mat-spinner diameter="40"></mat-spinner>
          </div>
          
          <div class="table-container" *ngIf="!isLoading">
            <table mat-table 
                   [dataSource]="meals" 
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
                          (click)="viewMeal(row.id)">
                    {{ row.name }}
                  </button>
                </td>
              </ng-container>

              <ng-container matColumnDef="type">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Type</th>
                <td mat-cell *matCellDef="let row">
                  <mat-chip [color]="getTypeColor(row.type)">{{ row.type }}</mat-chip>
                </td>
              </ng-container>

              <ng-container matColumnDef="price">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Price</th>
                <td mat-cell *matCellDef="let row">{{ row.price | currency:'USD' }}</td>
              </ng-container>

              <ng-container matColumnDef="dailyCapacity">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Capacity</th>
                <td mat-cell *matCellDef="let row">{{ row.dailyCapacity }}</td>
              </ng-container>

              <ng-container matColumnDef="available">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Available</th>
                <td mat-cell *matCellDef="let row">
                  <mat-checkbox [checked]="row.available" disabled></mat-checkbox>
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let row">
                  <button mat-icon-button 
                          color="primary" 
                          (click)="editMeal(row.id)"
                          *ngIf="isAdmin">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button 
                          color="warn" 
                          (click)="deleteMeal(row.id)"
                          *ngIf="isAdmin">
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
    .meal-list-container {
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
      min-width: 800px;
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
      
      .meal-list-container {
        padding: 1rem;
      }
    }
  `]
})
export class MealListComponent {
  meals: Meal[] = [];
  totalElements = 0;
  pageSize = 10;
  isLoading = false;
  isAdmin = false;

  displayedColumns: string[] = ['id', 'name', 'type', 'price', 'dailyCapacity', 'available', 'actions'];

  constructor(
    private mealService: MealService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadMeals();
    this.checkAdminRole();
  }

  private checkAdminRole(): void {
    // This would come from your auth service
    // For now, we'll assume admin role check
    this.isAdmin = true; // Change this based on actual auth logic
  }

  loadMeals(params?: SearchParams): void {
    this.mealService.getMeals(params).pipe(
      withLoading((loading) => {
        this.isLoading = loading;
      })
    ).subscribe({
      next: (response) => {
        this.meals = response.data ?? [];
        this.totalElements = response.pagination?.totalElements ?? this.meals.length;
      },
      error: () => {
        this.snackBar.open('Failed to load meals', 'Close', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
      }
    });
  }

  applyFilter(): void {
    // Implement filter logic here
    const searchValue = (document.querySelector('input[formcontrolname="search"]') as HTMLInputElement)?.value || '';
    const typeValue = (document.querySelector('mat-select[formcontrolname="type"]') as any)?.value || '';
    const availableValue = (document.querySelector('mat-select[formcontrolname="available"]') as any)?.value || '';

    const params: SearchParams = {
      page: 0,
      size: this.pageSize,
      sort: 'name',
      direction: 'ASC'
    };

    if (searchValue) params.search = searchValue;
    if (typeValue) params.type = typeValue;
    if (availableValue !== '') params.available = availableValue === 'true';

    this.loadMeals(params);
  }

  sortData(event: any): void {
    const params: SearchParams = {
      page: 0,
      size: this.pageSize,
      sort: event.active,
      direction: event.direction
    };
    this.loadMeals(params);
  }

  pageEvent(event: any): void {
    const params: SearchParams = {
      page: event.pageIndex,
      size: event.pageSize,
      sort: 'name',
      direction: 'ASC'
    };
    this.loadMeals(params);
  }

  viewMeal(id: number): void {
    this.router.navigate(['/meals', id]);
  }

  editMeal(id: number): void {
    this.router.navigate(['/meals', id, 'edit']);
  }

  addMeal(): void {
    this.router.navigate(['/meals', 'new']);
  }

  deleteMeal(id: number): void {
    if (confirm('Are you sure you want to delete this meal?')) {
      this.mealService.deleteMeal(id).subscribe({
        next: () => {
          this.snackBar.open('Meal deleted successfully', 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });
          this.loadMeals();
        },
        error: () => {
          this.snackBar.open('Failed to delete meal', 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });
        }
      });
    }
  }

  getTypeColor(type: string): string {
    switch (type) {
      case 'BREAKFAST': return 'primary';
      case 'LUNCH': return 'accent';
      case 'DINNER': return 'warn';
      case 'SNACK': return 'primary';
      default: return '';
    }
  }
}
