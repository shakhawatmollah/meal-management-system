package com.shakhawat.meal.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "daily_meal_inventory",
        uniqueConstraints = @UniqueConstraint(
                columnNames = {"meal_id", "date"}
        ),
        indexes = {
                @Index(name = "idx_inventory_meal_date", columnList = "meal_id, date")
        }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyMealInventory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meal_id", nullable = false)
    private Meal meal;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private Integer availableQuantity;

    @Column(nullable = false)
    @Builder.Default
    private Integer reservedQuantity = 0;

    @Version
    private Long version;
}
