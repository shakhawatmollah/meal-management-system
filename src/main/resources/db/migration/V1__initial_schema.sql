-- ========================================
-- Initial schema for Meal Management System
-- Version 1
-- ========================================

-- ==========================
-- 1. Employees
-- ==========================
CREATE TABLE IF NOT EXISTS employees (
                                         id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                         name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    monthly_budget DECIMAL(10,2) NOT NULL DEFAULT 500.00,
    current_month_spent DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    monthly_order_limit INT NOT NULL DEFAULT 30,
    account_non_locked BOOLEAN NOT NULL DEFAULT TRUE,
    failed_login_attempts INT NOT NULL DEFAULT 0,
    lock_time TIMESTAMP NULL,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    INDEX idx_employee_email (email),
    INDEX idx_employee_department (department),
    INDEX idx_employee_status (status),
    INDEX idx_employee_deleted (deleted)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==========================
-- 2. Employee Roles
-- ==========================
CREATE TABLE IF NOT EXISTS employee_roles (
                                              employee_id BIGINT NOT NULL,
                                              role VARCHAR(50) NOT NULL,
    PRIMARY KEY (employee_id, role),
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==========================
-- 3. Meals
-- ==========================
CREATE TABLE IF NOT EXISTS meals (
                                     id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                     name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(20) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    available BOOLEAN NOT NULL DEFAULT TRUE,
    daily_capacity INT NOT NULL DEFAULT 100,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_meal_type (type),
    INDEX idx_meal_available (available)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==========================
-- 4. Audit Logs
-- ==========================
CREATE TABLE IF NOT EXISTS audit_logs (
                                          id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                          entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT NOT NULL,
    action VARCHAR(20) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    old_value TEXT,
    new_value TEXT,
    ip_address VARCHAR(50),
    INDEX idx_audit_entity (entity_type, entity_id),
    INDEX idx_audit_user (user_id),
    INDEX idx_audit_timestamp (timestamp)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==========================
-- 5. Meal Orders
-- ==========================
CREATE TABLE IF NOT EXISTS meal_orders (
                                           id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                           employee_id BIGINT NOT NULL,
                                           meal_id BIGINT NOT NULL,
                                           order_date DATE NOT NULL,
                                           quantity INT NOT NULL DEFAULT 1,
                                           total_price DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (meal_id) REFERENCES meals(id),
    UNIQUE KEY uk_order_unique (employee_id, meal_id, order_date),
    INDEX idx_order_employee (employee_id),
    INDEX idx_order_date (order_date),
    INDEX idx_order_status (status),
    INDEX idx_order_employee_date (employee_id, order_date)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==========================
-- 6. Daily Meal Inventory
-- ==========================
CREATE TABLE IF NOT EXISTS daily_meal_inventory (
                                                    id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                                    meal_id BIGINT NOT NULL,
                                                    date DATE NOT NULL,
                                                    available_quantity INT NOT NULL,
                                                    reserved_quantity INT NOT NULL DEFAULT 0,
                                                    version BIGINT NOT NULL DEFAULT 0,
                                                    FOREIGN KEY (meal_id) REFERENCES meals(id),
    UNIQUE KEY uk_meal_date (meal_id, date),
    INDEX idx_inventory_meal_date (meal_id, date)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==========================
-- 7. Default Admin User
-- ==========================
INSERT INTO employees (name, email, password, department, status, monthly_budget, current_month_spent, monthly_order_limit, account_non_locked, created_at, created_by, updated_by, failed_login_attempts, deleted)
VALUES ('System Admin', 'admin@shakhawatmollah.com',
        '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYq/1MQV8Ei',
        'IT', 'ACTIVE', 500, 50, 30, true, NOW(), 'SYSTEM', 'SYSTEM', 0, false);

INSERT INTO employee_roles (employee_id, role)
VALUES (1, 'ROLE_ADMIN');

-- ==========================
-- 8. Sample Meals
-- ==========================
INSERT INTO meals (name, description, type, price, daily_capacity, available, created_at) VALUES
                                                                                              ('Continental Breakfast', 'Eggs, toast, bacon, coffee', 'BREAKFAST', 8.50, 300, TRUE, NOW()),
                                                                                              ('Chicken Biryani', 'Aromatic rice with tender chicken', 'LUNCH', 12.00,  450, TRUE, NOW()),
                                                                                              ('Vegetable Curry', 'Mixed vegetables in curry sauce', 'LUNCH', 10.00, 580, TRUE, NOW()),
                                                                                              ('Grilled Salmon', 'Salmon with vegetables', 'DINNER', 15.00, 280, TRUE, NOW()),
                                                                                              ('Fresh Fruit Bowl', 'Seasonal fruits', 'SNACK', 5.00, 500, TRUE, NOW());
