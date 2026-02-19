import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
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
  private readonly cacheTtlMs = 30_000;
  private readonly listCache = new Map<string, { expiresAt: number; value: ApiResponse<MealOrder[]> }>();

  constructor(private http: HttpClient) {}

  getOrders(params?: SearchParams): Observable<ApiResponse<MealOrder[]>> {
    const queryParams = this.buildQueryParams(params);
    const url = `${this.API_URL}${queryParams}`;
    const cached = this.getCached(url);
    if (cached) return of(cached);

    return this.http.get<ApiResponse<MealOrder[]>>(url).pipe(
      tap((response) => this.setCache(url, response))
    );
  }

  getOrder(id: number): Observable<ApiResponse<MealOrder>> {
    return this.http.get<ApiResponse<MealOrder>>(`${this.API_URL}/${id}`);
  }

  createOrder(order: MealOrderRequest): Observable<ApiResponse<MealOrder>> {
    return this.http.post<ApiResponse<MealOrder>>(this.API_URL, order).pipe(
      tap(() => this.clearCache())
    );
  }

  updateOrderStatus(id: number, status: string): Observable<ApiResponse<MealOrder>> {
    return this.http.patch<ApiResponse<MealOrder>>(`${this.API_URL}/${id}/status?status=${status}`, {}).pipe(
      tap(() => this.clearCache())
    );
  }

  cancelOrder(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/${id}`).pipe(
      tap(() => this.clearCache())
    );
  }

  getMyOrders(employeeId: number, params?: SearchParams): Observable<ApiResponse<MealOrder[]>> {
    const query = new URLSearchParams();
    query.set('employeeId', employeeId.toString());
    if (params?.page !== undefined) query.set('page', params.page.toString());
    if (params?.size !== undefined) query.set('size', params.size.toString());
    if (params?.sort) query.set('sortBy', params.sort);
    if (params?.direction) query.set('direction', params.direction);
    const url = `${this.API_URL}?${query.toString()}`;
    const cached = this.getCached(url);
    if (cached) return of(cached);

    return this.http.get<ApiResponse<MealOrder[]>>(url).pipe(
      tap((response) => this.setCache(url, response))
    );
  }

  getOrdersByDate(date: string): Observable<ApiResponse<MealOrder[]>> {
    const url = `${this.API_URL}?date=${date}`;
    const cached = this.getCached(url);
    if (cached) return of(cached);

    return this.http.get<ApiResponse<MealOrder[]>>(url).pipe(
      tap((response) => this.setCache(url, response))
    );
  }

  private getCached(key: string): ApiResponse<MealOrder[]> | null {
    const entry = this.listCache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.listCache.delete(key);
      return null;
    }
    return entry.value;
  }

  private setCache(key: string, value: ApiResponse<MealOrder[]>): void {
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
    if (params.dateFrom) query.set('date', params.dateFrom);
    
    const queryString = query.toString();
    return queryString ? `?${queryString}` : '';
  }
}
