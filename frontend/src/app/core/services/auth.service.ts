import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RefreshTokenRequest,
  RefreshTokenResponse,
  LogoutRequest
} from '../models/api.models';

interface DecodedTokenPayload {
  exp: number;
  sub?: string;
  roles?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/auth`;
  private readonly TOKEN_KEY = 'auth_tokens';
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private currentUserSubject = new BehaviorSubject<any>(null);
  
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  currentUser$ = this.currentUserSubject.asObservable();
  isAdmin$ = this.currentUserSubject.pipe(
    tap(user => console.log('Current user:', user)),
    // tap(user => console.log('Is admin:', user?.roles?.includes('ROLE_ADMIN')))
  );

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const tokens = this.getStoredTokens();
    if (tokens && this.isTokenValid(tokens.accessToken)) {
      this.setAuthState(tokens);
    } else {
      this.clearAuthState();
    }
  }

  login(credentials: LoginRequest): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>(`${this.API_URL}/login`, credentials).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.setAuthState({
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken
          });
          this.setCurrentUser({
            id: response.data.id,
            email: response.data.email,
            name: response.data.name,
            roles: response.data.roles
          });
        }
      })
    );
  }

  register(userData: RegisterRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.API_URL}/register`, userData);
  }

  refreshToken(): Observable<ApiResponse<RefreshTokenResponse>> {
    const tokens = this.getStoredTokens();
    if (!tokens?.refreshToken) {
      this.logout();
      throw new Error('No refresh token available');
    }

    return this.http.post<ApiResponse<RefreshTokenResponse>>(`${this.API_URL}/refresh`, {
      refreshToken: tokens.refreshToken
    }).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.setAuthState({
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken
          });
        }
      })
    );
  }

  logout(): void {
    const tokens = this.getStoredTokens();
    if (tokens?.refreshToken) {
      this.http.post<ApiResponse<void>>(`${this.API_URL}/logout`, {
        refreshToken: tokens.refreshToken
      }).subscribe({
        next: () => this.clearAuthState(),
        error: () => this.clearAuthState()
      });
    } else {
      this.clearAuthState();
    }
  }

  getAccessToken(): string | null {
    const tokens = this.getStoredTokens();
    return tokens?.accessToken || null;
  }

  getRefreshToken(): string | null {
    const tokens = this.getStoredTokens();
    return tokens?.refreshToken || null;
  }

  private setAuthState(tokens: { accessToken: string; refreshToken: string }): void {
    localStorage.setItem(this.TOKEN_KEY, JSON.stringify(tokens));
    this.setCurrentUserFromToken(tokens.accessToken);
    this.isAuthenticatedSubject.next(true);
  }

  private clearAuthState(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.isAuthenticatedSubject.next(false);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  private getStoredTokens(): { accessToken: string; refreshToken: string } | null {
    const tokens = localStorage.getItem(this.TOKEN_KEY);
    return tokens ? JSON.parse(tokens) : null;
  }

  private isTokenValid(token: string): boolean {
    try {
      const decoded: DecodedTokenPayload = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch {
      return false;
    }
  }

  private setCurrentUserFromToken(token: string): void {
    try {
      const decoded: DecodedTokenPayload = jwtDecode(token);
      const roles = decoded.roles
        ? decoded.roles.split(',').map(role => role.trim()).filter(Boolean)
        : [];

      this.setCurrentUser({
        id: null,
        email: decoded.sub || '',
        name: '',
        roles
      });
    } catch {
      this.currentUserSubject.next(null);
    }
  }

  private setCurrentUser(user: { id: number | null; email: string; name: string; roles: string[] }): void {
    this.currentUserSubject.next(user);
  }

  hasRole(role: string): boolean {
    const user = this.currentUserSubject.value;
    return user?.roles?.includes(role) || false;
  }

  isAdmin(): boolean {
    return this.hasRole('ROLE_ADMIN');
  }

  isCafeteriaStaff(): boolean {
    return this.hasRole('ROLE_CAFETERIA_STAFF');
  }

  isEmployee(): boolean {
    return this.hasRole('ROLE_EMPLOYEE');
  }

  getCurrentUser(): { id: number | null; email: string; name: string; roles: string[] } | null {
    return this.currentUserSubject.value;
  }
}
