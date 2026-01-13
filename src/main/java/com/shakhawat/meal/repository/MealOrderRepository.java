package com.shakhawat.meal.repository;

import com.shakhawat.meal.entity.Employee;
import com.shakhawat.meal.entity.MealOrder;
import com.shakhawat.meal.entity.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
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

    MealOrder findByEmployee(Employee employee);

    long countByOrderDate(LocalDate orderDate);

    // Report-specific queries
    @Query("SELECT COUNT(DISTINCT mo.employee.id) FROM MealOrder mo " +
           "WHERE DATE(mo.orderDate) = :date")
    Long countDistinctEmployeesByDate(@Param("date") LocalDate date);

    @Query("SELECT SUM(mo.totalPrice), COUNT(mo.id) FROM MealOrder mo " +
            "WHERE DATE(mo.orderDate) = :date")
    Object calculateDailyRevenue(@Param("date") LocalDate date);

    @Query("SELECT HOUR(mo.createdAt), COUNT(mo.id), SUM(mo.totalPrice) FROM MealOrder mo " +
           "WHERE DATE(mo.orderDate) = :date " +
           "GROUP BY HOUR(mo.createdAt) " +
           "ORDER BY COUNT(mo.id) DESC")
    List<Object[]> findHourlyOrderBreakdown(@Param("date") LocalDate date);

    @Query("SELECT m.type, COUNT(mo.id), SUM(mo.totalPrice) FROM MealOrder mo " +
           "JOIN mo.meal m " +
           "WHERE DATE(mo.orderDate) = :date " +
           "GROUP BY m.type " +
           "ORDER BY COUNT(mo.id) DESC")
    List<Object[]> findMealTypeBreakdown(@Param("date") LocalDate date);

    @Query("SELECT e.department, COUNT(mo.id), SUM(mo.totalPrice), COUNT(DISTINCT mo.employee.id) " +
           "FROM MealOrder mo " +
           "JOIN mo.employee e " +
           "WHERE mo.orderDate BETWEEN :startDate AND :endDate " +
           "GROUP BY e.department " +
           "ORDER BY SUM(mo.totalPrice) DESC")
    List<Object[]> findMonthlyRevenueByDepartment(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT e.name, e.department, COUNT(mo.id), SUM(mo.totalPrice), AVG(mo.totalPrice), MAX(mo.orderDate) " +
           "FROM MealOrder mo " +
           "JOIN mo.employee e " +
           "WHERE mo.orderDate BETWEEN :startDate AND :endDate " +
           "GROUP BY e.id, e.name, e.department " +
           "ORDER BY SUM(mo.totalPrice) DESC")
    List<Object[]> findEmployeePerformanceByMonth(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT m.name, m.type, m.price, COUNT(mo.id), SUM(mo.totalPrice), AVG(mo.totalPrice), m.available " +
           "FROM MealOrder mo " +
           "JOIN mo.meal m " +
           "WHERE mo.orderDate BETWEEN :startDate AND :endDate " +
           "GROUP BY m.id, m.name, m.type, m.price, m.available " +
           "ORDER BY SUM(mo.totalPrice) DESC")
    List<Object[]> findMealPerformanceByMonth(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT m.type, COUNT(DISTINCT m.id), COUNT(mo.id), SUM(mo.totalPrice), AVG(mo.totalPrice) " +
           "FROM MealOrder mo " +
           "JOIN mo.meal m " +
           "WHERE mo.orderDate BETWEEN :startDate AND :endDate " +
           "GROUP BY m.type " +
           "ORDER BY SUM(mo.totalPrice) DESC")
    List<Object[]> findMealTypePerformanceByMonth(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT e.name, e.department, e.monthlyBudget, e.currentMonthSpent, " +
           "COUNT(mo.id), SUM(mo.totalPrice), AVG(mo.totalPrice), MAX(mo.orderDate) " +
           "FROM Employee e " +
           "LEFT JOIN MealOrder mo ON e.id = mo.employee.id " +
           "WHERE YEAR(mo.orderDate) = :year AND MONTH(mo.orderDate) = :month " +
           "GROUP BY e.id, e.name, e.department " +
           "ORDER BY SUM(mo.totalPrice) DESC")
    List<Object[]> findEmployeeBudgetAnalysisByMonth(
            @Param("year") Integer year,
            @Param("month") Integer month);
}
