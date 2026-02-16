import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  ApiResponse,
  MealOrder,
  MealOrderRequest,
  SearchParams
} from '../../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly API_URL = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  getOrders(params?: SearchParams): Observable<ApiResponse<MealOrder[]>> {
    const queryParams = this.buildQueryParams(params);
    return this.http.get<ApiResponse<MealOrder[]>>(`${this.API_URL}${queryParams}`);
  }

  getOrder(id: number): Observable<ApiResponse<MealOrder>> {
    return this.http.get<ApiResponse<MealOrder>>(`${this.API_URL}/${id}`);
  }

  createOrder(order: MealOrderRequest): Observable<ApiResponse<MealOrder>> {
    return this.http.post<ApiResponse<MealOrder>>(this.API_URL, order);
  }

  updateOrderStatus(id: number, status: string): Observable<ApiResponse<MealOrder>> {
    return this.http.patch<ApiResponse<MealOrder>>(`${this.API_URL}/${id}/status?status=${status}`, {});
  }

  cancelOrder(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/${id}`);
  }

  getMyOrders(employeeId: number, params?: SearchParams): Observable<ApiResponse<MealOrder[]>> {
    const query = new URLSearchParams();
    query.set('employeeId', employeeId.toString());
    if (params?.page !== undefined) query.set('page', params.page.toString());
    if (params?.size !== undefined) query.set('size', params.size.toString());
    if (params?.sort) query.set('sortBy', params.sort);
    if (params?.direction) query.set('direction', params.direction);
    return this.http.get<ApiResponse<MealOrder[]>>(`${this.API_URL}?${query.toString()}`);
  }

  getOrdersByDate(date: string): Observable<ApiResponse<MealOrder[]>> {
    return this.http.get<ApiResponse<MealOrder[]>>(`${this.API_URL}?date=${date}`);
  }

  private buildQueryParams(params?: SearchParams): string {
    if (!params) return '';
    
    const query = new URLSearchParams();
    
    if (params.page !== undefined) query.set('page', params.page.toString());
    if (params.size !== undefined) query.set('size', params.size.toString());
    if (params.sort) query.set('sortBy', params.sort);
    if (params.direction) query.set('direction', params.direction);
    if (params.dateFrom) query.set('date', params.dateFrom);
    
    const queryString = query.toString();
    return queryString ? `?${queryString}` : '';
  }
}
