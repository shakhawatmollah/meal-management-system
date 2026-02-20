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
import { environment } from '../../environments/environment';
import { switchMap } from 'rxjs/operators';

export const errorInterceptor = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const snackBar = inject(MatSnackBar);
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unexpected error occurred';

      if (environment.enableDebug) {
        console.error(
          '[HTTP ERROR]',
          {
            method: req.method,
            url: req.urlWithParams,
            status: error.status,
            message: error.message,
            body: error.error
          }
        );
      }

      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = error.error.message;
      } else {
        const serverMessage = extractServerMessage(error.error);
        const isUnauthorized = error.status === 401;
        const isAuthEndpoint = isAuthUrl(req.url);
        const alreadyRetried = req.headers.has('X-Refresh-Retry');

        if (isUnauthorized && !isAuthEndpoint && !alreadyRetried) {
          return authService.refreshToken().pipe(
            switchMap(() => {
              const refreshedToken = authService.getAccessToken();
              if (!refreshedToken) {
                authService.logout();
                return throwError(() => error);
              }

              const retriedRequest = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${refreshedToken}`,
                  'X-Refresh-Retry': '1'
                }
              });

              return next(retriedRequest);
            }),
            catchError(() => {
              authService.logout();
              return throwError(() => error);
            })
          );
        }

        // Server-side error
        switch (error.status) {
          case 400:
            errorMessage = serverMessage || 'Bad request';
            break;
          case 401:
            errorMessage = serverMessage || 'Unauthorized - Please login again';
            authService.logout();
            break;
          case 403:
            errorMessage = serverMessage || 'Access denied';
            router.navigate(['/dashboard']);
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
            errorMessage = serverMessage || `Server error: ${error.status}`;
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

function isAuthUrl(url: string): boolean {
  return (
    url.includes('/auth/login') ||
    url.includes('/auth/refresh') ||
    url.includes('/auth/logout') ||
    url.includes('/auth/register')
  );
}

function extractServerMessage(body: unknown): string | null {
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
