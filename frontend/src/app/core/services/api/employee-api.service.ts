import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  ApiResponse,
  PageResponse,
  Employee,
  EmployeeRequest,
  SearchParams
} from '../../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private readonly API_URL = `${environment.apiUrl}/employees`;

  constructor(private http: HttpClient) {}

  getEmployees(params?: SearchParams): Observable<ApiResponse<PageResponse<Employee>>> {
    const queryParams = this.buildQueryParams(params);
    return this.http.get<ApiResponse<PageResponse<Employee>>>(`${this.API_URL}${queryParams}`);
  }

  getEmployee(id: number): Observable<ApiResponse<Employee>> {
    return this.http.get<ApiResponse<Employee>>(`${this.API_URL}/${id}`);
  }

  createEmployee(employee: EmployeeRequest): Observable<ApiResponse<Employee>> {
    return this.http.post<ApiResponse<Employee>>(this.API_URL, employee);
  }

  updateEmployee(id: number, employee: EmployeeRequest): Observable<ApiResponse<Employee>> {
    return this.http.put<ApiResponse<Employee>>(`${this.API_URL}/${id}`, employee);
  }

  deleteEmployee(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/${id}`);
  }

  private buildQueryParams(params?: SearchParams): string {
    if (!params) return '';
    
    const query = new URLSearchParams();
    
    if (params.page !== undefined) query.set('page', params.page.toString());
    if (params.size !== undefined) query.set('size', params.size.toString());
    if (params.sort) query.set('sort', `${params.sort},${params.direction || 'ASC'}`);
    if (params.search) query.set('search', params.search);
    if (params.department) query.set('department', params.department);
    if (params.status) query.set('status', params.status);
    
    const queryString = query.toString();
    return queryString ? `?${queryString}` : '';
  }
}
