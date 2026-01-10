import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  ApiResponse,
  PageResponse,
  Meal,
  MealRequest,
  SearchParams
} from '../../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class MealService {
  private readonly API_URL = `${environment.apiUrl}/meals`;

  constructor(private http: HttpClient) {}

  getMeals(params?: SearchParams): Observable<ApiResponse<PageResponse<Meal>>> {
    const queryParams = this.buildQueryParams(params);
    return this.http.get<ApiResponse<PageResponse<Meal>>>(`${this.API_URL}${queryParams}`);
  }

  getMeal(id: number): Observable<ApiResponse<Meal>> {
    return this.http.get<ApiResponse<Meal>>(`${this.API_URL}/${id}`);
  }

  createMeal(meal: MealRequest): Observable<ApiResponse<Meal>> {
    return this.http.post<ApiResponse<Meal>>(this.API_URL, meal);
  }

  updateMeal(id: number, meal: MealRequest): Observable<ApiResponse<Meal>> {
    return this.http.put<ApiResponse<Meal>>(`${this.API_URL}/${id}`, meal);
  }

  deleteMeal(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/${id}`);
  }

  getAvailableMeals(): Observable<ApiResponse<Meal[]>> {
    return this.http.get<ApiResponse<Meal[]>>(`${this.API_URL}?available=true`);
  }

  private buildQueryParams(params?: SearchParams): string {
    if (!params) return '';
    
    const query = new URLSearchParams();
    
    if (params.page !== undefined) query.set('page', params.page.toString());
    if (params.size !== undefined) query.set('size', params.size.toString());
    if (params.sort) query.set('sort', `${params.sort},${params.direction || 'ASC'}`);
    if (params.search) query.set('search', params.search);
    if (params.available !== undefined) query.set('available', params.available.toString());
    if (params.type) query.set('type', params.type);
    
    const queryString = query.toString();
    return queryString ? `?${queryString}` : '';
  }
}
