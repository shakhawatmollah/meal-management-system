import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';
import { Observable } from 'rxjs';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    RouterLink,
    RouterLinkActive,
    MatMenuModule,
    MatDividerModule
  ],
  template: `
    <div class="app-container">
      <!-- Header -->
      <mat-toolbar color="primary" class="app-header">
        <mat-toolbar-row>
          <button mat-icon-button routerLink="/dashboard">
            <mat-icon>restaurant_menu</mat-icon>
          </button>
          
          <span class="app-title">Meal Management System</span>
          
          <span class="flex-spacer"></span>
          
          <!-- Navigation for authenticated users -->
          <ng-container *ngIf="isAuthenticated$ | async">
            <button mat-button routerLink="/dashboard" routerLinkActive="active">
              <mat-icon>dashboard</mat-icon>
              <span>Dashboard</span>
            </button>
            
            <button mat-button routerLink="/meals" routerLinkActive="active">
              <mat-icon>restaurant</mat-icon>
              <span>Meals</span>
            </button>
            
            <button mat-button routerLink="/my-orders" routerLinkActive="active">
              <mat-icon>shopping_cart</mat-icon>
              <span>My Orders</span>
            </button>
            
            <!-- Admin menu -->
            <ng-container *ngIf="isAdmin$ | async">
              <button mat-button routerLink="/orders" routerLinkActive="active">
                <mat-icon>list_alt</mat-icon>
                <span>All Orders</span>
              </button>
              
              <button mat-button routerLink="/employees" routerLinkActive="active">
                <mat-icon>people</mat-icon>
                <span>Employees</span>
              </button>
            </ng-container>
            
            <!-- User menu -->
            <button mat-icon-button [matMenuTriggerFor]="userMenu">
              <mat-icon>account_circle</mat-icon>
            </button>
            
            <mat-menu #userMenu="matMenu">
              <button mat-menu-item routerLink="/profile">
                <mat-icon>person</mat-icon>
                <span>Profile</span>
              </button>
              <mat-divider></mat-divider>
              <button mat-menu-item (click)="logout()">
                <mat-icon>logout</mat-icon>
                <span>Logout</span>
              </button>
            </mat-menu>
          </ng-container>
          
          <!-- Navigation for non-authenticated users -->
          <ng-container *ngIf="!(isAuthenticated$ | async)">
            <button mat-button routerLink="/login">
              <mat-icon>login</mat-icon>
              <span>Login</span>
            </button>
            <button mat-button routerLink="/register">
              <mat-icon>person_add</mat-icon>
              <span>Register</span>
            </button>
          </ng-container>
        </mat-toolbar-row>
      </mat-toolbar>
      
      <!-- Main Content -->
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    
    .app-header {
      position: sticky;
      top: 0;
      z-index: 1000;
    }
    
    .app-title {
      font-size: 1.5rem;
      font-weight: 500;
      margin-left: 1rem;
    }
    
    .flex-spacer {
      flex: 1 1 auto;
    }
    
    .main-content {
      flex: 1;
      padding: 2rem;
      background-color: #f5f5f5;
    }
    
    .active {
      background-color: rgba(255, 255, 255, 0.1);
    }
    
    button[mat-button] {
      margin: 0 0.25rem;
    }
    
    @media (max-width: 768px) {
      .app-title {
        display: none;
      }
      
      .main-content {
        padding: 1rem;
      }
      
      button[mat-button] span {
        display: none;
      }
    }
  `]
})
export class AppComponent {
  isAuthenticated$: Observable<boolean>;
  isAdmin$: Observable<boolean>;

  constructor(private authService: AuthService) {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
    this.isAdmin$ = this.authService.isAdmin$;
  }

  logout(): void {
    this.authService.logout();
  }
}
