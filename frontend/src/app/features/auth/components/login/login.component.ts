import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { LoginRequest } from '../../../../core/models/api.models';
import { withLoading } from '../../../../shared/services/loading.operator';

@Component({
  selector: 'app-login',
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
    MatProgressSpinnerModule
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title>Login</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput 
                     formControlName="email" 
                     type="email" 
                     placeholder="Enter your email"
                     required>
              <mat-error *ngIf="loginForm.get('email')?.hasError('required')">
                Email is required
              </mat-error>
              <mat-error *ngIf="loginForm.get('email')?.hasError('email')">
                Please enter a valid email
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput 
                     formControlName="password" 
                     type="password" 
                     placeholder="Enter your password"
                     required>
              <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
                Password is required
              </mat-error>
            </mat-form-field>

            <div class="button-container">
              <button mat-raised-button 
                      color="primary" 
                      type="submit" 
                      [disabled]="loginForm.invalid || isLoading"
                      class="full-width">
                <span *ngIf="!isLoading">Login</span>
                <mat-spinner *ngIf="isLoading" diameter="20"></mat-spinner>
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <div class="register-link">
        <p>Don't have an account? 
          <a routerLink="/register">Register here</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem;
    }

    .login-card {
      width: 100%;
      max-width: 400px;
      padding: 2rem;
    }

    .full-width {
      width: 100%;
      margin-bottom: 1rem;
    }

    .button-container {
      margin-top: 1.5rem;
    }

    .register-link {
      text-align: center;
      margin-top: 1rem;
      color: white;
    }

    .register-link a {
      color: #ffd700;
      text-decoration: none;
      font-weight: 500;
    }

    .register-link a:hover {
      text-decoration: underline;
    }

    mat-spinner {
      margin-right: 8px;
    }

    @media (max-width: 480px) {
      .login-container {
        padding: 1rem;
      }
      
      .login-card {
        padding: 1.5rem;
      }
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const loginRequest: LoginRequest = this.loginForm.value;
      
      this.authService.login(loginRequest).pipe(
        withLoading((loading) => {
          this.isLoading = loading;
        })
      ).subscribe({
        next: () => {
          this.snackBar.open('Login successful!', 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });
          this.router.navigate(['/dashboard']);
        },
        error: () => {
          this.snackBar.open('Login failed. Please check your credentials.', 'Close', {
            duration: 5000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });
        }
      });
    }
  }
}
