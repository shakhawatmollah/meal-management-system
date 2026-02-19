# 🍽️ Meal Management System - Angular Frontend

A complete, modern Angular frontend for Meal Management System with comprehensive features including authentication, CRUD operations, search, pagination, and responsive design.

## 🚀 Features Implemented

### ✅ Authentication System
- **Login Component** with form validation and loading states
- **Register Component** with comprehensive form fields
- **JWT Token Management** with refresh token support
- **Route Guards** for protected routes and admin-only access
- **Role-Based Access** (Admin, Staff, Employee)

### 🍽️ Meal Management
- **Meal List Component** with advanced filtering and search
- **Meal Form Component** for create/edit operations
- **Pagination Support** with configurable page sizes
- **Real-time Search** by name, type, and availability
- **Meal Details** with comprehensive information display

### 📊 Dashboard
- **Statistics Cards** showing key metrics
- **Recent Orders** display
- **Top Meals** analytics
- **Responsive Grid Layout**

### 👥 Employee Management
- **Employee List** with search and filtering
- **Employee Form** for create/edit operations
- **Role Management** and permissions
- **Department Organization**

### 📦 Order Management
- **Order List** with status tracking
- **Order Form** for meal ordering
- **Order History** and analytics
- **Status Updates** (Pending, Confirmed, Prepared, Delivered)

### 👤 User Profile
- **Profile Management** with form validation
- **Password Change** functionality
- **Order History** for individual users

## 🛠️ Technical Implementation

### Frontend Stack
- **Angular 21** with standalone components and functional interceptors
- **Angular Material 21** for modern UI components
- **TypeScript 5.9** for type safety
- **RxJS 7.8** for reactive programming
- **SCSS** for styling with Material Design theming

### Architecture & Quality
- **Clean Architecture** with separation of concerns
- **Feature-based Modules** for better organization
- **API Services** for backend communication
- **Type-safe Models** for data contracts
- **Global Error Handling** with user-friendly notifications
- **Unit Testing** with Jasmine and TestBed
- **Shared Components** for reusability

### Security & Performance
- 🔐 **JWT Authentication** with automatic refresh
- 🛡️ **Route Guards** for protected access
- 📱 **Responsive Design** with mobile-first approach
- 🔍 **Search & Filter** with debouncing
- 📄 **Pagination** for efficient data loading
- ⚡ **Lazy Loading** for optimal performance
- 🎨 **Modern UI** with Material Design components

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── app.component.ts              # Main app component
│   │   ├── app.config.ts               # App configuration & providers
│   │   └── app.routes.ts               # App routing configuration
│   ├── core/
│   │   ├── services/
│   │   │   ├── auth.service.ts          # Consolidated authentication service
│   │   │   └── api/
│   │   │       ├── meal-api.service.ts
│   │   │       ├── order-api.service.ts
│   │   │       ├── employee-api.service.ts
│   │   │       └── dashboard-api.service.ts
│   │   ├── models/
│   │   │   └── api.models.ts           # TypeScript interfaces
│   │   ├── guards/
│   │   │   ├── auth.guard.ts           # Authentication guard
│   │   │   └── admin.guard.ts          # Admin-only guard
│   │   ├── interceptors/
│   │   │   ├── auth.interceptor.ts       # JWT token injection
│   │   │   └── error.interceptor.ts    # HTTP error handling
│   │   └── handlers/
│   │       └── global-error.handler.ts  # Global error handling
│   ├── shared/
│   │   ├── components/
│   │   │   ├── loading-spinner/
│   │   │   │   └── loading-spinner.component.ts
│   │   │   └── confirm-dialog/
│   │   │       └── confirm-dialog.component.ts
│   │   └── services/
│   │       └── dialog.service.ts       # Dialog management
│   └── features/
│       ├── auth/
│       │   └── components/
│       │       ├── login.component.ts
│       │       └── register.component.ts
│       ├── dashboard/
│       │   └── components/
│       │       └── dashboard.component.ts
│       ├── meals/
│       │   └── components/
│       │       ├── meal-list.component.ts
│       │       ├── meal-form.component.ts
│       │       └── meal-detail.component.ts
│       ├── orders/
│       │   └── components/
│       │       ├── order-list.component.ts
│       │       ├── order-form.component.ts
│       │       └── my-orders.component.ts
│       ├── employees/
│       │   └── components/
│       │       ├── employee-list.component.ts
│       │       └── employee-form.component.ts
│       └── profile/
│           └── components/
│               └── profile.component.ts
├── environments/
│   ├── environment.ts                 # Development configuration
│   └── environment.prod.ts          # Production configuration
├── styles.scss                     # Global styles
├── tsconfig.json                   # TypeScript configuration
├── package.json                    # Dependencies and scripts
├── angular.json                    # Angular CLI configuration
└── .gitignore                     # Git ignore patterns
```

## 🎯 Setup Instructions

### Prerequisites
- **Node.js** 18+ and **npm** 9+
- **Angular CLI** 21+
- **Backend API** running on configured port

### Installation & Development
```bash
# Clone the repository
git clone <repository-url>
cd frontend

# Install dependencies
npm install

# Start development server
npm run start
# or
ng serve

# Application will be available at http://localhost:4200
```

### Build for Production
```bash
# Build for production
npm run build
# or
ng build --configuration production

# Output will be in dist/meal-management-frontend/
```

### Testing
```bash
# Run unit tests (watch mode)
npm run test

# Run deterministic CI-style headless tests
npm run test:ci

# Run local headless tests with lighter output
npm run test:local

# Run migration safety checks (lint + development build)
npm run verify:migration

# Run tests with coverage
ng test --code-coverage

# Run end-to-end tests
npm run e2e
```

Note:
- If you see `Error: spawn EPERM` while launching headless browser on Windows, this is an OS/browser process permission issue. Run the terminal with sufficient permissions or allow browser child-process launch in your security policy.
- If you see `EPERM: ... unlink .../dist/...` during production build, close processes locking files in `frontend/dist` and re-run `npm run build`.

### Linting
```bash
# Run linting
npm run lint
# or
ng lint
```

## 🔧 Configuration

### Environment Variables
- **Development**: Uses `http://localhost:8080/api/v1`
- **Production**: Uses `https://api.meal-management.com/api/v1`
- **Debug Mode**: Enabled in development, disabled in production

### Key Configuration Files
- `angular.json`: Angular CLI configuration with build optimizations
- `tsconfig.json`: TypeScript configuration with strict mode
- `environments/`: Environment-specific settings
- `app.config.ts`: Application providers and configuration

## 📱 Backend Integration

The frontend seamlessly integrates with your Spring Boot backend:

### API Communication
- **JWT Authentication** compatible with your token system
- **RESTful API** following your endpoint structure
- **Error Handling** with user-friendly notifications
- **Loading States** for better UX
- **Pagination** for efficient data loading

### Data Models
- **Type-safe interfaces** matching your DTOs
- **Consistent API responses** with `ApiResponse<T>` wrapper
- **Search and filter** parameters for all entities
- **Role-based access** control

## 🎨 UI/UX Features

### Material Design Implementation
- **Modern Components**: Using Angular Material 21
- **Responsive Layout**: Works on all device sizes
- **Dark Mode Support**: Easy on the eyes (configurable)
- **Form Validation**: Real-time feedback with error messages
- **Loading Indicators**: Visual feedback during operations
- **Toast Notifications**: Success/error messages with Material SnackBar

### Accessibility
- **ARIA Labels**: Screen reader support
- **Keyboard Navigation**: Full keyboard accessibility
- **High Contrast**: WCAG compliant color schemes
- **Touch-Friendly**: Large tap targets for mobile

## 🧪 Testing Strategy

### Unit Tests
- **Service Tests**: Authentication, API services, and utilities
- **Component Tests**: All major components with user interactions
- **Mock Services**: Proper mocking for HTTP calls
- **Coverage Reports**: Comprehensive test coverage metrics

### Quality Assurance
- **TypeScript Strict Mode**: Catching errors at compile time
- **ESLint Configuration**: Code quality and consistency
- **Global Error Handler**: Centralized error logging and user feedback
- **Environment Validation**: Proper configuration checks

## 🚀 Deployment

### Production Build
```bash
# Build optimized production bundle
ng build --configuration production

# Features:
- Tree shaking for dead code elimination
- AOT compilation for better performance
- Bundle optimization and minification
- Service worker for PWA capabilities
```

### Environment Setup
1. **Update `environment.prod.ts`** with your production API URL
2. **Configure CORS** on your backend for the frontend domain
3. **Set up HTTPS** for production security
4. **Configure CDN** for static assets if needed

## 🔒 Security Features

### Authentication & Authorization
- **JWT Tokens** with automatic refresh
- **Route Guards** for protected pages
- **Role-Based Access** (Admin, Staff, Employee)
- **Token Storage** in localStorage with security considerations
- **Session Management** with proper logout handling

### Data Protection
- **Input Validation** on all forms
- **XSS Prevention** with Angular's built-in protections
- **CSRF Protection** with Angular's built-in mechanisms
- **Secure Headers** via HTTP interceptors

## 📈 Performance Optimizations

### Bundle Size
- **Lazy Loading** for feature modules
- **Tree Shaking** for unused code elimination
- **Bundle Analysis** with source map support
- **Asset Optimization** for images and fonts

### Runtime Performance
- **OnPush Change Detection** for optimized rendering
- **TrackBy Functions** for efficient list rendering
- **Debounced Search** to reduce API calls
- **Virtual Scrolling** for large lists (if needed)

## 🛠️ Development Workflow

### Code Organization
- **Feature-Based Structure**: Logical grouping of related files
- **Shared Components**: Reusable UI elements
- **Core Services**: Centralized business logic
- **Type Safety**: Comprehensive TypeScript usage

### Best Practices
- **Standalone Components**: Modern Angular 21 patterns
- **Functional Interceptors**: New HTTP interceptor pattern
- **Dependency Injection**: Proper service management
- **Error Boundaries**: Comprehensive error handling

---

## 🎯 Getting Started

1. **Clone and install** the project dependencies
2. **Configure environment** files with your backend URL
3. **Start the development server** with `npm start`
4. **Open your browser** to `http://localhost:4200`
5. **Login with default credentials** and explore the features

This frontend provides a complete, production-ready solution for your meal management system with modern Angular best practices, comprehensive testing, and enterprise-grade architecture.
