# Meal Management Reports API - Postman Collection

## Overview
This collection contains 5 management report APIs for the Meal Management System. All APIs require JWT authentication and role-based access control.

## Setup Instructions

### 1. Import Collection
1. Open Postman
2. Click "Import" → "Select Files"
3. Choose `meal-management-reports-collection.json`
4. The collection will be imported with all 5 endpoints

### 2. Configure Environment Variables
Set the following environment variables in Postman:
- `base_url`: `http://localhost:8080/api/v1` (default)
- `jwt_token`: Your JWT token obtained from login

### 3. Authentication
All endpoints use Bearer Token authentication. The collection is pre-configured to use the `{{jwt_token}}` variable.

## API Endpoints

### 1. Daily Operations Report
**Endpoint**: `GET /api/v1/reports/daily/{date}`  
**Required Roles**: ADMIN, CAFETERIA_STAFF  
**Request Parameters**:
- `date` (path): Date in format `yyyy-MM-dd`  
**Example URL**: `{{base_url}}/reports/daily/2026-01-15`

**Response Structure**:
```json
{
  "success": true,
  "message": "Daily report generated successfully",
  "data": {
    "reportDate": "2026-01-15",
    "totalOrders": 150,
    "uniqueEmployees": 45,
    "totalMealsAvailable": 200,
    "dailyRevenue": 750.00,
    "avgOrderValue": 5.00,
    "peakHour": "12:00",
    "budgetUtilizationRate": 85.5,
    "mealTypeBreakdown": [
      {
        "mealType": "LUNCH",
        "orderCount": 80,
        "revenue": 400.00,
        "percentage": 53.3
      }
    ],
    "hourlyBreakdown": [
      {
        "hour": 12,
        "orderCount": 45,
        "revenue": 225.00
      }
    ]
  }
}
```

### 2. Monthly Financial Report
**Endpoint**: `GET /api/v1/reports/monthly/{year}/{month}`  
**Required Roles**: ADMIN, CAFETERIA_STAFF  
**Request Parameters**:
- `year` (path): Year (e.g., 2026)
- `month` (path): Month number (1-12)  
**Example URL**: `{{base_url}}/reports/monthly/2026/1`

**Response Structure**:
```json
{
  "success": true,
  "message": "Monthly report generated successfully",
  "data": {
    "reportPeriod": "2026-01-31",
    "monthlyRevenue": 15000.00,
    "totalBudget": 20000.00,
    "totalSpent": 16500.00,
    "budgetVariance": 3500.00,
    "budgetUtilizationRate": 82.5,
    "departmentBreakdown": [
      {
        "department": "IT",
        "orderCount": 300,
        "revenue": 1500.00,
        "uniqueEmployees": 25,
        "percentageOfTotal": 10.0
      }
    ],
    "mealPerformance": [
      {
        "mealName": "Chicken Biryani",
        "mealType": "LUNCH",
        "unitPrice": 8.00,
        "timesOrdered": 150,
        "totalRevenue": 1200.00,
        "avgOrderValue": 8.00
      }
    ],
    "employeeBudgetAnalysis": [
      {
        "employeeName": "John Doe",
        "department": "IT",
        "monthlyBudget": 200.00,
        "currentSpent": 180.00,
        "remainingBudget": 20.00,
        "utilizationPercentage": 90.0,
        "status": "ON_TRACK"
      }
    ]
  }
}
```

### 3. Employee Performance Report
**Endpoint**: `GET /api/v1/reports/employee-performance/{year}/{month}`  
**Required Roles**: ADMIN  
**Request Parameters**:
- `year` (path): Year (e.g., 2026)
- `month` (path): Month number (1-12)  
**Example URL**: `{{base_url}}/reports/employee-performance/2026/1`

**Response Structure**:
```json
{
  "success": true,
  "message": "Employee performance report generated successfully",
  "data": {
    "reportPeriod": "2026-01-31",
    "employeeStats": [
      {
        "employeeName": "John Doe",
        "department": "IT",
        "monthlyBudget": 200.00,
        "currentSpent": 180.00,
        "totalOrders": 22,
        "avgOrderValue": 8.18,
        "lastOrderDate": "2026-01-30",
        "mostOrderedMeal": "Chicken Biryani",
        "timesOrdered": 8,
        "utilizationPercentage": 90.0
      }
    ],
    "departmentStats": [
      {
        "department": "IT",
        "totalEmployees": 25,
        "activeEmployees": 22,
        "totalBudget": 5000.00,
        "totalSpent": 4200.00,
        "utilizationRate": 84.0,
        "totalOrders": 550
      }
    ],
    "budgetAnalysis": [
      {
        "category": "ON_TRACK",
        "employeeCount": 18,
        "totalBudget": 3600.00,
        "totalSpent": 3240.00,
        "percentageOfEmployees": 72.0
      }
    ],
    "topPerformers": [...],
    "budgetOverruns": [...]
  }
}
```

### 4. Meal Performance Report
**Endpoint**: `GET /api/v1/reports/meal-performance/{year}/{month}`  
**Required Roles**: ADMIN, CAFETERIA_STAFF  
**Request Parameters**:
- `year` (path): Year (e.g., 2026)
- `month` (path): Month number (1-12)  
**Example URL**: `{{base_url}}/reports/meal-performance/2026/1`

**Response Structure**:
```json
{
  "success": true,
  "message": "Meal performance report generated successfully",
  "data": {
    "reportPeriod": "2026-01-31",
    "mealPerformance": [
      {
        "mealName": "Chicken Biryani",
        "mealType": "LUNCH",
        "unitPrice": 8.00,
        "timesOrdered": 150,
        "totalQuantity": 150,
        "totalRevenue": 1200.00,
        "avgOrderValue": 8.00,
        "currentlyAvailable": true
      }
    ],
    "mealTypeBreakdown": [
      {
        "mealType": "LUNCH",
        "uniqueMeals": 15,
        "totalOrders": 800,
        "totalRevenue": 6400.00,
        "avgOrderValue": 8.00,
        "percentageOfTotalRevenue": 42.7
      }
    ],
    "availabilityAnalysis": [
      {
        "mealType": "LUNCH",
        "totalMeals": 20,
        "availableMeals": 18,
        "unavailableMeals": 2,
        "availabilityPercentage": 90.0
      }
    ],
    "topMeals": [...],
    "leastPopularMeals": [...],
    "revenueByMealType": [
      {
        "mealType": "LUNCH",
        "revenue": 6400.00,
        "percentageOfTotal": 42.7
      }
    ]
  }
}
```

### 5. Audit Report
**Endpoint**: `GET /api/v1/reports/audit/{startDate}/{endDate}`  
**Required Roles**: ADMIN  
**Request Parameters**:
- `startDate` (path): Start date in format `yyyy-MM-dd`
- `endDate` (path): End date in format `yyyy-MM-dd`  
**Example URL**: `{{base_url}}/reports/audit/2026-01-01/2026-01-31`

**Response Structure**:
```json
{
  "success": true,
  "message": "Audit report generated successfully",
  "data": {
    "startDate": "2026-01-01",
    "endDate": "2026-01-31",
    "totalActions": 1250,
    "actionBreakdown": [
      {
        "action": "CREATE_ORDER",
        "actionCount": 450,
        "percentageOfTotal": 36.0,
        "firstAction": "2026-01-01T09:00:00",
        "lastAction": "2026-01-31T17:30:00"
      }
    ],
    "userActivity": [
      {
        "userId": "john.doe",
        "actionCount": 25,
        "actionsPerformed": ["CREATE_ORDER", "CANCEL_ORDER"],
        "lastActivity": "2026-01-30T14:20:00",
        "mostFrequentAction": "CREATE_ORDER"
      }
    ],
    "entityActivity": {
      "MealOrder": 450,
      "Meal": 120,
      "Employee": 80,
      "User": 600
    },
    "suspiciousActivity": [
      {
        "userId": "user123",
        "action": "CREATE_ORDER",
        "timestamp": "2026-01-15T03:30:00",
        "entityType": "MealOrder",
        "reason": "Unusual activity time",
        "ipAddress": "192.168.1.100"
      }
    ]
  }
}
```

## Error Responses
All APIs return errors in the following format:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

### Common HTTP Status Codes
- `200 OK`: Request successful
- `400 Bad Request`: Invalid parameters
- `401 Unauthorized`: Invalid or missing JWT token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

## Testing Tips
1. **Authentication**: Ensure you have a valid JWT token before testing
2. **Date Formats**: Use `yyyy-MM-dd` for date parameters
3. **Role Testing**: Test with different user roles to verify access control
4. **Response Validation**: Use Postman's built-in JSON schema validation
5. **Performance Testing**: Use Postman's Collection Runner for load testing

## Environment Files
You can create separate environment files for different deployment stages:
- `local.json`: For local development
- `staging.json`: For staging environment  
- `production.json`: For production environment

Example environment file:
```json
{
  "base_url": "http://localhost:8080/api/v1",
  "jwt_token": "your-jwt-token-here"
}
```
