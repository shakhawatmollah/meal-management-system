import { Component, Input } from '@angular/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [MatProgressSpinner],
  template: `
    <div class="loading-container" [class.centered]="centered">
      <mat-spinner 
        [diameter]="diameter" 
        [strokeWidth]="strokeWidth"
        [mode]="mode">
      </mat-spinner>
      @if (message) {
        <p class="loading-message">{{ message }}</p>
      }
    </div>
  `,
  styles: [`
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 20px;
    }
    
    .centered {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 1000;
    }
    
    .loading-message {
      margin: 0;
      color: #666;
      font-size: 14px;
      text-align: center;
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() diameter: number = 40;
  @Input() strokeWidth: number = 4;
  @Input() mode: 'determinate' | 'indeterminate' = 'indeterminate';
  @Input() message?: string;
  @Input() centered: boolean = false;
}
