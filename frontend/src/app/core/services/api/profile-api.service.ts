import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse, UpdateProfileRequest, UserProfile } from '../../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class ProfileApiService {
  private readonly API_URL = `${environment.apiUrl}/profile`;

  constructor(private http: HttpClient) {}

  getProfile(): Observable<ApiResponse<UserProfile>> {
    return this.http.get<ApiResponse<UserProfile>>(this.API_URL);
  }

  updateProfile(payload: UpdateProfileRequest): Observable<ApiResponse<UserProfile>> {
    return this.http.put<ApiResponse<UserProfile>>(this.API_URL, payload);
  }
}
