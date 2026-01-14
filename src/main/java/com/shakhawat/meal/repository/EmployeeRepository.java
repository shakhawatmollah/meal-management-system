package com.shakhawat.meal.repository;

import com.shakhawat.meal.entity.Employee;
import com.shakhawat.meal.entity.EmployeeStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long>, JpaSpecificationExecutor<Employee> {

    Optional<Employee> findByEmail(String email);
    boolean existsByEmail(String email);
    Page<Employee> findByStatus(EmployeeStatus status, Pageable pageable);
    Page<Employee> findByDepartment(String department, Pageable pageable);

    @Query("SELECT e FROM Employee e WHERE e.email = :email AND e.deleted = false")
    Optional<Employee> findByEmailIncludingDeleted(@Param("email") String email);

    @Modifying
    @Query("UPDATE Employee e SET e.currentMonthSpent = 0 WHERE e.deleted = false")
    int resetAllMonthlyBudgets();

    // Report-specific queries
    @Query("SELECT SUM(e.monthlyBudget), SUM(e.currentMonthSpent) FROM Employee e " +
           "WHERE e.deleted = false")
    Object[] findTotalBudgetUtilization();

    @Query("SELECT e.department, COUNT(e.id), SUM(e.monthlyBudget), SUM(e.currentMonthSpent) " +
           "FROM Employee e " +
           "WHERE e.deleted = false " +
           "GROUP BY e.department " +
           "ORDER BY SUM(e.currentMonthSpent) DESC")
    List<Object[]> findDepartmentBudgetAnalysis();

    @Query("SELECT COUNT(e.id) FROM Employee e WHERE e.deleted = false AND e.status = 'ACTIVE'")
    Long countActiveEmployees();

    @Query("SELECT e.department, COUNT(e.id) FROM Employee e " +
           "WHERE e.deleted = false AND e.status = 'ACTIVE' " +
           "GROUP BY e.department")
    List<Object[]> findActiveEmployeesByDepartment();
}
