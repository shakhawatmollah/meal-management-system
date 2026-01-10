import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="confirm-dialog">
      <div class="dialog-header">
        <mat-icon [color]="iconColor">{{ icon }}</mat-icon>
        <h2 mat-dialog-title>{{ title }}</h2>
      </div>
      
      <div mat-dialog-content>
        <p>{{ message }}</p>
        @if (details) {
          <p class="details">{{ details }}</p>
        }
      </div>
      
      <div mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">Cancel</button>
        <button 
          mat-flat-button 
          [color]="confirmColor"
          (click)="onConfirm()">
          {{ confirmText }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .confirm-dialog {
      min-width: 300px;
      max-width: 500px;
    }
    
    .dialog-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }
    
    .dialog-header h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 500;
    }
    
    .details {
      color: #666;
      font-size: 14px;
      margin-top: 8px;
    }
    
    mat-dialog-actions {
      margin-top: 20px;
    }
  `]
})
export class ConfirmDialogComponent {
  @Input() title: string = 'Confirm Action';
  @Input() message: string = 'Are you sure you want to proceed?';
  @Input() details?: string;
  @Input() confirmText: string = 'Confirm';
  @Input() icon: string = 'warning';
  @Input() iconColor: string = 'warn';
  @Input() confirmColor: string = 'primary';

  constructor(private dialogRef: MatDialogRef<ConfirmDialogComponent>) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
