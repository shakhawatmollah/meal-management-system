import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../components/confirm-dialog/confirm-dialog.component';
import { Observable } from 'rxjs';

export interface ConfirmDialogOptions {
  title?: string;
  message?: string;
  details?: string;
  confirmText?: string;
  icon?: string;
  iconColor?: string;
  confirmColor?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  constructor(private dialog: MatDialog) {}

  confirm(options: ConfirmDialogOptions = {}): Observable<boolean> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: options,
      disableClose: true
    });

    return dialogRef.afterClosed();
  }

  deleteConfirm(itemName?: string): Observable<boolean> {
    return this.confirm({
      title: 'Delete Item',
      message: itemName 
        ? `Are you sure you want to delete "${itemName}"?`
        : 'Are you sure you want to delete this item?',
      details: 'This action cannot be undone.',
      confirmText: 'Delete',
      icon: 'delete',
      iconColor: 'warn',
      confirmColor: 'warn'
    });
  }

  saveConfirm(): Observable<boolean> {
    return this.confirm({
      title: 'Save Changes',
      message: 'Do you want to save your changes?',
      confirmText: 'Save',
      icon: 'save',
      iconColor: 'primary',
      confirmColor: 'primary'
    });
  }

  logoutConfirm(): Observable<boolean> {
    return this.confirm({
      title: 'Logout',
      message: 'Are you sure you want to logout?',
      confirmText: 'Logout',
      icon: 'logout',
      iconColor: 'primary',
      confirmColor: 'primary'
    });
  }
}
