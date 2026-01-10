import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { LoginRequest, LoginResponse } from '../models/api.models';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockLoginRequest: LoginRequest = {
    email: 'test@example.com',
    password: 'password123'
  };

  const mockLoginResponse: LoginResponse = {
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    tokenType: 'Bearer',
    expiresIn: 3600,
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    roles: ['ROLE_EMPLOYEE']
  };

  beforeEach(() => {
    const spy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: spy }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should login successfully', () => {
    service.login(mockLoginRequest).subscribe(response => {
      expect(response.success).toBe(true);
      expect(response.data).toEqual(mockLoginResponse);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush({ success: true, data: mockLoginResponse, message: 'Login successful' });

    // Check if tokens are stored
    const tokens = localStorage.getItem('auth_tokens');
    expect(tokens).toBeTruthy();
    const parsedTokens = JSON.parse(tokens!);
    expect(parsedTokens.accessToken).toBe(mockLoginResponse.accessToken);
  });

  it('should handle login failure', () => {
    service.login(mockLoginRequest).subscribe({
      next: () => fail('Should have failed'),
      error: (error) => expect(error).toBeTruthy()
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    req.flush('Login failed', { status: 401, statusText: 'Unauthorized' });
  });

  it('should logout and clear tokens', () => {
    // First login to set tokens
    service.login(mockLoginRequest).subscribe();
    const loginReq = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    loginReq.flush({ success: true, data: mockLoginResponse, message: 'Login successful' });

    // Then logout
    service.logout();
    const logoutReq = httpMock.expectOne(`${environment.apiUrl}/auth/logout`);
    logoutReq.flush({ success: true, message: 'Logout successful' });

    // Check if tokens are cleared
    expect(localStorage.getItem('auth_tokens')).toBeNull();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should return access token', () => {
    // Set up tokens in localStorage
    localStorage.setItem('auth_tokens', JSON.stringify({
      accessToken: 'test-access-token',
      refreshToken: 'test-refresh-token'
    }));

    const token = service.getAccessToken();
    expect(token).toBe('test-access-token');
  });

  it('should return null when no access token exists', () => {
    const token = service.getAccessToken();
    expect(token).toBeNull();
  });

  it('should check user roles correctly', () => {
    // Set up tokens in localStorage
    localStorage.setItem('auth_tokens', JSON.stringify({
      accessToken: 'test-access-token',
      refreshToken: 'test-refresh-token'
    }));

    // Mock current user with roles
    service['currentUserSubject'].next({
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      roles: ['ROLE_ADMIN', 'ROLE_EMPLOYEE']
    });

    expect(service.hasRole('ROLE_ADMIN')).toBe(true);
    expect(service.hasRole('ROLE_EMPLOYEE')).toBe(true);
    expect(service.hasRole('ROLE_CAFETERIA_STAFF')).toBe(false);
    expect(service.isAdmin()).toBe(true);
    expect(service.isEmployee()).toBe(true);
    expect(service.isCafeteriaStaff()).toBe(false);
  });

  it('should initialize auth state with valid tokens', () => {
    // Set up valid tokens in localStorage
    localStorage.setItem('auth_tokens', JSON.stringify({
      accessToken: 'valid-token',
      refreshToken: 'refresh-token'
    }));

    // Create service instance to trigger initialization
    service = TestBed.inject(AuthService);

    service.isAuthenticated$.subscribe(isAuth => {
      expect(isAuth).toBe(true);
    });
  });
});
