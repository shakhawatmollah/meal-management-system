import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  ApiResponse,
  Employee,
  EmployeeRequest,
  SearchParams
} from '../../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private readonly API_URL = `${environment.apiUrl}/employees`;
  private readonly cacheTtlMs = 30_000;
  private readonly listCache = new Map<string, { expiresAt: number; value: ApiResponse<Employee[]> }>();

  constructor(private http: HttpClient) {}

  getEmployees(params?: SearchParams): Observable<ApiResponse<Employee[]>> {
    const queryParams = this.buildQueryParams(params);
    const url = `${this.API_URL}${queryParams}`;
    const cached = this.getCached(url);
    if (cached) return of(cached);

    return this.http.get<ApiResponse<Employee[]>>(url).pipe(
      tap((response) => this.setCache(url, response))
    );
  }

  getEmployee(id: number): Observable<ApiResponse<Employee>> {
    return this.http.get<ApiResponse<Employee>>(`${this.API_URL}/${id}`);
  }

  createEmployee(employee: EmployeeRequest): Observable<ApiResponse<Employee>> {
    return this.http.post<ApiResponse<Employee>>(this.API_URL, employee).pipe(
      tap(() => this.clearCache())
    );
  }

  updateEmployee(id: number, employee: EmployeeRequest): Observable<ApiResponse<Employee>> {
    return this.http.put<ApiResponse<Employee>>(`${this.API_URL}/${id}`, employee).pipe(
      tap(() => this.clearCache())
    );
  }

  deleteEmployee(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/${id}`).pipe(
      tap(() => this.clearCache())
    );
  }

  private getCached(key: string): ApiResponse<Employee[]> | null {
    const entry = this.listCache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.listCache.delete(key);
      return null;
    }
    return entry.value;
  }

  private setCache(key: string, value: ApiResponse<Employee[]>): void {
    this.listCache.set(key, {
      expiresAt: Date.now() + this.cacheTtlMs,
      value
    });
  }

  private clearCache(): void {
    this.listCache.clear();
  }

  private buildQueryParams(params?: SearchParams): string {
    if (!params) return '';
    
    const query = new URLSearchParams();
    
    if (params.page !== undefined) query.set('page', params.page.toString());
    if (params.size !== undefined) query.set('size', params.size.toString());
    if (params.sort) query.set('sortBy', params.sort);
    if (params.direction) query.set('direction', params.direction);
    if (params.search) query.set('search', params.search);
    if (params.department) query.set('department', params.department);
    if (params.status) query.set('status', params.status);
    
    const queryString = query.toString();
    return queryString ? `?${queryString}` : '';
  }
}
