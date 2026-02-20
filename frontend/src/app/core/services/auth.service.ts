import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, distinctUntilChanged, map, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RefreshTokenResponse
} from '../models/api.models';

interface DecodedTokenPayload {
  exp: number;
  sub?: string;
  roles?: string;
  id?: number | string;
  userId?: number | string;
  employeeId?: number | string;
  user_id?: number | string;
  uid?: number | string;
  [key: string]: unknown;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/auth`;
  private readonly TOKEN_KEY = 'auth_tokens';
  private readonly USER_KEY = 'auth_user';
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private currentUserSubject = new BehaviorSubject<any>(null);
  
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  currentUser$ = this.currentUserSubject.asObservable();
  isAdmin$ = this.currentUserSubject.pipe(
    map(user => Array.isArray(user?.roles) && user.roles.includes('ROLE_ADMIN')),
    distinctUntilChanged()
  );
  isPrivileged$ = this.currentUserSubject.pipe(
    map(user => Array.isArray(user?.roles) && (
      user.roles.includes('ROLE_ADMIN') || user.roles.includes('ROLE_CAFETERIA_STAFF')
    )),
    distinctUntilChanged()
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
      this.restoreStoredUser();
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
    localStorage.removeItem(this.USER_KEY);
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
      const decodedId = this.extractIdFromDecodedToken(decoded);

      this.setCurrentUser({
        id: decodedId,
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
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  private restoreStoredUser(): void {
    const stored = localStorage.getItem(this.USER_KEY);
    if (!stored) return;

    try {
      const user = JSON.parse(stored) as { id: number | null; email: string; name: string; roles: string[] };
      const current = this.currentUserSubject.value;

      // Keep token-derived roles/email fresh, but restore missing id/name from persisted user.
      this.currentUserSubject.next({
        id: this.normalizeId(current?.id) ?? this.normalizeId(user.id) ?? null,
        email: current?.email || user.email || '',
        name: current?.name || user.name || '',
        roles: Array.isArray(current?.roles) && current.roles.length > 0 ? current.roles : (user.roles ?? [])
      });
    } catch {
      localStorage.removeItem(this.USER_KEY);
    }
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

  resolveCurrentUserId(): number | null {
    const fromCurrent = this.normalizeId(this.currentUserSubject.value?.id);
    if (fromCurrent !== null) return fromCurrent;

    const stored = localStorage.getItem(this.USER_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as { id?: number | string };
        const fromStored = this.normalizeId(parsed?.id);
        if (fromStored !== null) return fromStored;
      } catch {
        // ignore malformed storage
      }
    }

    const accessToken = this.getAccessToken();
    if (accessToken) {
      try {
        const decoded: DecodedTokenPayload = jwtDecode(accessToken);
        const fromToken = this.extractIdFromDecodedToken(decoded);
        if (fromToken !== null) return fromToken;
      } catch {
        // ignore invalid token payload
      }
    }

    return null;
  }

  private extractIdFromDecodedToken(decoded: DecodedTokenPayload): number | null {
    const candidates = [decoded.id, decoded.userId, decoded.employeeId, decoded.user_id, decoded.uid];
    for (const candidate of candidates) {
      const normalized = this.normalizeId(candidate);
      if (normalized !== null) {
        return normalized;
      }
    }
    return null;
  }

  private normalizeId(value: unknown): number | null {
    if (value === null || value === undefined) return null;
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
  }
}
