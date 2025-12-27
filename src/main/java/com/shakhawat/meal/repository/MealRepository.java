package com.shakhawat.meal.repository;

import com.shakhawat.meal.entity.Meal;
import com.shakhawat.meal.entity.MealType;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MealRepository extends JpaRepository<Meal, Long> {

    Page<Meal> findByType(MealType type, Pageable pageable);

    @Cacheable(value = "meals", key = "'available'")
    List<Meal> findByAvailableTrue();

    Page<Meal> findByAvailableTrue(Pageable pageable);

    @Query("SELECT m FROM Meal m WHERE m.type = :type AND m.available = true")
    List<Meal> findAvailableMealsByType(MealType type);
}

