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

    // Report-specific queries
    @Query("SELECT COUNT(m) FROM Meal m WHERE m.available = true")
    Long countAvailableMeals();

    @Query("SELECT m.type, COUNT(m.id), COUNT(CASE WHEN m.available = true THEN 1 END) " +
           "FROM Meal m " +
           "GROUP BY m.type")
    List<Object[]> findAvailabilityStatsByType();

    @Query("SELECT m.type, COUNT(m.id) FROM Meal m WHERE m.available = true GROUP BY m.type")
    List<Object[]> findAvailableMealsByTypeStats();

    @Query("SELECT m FROM Meal m " +
           "WHERE (:available IS NULL OR m.available = :available) " +
           "AND (:type IS NULL OR m.type = :type) " +
           "AND (:search IS NULL OR LOWER(m.name) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Meal> findWithFilters(Boolean available, MealType type, String search, Pageable pageable);
}

