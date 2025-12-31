CREATE TABLE refresh_tokens (
                                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                employee_id BIGINT NOT NULL,
                                token VARCHAR(500) NOT NULL UNIQUE,
                                expiry_date TIMESTAMP NOT NULL,
                                revoked BOOLEAN NOT NULL DEFAULT FALSE,
                                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
                                INDEX idx_refresh_token (token),
                                INDEX idx_employee_id (employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
