import {
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../core/services/auth.service';
import { Router } from '@angular/router';

export const errorInterceptor = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const snackBar = inject(MatSnackBar);
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unexpected error occurred';

      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = error.error.message;
      } else {
        // Server-side error
        switch (error.status) {
          case 400:
            errorMessage = error.error?.message || 'Bad request';
            break;
          case 401:
            errorMessage = 'Unauthorized - Please login again';
            authService.logout();
            break;
          case 403:
            errorMessage = 'Access denied';
            router.navigate(['/dashboard']);
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
      }

      snackBar.open(errorMessage, 'Close', {
        duration: 5000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });

      return throwError(() => error);
    })
  );
};
