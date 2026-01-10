import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChip } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { MealService } from '../../../../core/services/api/meal-api.service';
import { Meal } from '../../../../core/models/api.models';

@Component({
  selector: 'app-meal-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChip
  ],
  template: `
    <div class="meal-detail-container">
      <div *ngIf="isLoading" class="loading-container">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <div *ngIf="!isLoading && meal" class="meal-content">
        <mat-card class="detail-card">
          <mat-card-header>
            <mat-card-title>{{ meal.name }}</mat-card-title>
            <mat-card-subtitle>{{ meal.type }}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="meal-info">
              <div class="info-section">
                <h3>Description</h3>
                <p>{{ meal.description }}</p>
              </div>

              <div class="info-grid">
                <div class="info-item">
                  <span class="label">Price:</span>
                  <span class="value">{{ meal.price | currency:'USD' }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Daily Capacity:</span>
                  <span class="value">{{ meal.dailyCapacity }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Availability:</span>
                  <mat-chip [color]="meal.available ? 'primary' : 'warn'">
                    {{ meal.available ? 'Available' : 'Not Available' }}
                  </mat-chip>
                </div>
                <div class="info-item">
                  <span class="label">Meal ID:</span>
                  <span class="value">#{{ meal.id }}</span>
                </div>
              </div>
            </div>
          </mat-card-content>
          <mat-card-actions class="action-buttons">
            <button mat-raised-button 
                    color="primary" 
                    (click)="editMeal()"
                    *ngIf="isAdmin">
              <mat-icon>edit</mat-icon>
              Edit Meal
            </button>
            <button mat-button 
                    color="accent" 
                    (click)="goBack()">
              <mat-icon>arrow_back</mat-icon>
              Back to List
            </button>
          </mat-card-actions>
        </mat-card>
      </div>

      <div *ngIf="!isLoading && !meal" class="error-container">
        <mat-card class="error-card">
          <mat-card-content>
            <h3>Meal Not Found</h3>
            <p>The requested meal could not be found.</p>
            <button mat-raised-button color="primary" (click)="goBack()">
              Back to Meals
            </button>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .meal-detail-container {
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
      min-height: 100vh;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 400px;
    }

    .meal-content {
      animation: fadeIn 0.3s ease-in;
    }

    .detail-card {
      margin-bottom: 2rem;
    }

    .meal-info {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .info-section h3 {
      margin: 0 0 0.5rem 0;
      color: #333;
      font-weight: 500;
    }

    .info-section p {
      margin: 0;
      line-height: 1.6;
      color: #666;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .label {
      font-weight: 500;
      color: #555;
      font-size: 0.9rem;
    }

    .value {
      font-size: 1.1rem;
      font-weight: 600;
      color: #333;
    }

    .action-buttons {
      display: flex;
      gap: 1rem;
      padding: 1rem;
    }

    .error-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
    }

    .error-card {
      text-align: center;
      max-width: 400px;
    }

    .error-card h3 {
      color: #f44336;
      margin-bottom: 1rem;
    }

    .error-card p {
      color: #666;
      margin-bottom: 2rem;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (max-width: 768px) {
      .meal-detail-container {
        padding: 1rem;
      }

      .info-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .action-buttons {
        flex-direction: column;
      }

      .action-buttons button {
        width: 100%;
      }
    }
  `]
})
export class MealDetailComponent {
  meal: Meal | null = null;
  isLoading = false;
  isAdmin = false;

  constructor(
    private mealService: MealService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadMeal();
    this.checkAdminRole();
  }

  private checkAdminRole(): void {
    // This would come from your auth service
    // For now, we'll assume admin role check
    this.isAdmin = true; // Change this based on actual auth logic
  }

  private loadMeal(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isLoading = true;
      this.mealService.getMeal(+id).subscribe({
        next: (response) => {
          this.meal = response.data;
          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;
          this.snackBar.open('Failed to load meal details', 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });
        }
      });
    }
  }

  editMeal(): void {
    if (this.meal) {
      this.router.navigate(['/meals', this.meal.id, 'edit']);
    }
  }

  goBack(): void {
    this.router.navigate(['/meals']);
  }
}
