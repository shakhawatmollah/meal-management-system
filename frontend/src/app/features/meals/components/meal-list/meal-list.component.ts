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
import { MealService } from '../../../../core/services/api/meal-api.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Meal, SearchParams } from '../../../../core/models/api.models';
import { MatChip } from "@angular/material/chips";
import { finalize, retry } from 'rxjs';

@Component({
  selector: 'app-meal-list',
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
    <div class="meal-list-container page-enter">
      <div class="page-header">
        <h1>Meals</h1>
        <p>Browse and manage meal offerings, capacity, and availability.</p>
      </div>

      <!-- Search and Filters -->
      <mat-card class="filter-card">
        <mat-card-content>
          <div class="filter-row">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Search</mat-label>
              <input matInput 
                     [(ngModel)]="filters.search"
                     name="search"
                     placeholder="Search meals..."
                     (keyup)="applyFilter()">
            </mat-form-field>

            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Type</mat-label>
              <mat-select [(ngModel)]="filters.type" name="type" (selectionChange)="applyFilter()">
                <mat-option value="">All Types</mat-option>
                <mat-option value="BREAKFAST">Breakfast</mat-option>
                <mat-option value="LUNCH">Lunch</mat-option>
                <mat-option value="DINNER">Dinner</mat-option>
                <mat-option value="SNACK">Snack</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Availability</mat-label>
              <mat-select [(ngModel)]="filters.available" name="available" (selectionChange)="applyFilter()">
                <mat-option value="">All</mat-option>
                <mat-option value="true">Available</mat-option>
                <mat-option value="false">Not Available</mat-option>
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
          <div *ngIf="isLoading" class="table-skeleton">
            <div class="skeleton skeleton-line lg"></div>
            <div class="skeleton-row" *ngFor="let _ of [1,2,3,4,5,6]">
              <div class="skeleton skeleton-line"></div>
            </div>
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
      padding: 0.5rem;
      max-width: 1280px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 0.9rem;
    }

    .page-header h1 {
      margin: 0;
      font-size: 1.45rem;
      font-weight: 700;
    }

    .page-header p {
      margin: 0.3rem 0 0;
      color: #64748b;
      font-size: 0.92rem;
    }

    .filter-card {
      margin-bottom: 0.9rem;
    }

    .filter-row {
      display: flex;
      gap: 0.75rem;
      align-items: center;
      flex-wrap: wrap;
    }

    .search-field {
      flex: 1;
      min-width: 250px;
    }

    .filter-field {
      min-width: 170px;
    }

    .table-card {
      margin-bottom: 1rem;
    }

    .table-skeleton {
      display: grid;
      gap: 0.55rem;
      padding: 0.25rem 0 0.5rem;
    }

    .skeleton-row {
      display: grid;
      gap: 0.35rem;
    }

    .table-container {
      overflow-x: auto;
    }

    table {
      width: 100%;
      min-width: 820px;
    }

    th.mat-mdc-header-cell {
      color: #334155;
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    td.mat-mdc-cell {
      color: #1f2937;
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
        margin-bottom: 0.3rem;
      }

      .meal-list-container {
        padding: 0.25rem;
      }
    }
  `]
})
export class MealListComponent implements OnInit {
  meals: Meal[] = [];
  totalElements = 0;
  pageSize = 10;
  isLoading = true;
  isAdmin = false;
  filters = {
    search: '',
    type: '',
    available: ''
  };

  displayedColumns: string[] = ['id', 'name', 'type', 'price', 'dailyCapacity', 'available', 'actions'];

  constructor(
    private mealService: MealService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private ngZone: NgZone
  ) {
    this.isAdmin = this.authService.isAdmin();
  }

  ngOnInit(): void {
    this.loadMeals(this.getDefaultSearchParams());
  }

  loadMeals(params?: SearchParams): void {
    const effectiveParams = params ?? this.getDefaultSearchParams();
    this.isLoading = true;
    this.mealService.getMeals(effectiveParams).pipe(
      retry({ count: 1 }),
      finalize(() => {
        this.ngZone.run(() => {
          this.isLoading = false;
        });
      })
    ).subscribe({
      next: (response) => {
        this.ngZone.run(() => {
          const pageData = this.unwrapPageData<Meal>(response.data);
          this.meals = pageData.items;
          this.totalElements = response.pagination?.totalElements ?? pageData.totalElements;
        });
      },
      error: () => {
        this.ngZone.run(() => {
          this.snackBar.open('Failed to load meals', 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });
        });
      },
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
    if (this.filters.type) params.type = this.filters.type;
    if (this.filters.available !== '') params.available = this.filters.available === 'true';

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
