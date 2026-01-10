import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

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
  user: any = {
    name: '',
    email: '',
    role: '',
    department: '',
    phone: ''
  };

  isEditing = false;
  originalUser: any = {};

  constructor(private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    // TODO: Replace with actual API call
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      const userData = JSON.parse(currentUser);
      this.user = {
        name: userData.name || 'John Doe',
        email: userData.email || 'john.doe@example.com',
        role: userData.role || 'Employee',
        department: userData.department || 'IT',
        phone: userData.phone || '+1234567890'
      };
      this.originalUser = { ...this.user };
    }
  }

  enableEdit(): void {
    this.isEditing = true;
    this.originalUser = { ...this.user };
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.user = { ...this.originalUser };
  }

  saveProfile(): void {
    // TODO: Replace with actual API call
    localStorage.setItem('currentUser', JSON.stringify({
      ...JSON.parse(localStorage.getItem('currentUser') || '{}'),
      ...this.user
    }));
    
    this.isEditing = false;
    this.snackBar.open('Profile updated successfully!', 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }
}
