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
      const serverMessage = this.extractServerMessage(resolvedError.error);

      // HTTP error
      switch (resolvedError.status) {
        case 400:
          errorMessage = serverMessage || 'Bad request';
          break;
        case 401:
          errorMessage = serverMessage || 'Unauthorized - Please login again';
          break;
        case 403:
          errorMessage = serverMessage || 'Access denied';
          break;
        case 404:
          errorMessage = serverMessage || 'Resource not found';
          break;
        case 409:
          errorMessage = serverMessage || 'Conflict occurred';
          break;
        case 500:
          errorMessage = serverMessage || 'Internal server error';
          break;
        default:
          errorMessage = serverMessage || `Server error: ${resolvedError.status}`;
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

  private extractServerMessage(body: unknown): string | null {
    if (!body || typeof body !== 'object') {
      return null;
    }

    const payload = body as Record<string, unknown>;

    const directMessage = payload['message'];
    if (typeof directMessage === 'string' && directMessage.trim().length > 0) {
      return directMessage;
    }

    const validationErrors = payload['validationErrors'];
    if (validationErrors && typeof validationErrors === 'object') {
      const first = Object.values(validationErrors as Record<string, unknown>)
        .find((value) => typeof value === 'string' && value.trim().length > 0);
      if (typeof first === 'string') {
        return first;
      }
    }

    const errorText = payload['error'];
    if (typeof errorText === 'string' && errorText.trim().length > 0) {
      return errorText;
    }

    return null;
  }
}
