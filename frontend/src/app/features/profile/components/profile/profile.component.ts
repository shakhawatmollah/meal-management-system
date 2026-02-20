import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProfileApiService } from '../../../../core/services/api/profile-api.service';
import { UpdateProfileRequest, UserProfile } from '../../../../core/models/api.models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  user: UserProfile | null = null;
  editable = {
    name: '',
    department: ''
  };

  isEditing = false;
  isLoading = false;
  originalEditable = {
    name: '',
    department: ''
  };

  constructor(
    private snackBar: MatSnackBar,
    private profileApi: ProfileApiService
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.isLoading = true;
    this.profileApi.getProfile().subscribe({
      next: (response) => {
        this.user = response.data;
        this.editable = {
          name: response.data.name,
          department: response.data.department
        };
        this.originalEditable = { ...this.editable };
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('Failed to load profile', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });
      }
    });
  }

  enableEdit(): void {
    if (!this.user) return;
    this.isEditing = true;
    this.originalEditable = { ...this.editable };
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.editable = { ...this.originalEditable };
  }

  saveProfile(): void {
    if (!this.user) return;
    const payload: UpdateProfileRequest = {
      name: this.editable.name,
      department: this.editable.department
    };

    this.isLoading = true;
    this.profileApi.updateProfile(payload).subscribe({
      next: (response) => {
        this.user = response.data;
        this.editable = {
          name: response.data.name,
          department: response.data.department
        };
        this.originalEditable = { ...this.editable };
        this.isEditing = false;
        this.isLoading = false;
        this.snackBar.open('Profile updated successfully!', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('Failed to update profile', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });
      }
    });
  }

  getRoleDisplay(): string {
    if (!this.user?.roles?.length) return '';
    return this.user.roles
      .map((role) => role.replace('ROLE_', '').replace(/_/g, ' '))
      .join(', ');
  }
}
