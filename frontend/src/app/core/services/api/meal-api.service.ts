import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  ApiResponse,
  Meal,
  MealRequest,
  SearchParams
} from '../../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class MealService {
  private readonly API_URL = `${environment.apiUrl}/meals`;
  private readonly cacheTtlMs = 30_000;
  private readonly listCache = new Map<string, { expiresAt: number; value: ApiResponse<Meal[]> }>();

  constructor(private http: HttpClient) {}

  getMeals(params?: SearchParams): Observable<ApiResponse<Meal[]>> {
    const queryParams = this.buildQueryParams(params);
    const url = `${this.API_URL}${queryParams}`;
    const cached = this.getCached(url);
    if (cached) return of(cached);

    return this.http.get<ApiResponse<Meal[]>>(url).pipe(
      tap((response) => this.setCache(url, response))
    );
  }

  getMeal(id: number): Observable<ApiResponse<Meal>> {
    return this.http.get<ApiResponse<Meal>>(`${this.API_URL}/${id}`);
  }

  createMeal(meal: MealRequest): Observable<ApiResponse<Meal>> {
    return this.http.post<ApiResponse<Meal>>(this.API_URL, meal).pipe(
      tap(() => this.clearCache())
    );
  }

  updateMeal(id: number, meal: MealRequest): Observable<ApiResponse<Meal>> {
    return this.http.put<ApiResponse<Meal>>(`${this.API_URL}/${id}`, meal).pipe(
      tap(() => this.clearCache())
    );
  }

  deleteMeal(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/${id}`).pipe(
      tap(() => this.clearCache())
    );
  }

  getAvailableMeals(): Observable<ApiResponse<Meal[]>> {
    const url = `${this.API_URL}?available=true`;
    const cached = this.getCached(url);
    if (cached) return of(cached);

    return this.http.get<ApiResponse<Meal[]>>(url).pipe(
      tap((response) => this.setCache(url, response))
    );
  }

  private getCached(key: string): ApiResponse<Meal[]> | null {
    const entry = this.listCache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.listCache.delete(key);
      return null;
    }
    return entry.value;
  }

  private setCache(key: string, value: ApiResponse<Meal[]>): void {
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
    if (params.available !== undefined) query.set('available', params.available.toString());
    if (params.type) query.set('type', params.type);
    
    const queryString = query.toString();
    return queryString ? `?${queryString}` : '';
  }
}
