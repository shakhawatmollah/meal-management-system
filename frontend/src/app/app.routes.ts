import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

// Auth Components
import { LoginComponent } from './features/auth/components/login/login.component';
import { RegisterComponent } from './features/auth/components/register/register.component';

// Dashboard
import { DashboardComponent } from './features/dashboard/components/dashboard/dashboard.component';

// Meal Components
import { MealListComponent } from './features/meals/components/meal-list/meal-list.component';
import { MealDetailComponent } from './features/meals/components/meal-detail/meal-detail.component';
import { MealFormComponent } from './features/meals/components/meal-form/meal-form.component';

// Order Components
import { OrderListComponent } from './features/orders/index';
import { OrderFormComponent } from './features/orders/index';
import { MyOrdersComponent } from './features/orders/index';

// Employee Components (Admin only)
import { EmployeeListComponent } from './features/employees/index';
import { EmployeeFormComponent } from './features/employees/index';

// Profile Component
import { ProfileComponent } from './features/profile/index';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  
  {
    path: 'meals',
    component: MealListComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'meals/new',
    component: MealFormComponent,
    canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: 'meals/:id',
    component: MealDetailComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'meals/:id/edit',
    component: MealFormComponent,
    canActivate: [AuthGuard, AdminGuard]
  },
  
  {
    path: 'orders',
    component: OrderListComponent,
    canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: 'orders/new',
    component: OrderFormComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'my-orders',
    component: MyOrdersComponent,
    canActivate: [AuthGuard]
  },
  
  {
    path: 'employees',
    component: EmployeeListComponent,
    canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: 'employees/new',
    component: EmployeeFormComponent,
    canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: 'employees/:id/edit',
    component: EmployeeFormComponent,
    canActivate: [AuthGuard, AdminGuard]
  },
  
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard]
  },
  
  { path: '**', redirectTo: '/dashboard' }
];
