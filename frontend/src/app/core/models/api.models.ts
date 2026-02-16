export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: PageMetadata;
}

export interface PageMetadata {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// Auth Interfaces
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  id: number;
  email: string;
  name: string;
  roles: string[];
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  department: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface LogoutRequest {
  refreshToken: string;
}

// Employee Interfaces
export interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  status: 'ACTIVE' | 'INACTIVE';
  monthlyBudget: number;
  currentMonthSpent: number;
  monthlyOrderLimit: number;
  roles: string[];
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeRequest {
  name: string;
  email: string;
  password?: string;
  department: string;
  monthlyBudget?: number;
  monthlyOrderLimit?: number;
  roles?: string[];
}

// Meal Interfaces
export interface Meal {
  id: number;
  name: string;
  description: string;
  type: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
  price: number;
  available: boolean;
  dailyCapacity: number;
  createdAt: string;
  updatedAt: string;
}

export interface MealRequest {
  name: string;
  description: string;
  type: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
  price: number;
  available: boolean;
  dailyCapacity: number;
}

// Order Interfaces
export interface MealOrder {
  id: number;
  employeeId: number;
  employeeName: string;
  mealId: number;
  mealName: string;
  orderDate: string;
  quantity: number;
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'PREPARED' | 'DELIVERED' | 'CANCELLED';
}

export interface DashboardRecentOrder {
  id: number;
  employee: {
    id: number;
    name: string;
  };
  meal: {
    id: number;
    name: string;
  };
  orderDate: string;
  quantity: number;
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'PREPARED' | 'DELIVERED' | 'CANCELLED';
}

export interface MealOrderRequest {
  employeeId: number;
  mealId: number;
  orderDate: string;
  quantity: number;
}

// Dashboard Interfaces
export interface DashboardStats {
  totalOrders: number;
  totalMeals: number;
  totalEmployees: number;
  todayOrders: number;
  monthlyRevenue: number;
  topMeals: MealStats[];
  recentOrders: DashboardRecentOrder[];
}

export interface MealStats {
  mealId: number;
  mealName: string;
  orderCount: number;
  totalRevenue: number;
}

// Search and Filter Interfaces
export interface SearchParams {
  page?: number;
  size?: number;
  sort?: string;
  direction?: 'ASC' | 'DESC';
  search?: string;
  available?: boolean;
  type?: string;
  status?: string;
  department?: string;
  dateFrom?: string;
  dateTo?: string;
}
