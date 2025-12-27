package com.shakhawat.meal.repository;

import com.shakhawat.meal.entity.MealOrder;
import com.shakhawat.meal.entity.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface MealOrderRepository extends JpaRepository<MealOrder, Long> {

    @Query("SELECT mo FROM MealOrder mo " +
            "JOIN FETCH mo.employee " +
            "JOIN FETCH mo.meal " +
            "WHERE mo.employee.id = :employeeId")
    List<MealOrder> findByEmployeeIdWithDetails(@Param("employeeId") Long employeeId);

    @Query("SELECT mo FROM MealOrder mo " +
            "JOIN FETCH mo.employee " +
            "JOIN FETCH mo.meal " +
            "WHERE mo.orderDate = :date")
    List<MealOrder> findByOrderDateWithDetails(@Param("date") LocalDate date);

    Page<MealOrder> findByEmployeeId(Long employeeId, Pageable pageable);
    Page<MealOrder> findByOrderDate(LocalDate orderDate, Pageable pageable);

    @Query("SELECT mo FROM MealOrder mo " +
            "JOIN FETCH mo.employee " +
            "JOIN FETCH mo.meal " +
            "WHERE mo.orderDate BETWEEN :startDate AND :endDate")
    List<MealOrder> findOrdersBetweenDates(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    boolean existsByEmployeeIdAndMealIdAndOrderDate(Long employeeId, Long mealId, LocalDate orderDate);

    @Query("SELECT COUNT(mo) FROM MealOrder mo " +
            "WHERE mo.employee.id = :employeeId " +
            "AND YEAR(mo.orderDate) = :year " +
            "AND MONTH(mo.orderDate) = :month")
    long countByEmployeeIdAndMonth(
            @Param("employeeId") Long employeeId,
            @Param("year") int year,
            @Param("month") int month);

    long countByStatus(OrderStatus status);
}
