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
      <div class="bg-orb orb-a"></div>
      <div class="bg-orb orb-b"></div>

      <mat-toolbar class="app-header">
        <div class="header-inner">
          <a class="brand" routerLink="/dashboard">
            <span class="brand-icon"><mat-icon>restaurant_menu</mat-icon></span>
            <span class="brand-text">MealFlow</span>
          </a>

          <span class="flex-spacer"></span>

          <ng-container *ngIf="isAuthenticated$ | async; else guestActions">
            <nav class="desktop-nav">
              <a mat-button routerLink="/dashboard" routerLinkActive="active-link">
                <mat-icon>dashboard</mat-icon><span>Dashboard</span>
              </a>
              <a mat-button routerLink="/meals" routerLinkActive="active-link">
                <mat-icon>restaurant</mat-icon><span>Meals</span>
              </a>
              <a mat-button routerLink="/my-orders" routerLinkActive="active-link">
                <mat-icon>shopping_cart</mat-icon><span>My Orders</span>
              </a>

              <ng-container *ngIf="isPrivileged$ | async">
                <a mat-button routerLink="/orders" routerLinkActive="active-link">
                  <mat-icon>list_alt</mat-icon><span>All Orders</span>
                </a>
                <a mat-button routerLink="/reports" routerLinkActive="active-link">
                  <mat-icon>assessment</mat-icon><span>Reports</span>
                </a>
              </ng-container>

              <ng-container *ngIf="isAdmin$ | async">
                <a mat-button routerLink="/employees" routerLinkActive="active-link">
                  <mat-icon>people</mat-icon><span>Employees</span>
                </a>
              </ng-container>
            </nav>

            <button mat-icon-button class="mobile-menu-btn" [matMenuTriggerFor]="mobileNavMenu" aria-label="Open navigation">
              <mat-icon>menu</mat-icon>
            </button>
            <mat-menu #mobileNavMenu="matMenu">
              <button mat-menu-item routerLink="/dashboard"><mat-icon>dashboard</mat-icon><span>Dashboard</span></button>
              <button mat-menu-item routerLink="/meals"><mat-icon>restaurant</mat-icon><span>Meals</span></button>
              <button mat-menu-item routerLink="/my-orders"><mat-icon>shopping_cart</mat-icon><span>My Orders</span></button>
              <ng-container *ngIf="isPrivileged$ | async">
                <button mat-menu-item routerLink="/orders"><mat-icon>list_alt</mat-icon><span>All Orders</span></button>
                <button mat-menu-item routerLink="/reports"><mat-icon>assessment</mat-icon><span>Reports</span></button>
              </ng-container>
              <ng-container *ngIf="isAdmin$ | async">
                <button mat-menu-item routerLink="/employees"><mat-icon>people</mat-icon><span>Employees</span></button>
              </ng-container>
            </mat-menu>

            <button mat-icon-button class="user-btn" [matMenuTriggerFor]="userMenu" aria-label="Open user menu">
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

          <ng-template #guestActions>
            <div class="guest-actions">
              <a mat-button routerLink="/login"><mat-icon>login</mat-icon><span>Login</span></a>
              <a mat-raised-button color="primary" routerLink="/register"><mat-icon>person_add</mat-icon><span>Register</span></a>
            </div>
          </ng-template>
        </div>
      </mat-toolbar>

      <main class="main-content">
        <div class="content-shell">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      position: relative;
      overflow: hidden;
    }

    .bg-orb {
      position: fixed;
      z-index: 0;
      border-radius: 50%;
      filter: blur(40px);
      opacity: 0.35;
      pointer-events: none;
    }

    .orb-a {
      width: 360px;
      height: 360px;
      top: -110px;
      left: -90px;
      background: #f59e0b;
    }

    .orb-b {
      width: 420px;
      height: 420px;
      top: 35%;
      right: -150px;
      background: #06b6d4;
    }

    .app-header {
      position: sticky;
      top: 0;
      z-index: 1000;
      background: rgba(255, 255, 255, 0.92);
      border-bottom: 1px solid rgba(15, 23, 42, 0.08);
      backdrop-filter: blur(8px);
    }

    .header-inner {
      width: min(1280px, 100%);
      margin: 0 auto;
      display: flex;
      align-items: center;
      padding: 0.35rem 1rem;
    }

    .brand {
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
      color: #0f172a;
      text-decoration: none;
    }

    .brand-icon {
      width: 2rem;
      height: 2rem;
      border-radius: 10px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      background: linear-gradient(135deg, #0891b2, #2563eb);
      box-shadow: 0 8px 18px rgba(37, 99, 235, 0.28);
    }

    .brand-text {
      font-size: 1.05rem;
      font-weight: 700;
      letter-spacing: 0.01em;
    }

    .flex-spacer {
      flex: 1 1 auto;
    }

    .desktop-nav {
      display: inline-flex;
      align-items: center;
      gap: 0.2rem;
    }

    .desktop-nav a[mat-button] {
      border-radius: 10px;
      color: #1e293b;
    }

    .desktop-nav a[mat-button] mat-icon {
      margin-right: 0.25rem;
    }

    .active-link {
      background: #e2e8f0;
      color: #0f172a;
    }

    .guest-actions {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
    }

    .mobile-menu-btn {
      display: none;
    }

    .user-btn {
      margin-left: 0.25rem;
    }

    .main-content {
      flex: 1;
      position: relative;
      z-index: 1;
      padding: 1.1rem;
    }

    .content-shell {
      width: min(1280px, 100%);
      margin: 0 auto;
    }

    @media (max-width: 1024px) {
      .desktop-nav {
        display: none;
      }

      .mobile-menu-btn {
        display: inline-flex;
      }

      .guest-actions a[mat-button] span {
        display: none;
      }
    }

    @media (max-width: 640px) {
      .header-inner {
        padding-inline: 0.45rem;
      }

      .brand-text {
        display: none;
      }
    }
  `]
})
export class AppComponent {
  isAuthenticated$: Observable<boolean>;
  isAdmin$: Observable<boolean>;
  isPrivileged$: Observable<boolean>;

  constructor(private authService: AuthService) {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
    this.isAdmin$ = this.authService.isAdmin$;
    this.isPrivileged$ = this.authService.isPrivileged$;
  }

  logout(): void {
    this.authService.logout();
  }
}
