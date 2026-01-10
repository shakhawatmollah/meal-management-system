import { Injectable, ErrorHandler } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../../environments/environment';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  
  constructor(private snackBar: MatSnackBar) {}

  handleError(error: any): void {
    console.error('Global Error Handler:', error);
    
    let errorMessage = 'An unexpected error occurred';
    
    if (error?.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else if (error?.status) {
      // HTTP error
      switch (error.status) {
        case 400:
          errorMessage = error.error?.message || 'Bad request';
          break;
        case 401:
          errorMessage = 'Unauthorized - Please login again';
          break;
        case 403:
          errorMessage = 'Access denied';
          break;
        case 404:
          errorMessage = 'Resource not found';
          break;
        case 409:
          errorMessage = error.error?.message || 'Conflict occurred';
          break;
        case 500:
          errorMessage = 'Internal server error';
          break;
        default:
          errorMessage = error.error?.message || `Server error: ${error.status}`;
      }
    } else if (error?.message) {
      // JavaScript error
      errorMessage = error.message;
    }

    // Show user-friendly error message
    this.snackBar.open(errorMessage, 'Close', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });

    // Log detailed error in development
    if (environment.enableDebug) {
      console.error('Detailed error:', error);
    }
  }
}
