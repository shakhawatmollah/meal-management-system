import { Injectable, ErrorHandler } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../../environments/environment';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private lastErrorKey = '';
  private lastErrorAt = 0;
  
  constructor(private snackBar: MatSnackBar) {}

  handleError(error: any): void {
    const resolvedError = error?.rejection || error?.originalError || error;
    const errorText = this.extractErrorText(resolvedError);

    // Prevent repeated floods from the same error in a short window.
    if (this.shouldSuppress(errorText)) {
      return;
    }

    console.error('Global Error Handler:', resolvedError);
    
    let errorMessage = 'An unexpected error occurred';
    
    if (resolvedError?.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = resolvedError.error.message;
    } else if (resolvedError?.status) {
      // HTTP error
      switch (resolvedError.status) {
        case 400:
          errorMessage = resolvedError.error?.message || 'Bad request';
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
          errorMessage = resolvedError.error?.message || 'Conflict occurred';
          break;
        case 500:
          errorMessage = 'Internal server error';
          break;
        default:
          errorMessage = resolvedError.error?.message || `Server error: ${resolvedError.status}`;
      }
    } else if (resolvedError?.message) {
      // JavaScript error
      errorMessage = resolvedError.message;
    }

    // NG0100 is a developer-time expression check error. Avoid snackbar loops.
    if (errorText.includes('ExpressionChangedAfterItHasBeenCheckedError')) {
      if (environment.enableDebug) {
        console.warn('Suppressed NG0100 snackbar:', errorText);
      }
      return;
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
      console.error('Detailed error:', resolvedError);
    }
  }

  private extractErrorText(error: any): string {
    if (!error) return '';
    if (typeof error === 'string') return error;
    return `${error?.name || ''}:${error?.message || ''}:${error?.status || ''}`;
  }

  private shouldSuppress(errorKey: string): boolean {
    const now = Date.now();
    if (!errorKey) return false;
    if (this.lastErrorKey === errorKey && now - this.lastErrorAt < 2000) {
      return true;
    }
    this.lastErrorKey = errorKey;
    this.lastErrorAt = now;
    return false;
  }
}
