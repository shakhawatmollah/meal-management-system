package com.shakhawat.meal.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "meal_orders",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_order_unique",
                columnNames = {"employee_id", "meal_id", "order_date"}
        ),
        indexes = {
                @Index(name = "idx_order_employee", columnList = "employee_id"),
                @Index(name = "idx_order_date", columnList = "order_date"),
                @Index(name = "idx_order_status", columnList = "status"),
                @Index(name = "idx_order_employee_date", columnList = "employee_id, order_date")
        }
)
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MealOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    @NotNull(message = "Employee is required")
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meal_id", nullable = false)
    @NotNull(message = "Meal is required")
    private Meal meal;

    @NotNull(message = "Order date is required")
    @Column(name = "order_date", nullable = false)
    private LocalDate orderDate;

    @Min(1)
    @Column(nullable = false)
    @Builder.Default
    private Integer quantity = 1;

    @NotNull
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalPrice;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private OrderStatus status = OrderStatus.PENDING;

    @Version
    private Long version;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (totalPrice == null && meal != null) {
            totalPrice = meal.getPrice().multiply(BigDecimal.valueOf(quantity));
        }
    }
}
