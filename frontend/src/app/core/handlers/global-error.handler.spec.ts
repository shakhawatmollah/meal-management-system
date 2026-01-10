import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GlobalErrorHandler } from './global-error.handler';
import { environment } from '../../../environments/environment';

describe('GlobalErrorHandler', () => {
  let service: GlobalErrorHandler;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('MatSnackBar', ['open']);

    TestBed.configureTestingModule({
      providers: [
        GlobalErrorHandler,
        { provide: MatSnackBar, useValue: spy }
      ]
    });

    service = TestBed.inject(GlobalErrorHandler);
    snackBarSpy = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should handle HTTP errors and show appropriate messages', () => {
    const error = { status: 404, error: { message: 'Not found' } };
    
    service.handleError(error);

    expect(snackBarSpy.open).toHaveBeenCalledWith(
      'Resource not found',
      'Close',
      jasmine.objectContaining({
        duration: 5000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      })
    );
  });

  it('should handle client-side errors', () => {
    const error = { error: new ErrorEvent('NetworkError', { message: 'Network failed' }) };
    
    service.handleError(error);

    expect(snackBarSpy.open).toHaveBeenCalledWith(
      'Network failed',
      'Close',
      jasmine.objectContaining({
        duration: 5000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      })
    );
  });

  it('should handle JavaScript errors', () => {
    const error = new Error('Something went wrong');
    
    service.handleError(error);

    expect(snackBarSpy.open).toHaveBeenCalledWith(
      'Something went wrong',
      'Close',
      jasmine.objectContaining({
        duration: 5000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      })
    );
  });

  it('should show default message for unknown errors', () => {
    const error = { status: 999 };
    
    service.handleError(error);

    expect(snackBarSpy.open).toHaveBeenCalledWith(
      'An unexpected error occurred',
      'Close',
      jasmine.objectContaining({
        duration: 5000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      })
    );
  });

  it('should log detailed error in development mode', () => {
    spyOn(console, 'error');
    const error = new Error('Test error');
    
    // Set environment to development
    spyOnProperty(environment, 'enableDebug', 'get').and.returnValue(true);
    
    service.handleError(error);

    expect(console.error).toHaveBeenCalledWith('Detailed error:', error);
  });
});
