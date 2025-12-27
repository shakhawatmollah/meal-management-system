package com.shakhawat.meal.repository;

import com.shakhawat.meal.entity.DailyMealInventory;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<DailyMealInventory, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT i FROM DailyMealInventory i WHERE i.meal.id = :mealId AND i.date = :date")
    Optional<DailyMealInventory> findByMealIdAndDateWithLock(
            @Param("mealId") Long mealId,
            @Param("date") LocalDate date);

    Optional<DailyMealInventory> findByMealIdAndDate(Long mealId, LocalDate date);
}

