package com.shakhawat.meal.repository;

import com.shakhawat.meal.entity.Employee;
import com.shakhawat.meal.entity.EmployeeStatus;
import com.shakhawat.meal.entity.Role;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;
import java.math.BigDecimal;
import java.util.Optional;
import static org.assertj.core.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class EmployeeRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private EmployeeRepository employeeRepository;

    private Employee testEmployee;

    @BeforeEach
    void setUp() {
        testEmployee = Employee.builder()
                .name("John Doe")
                .email("john@example.com")
                .password("$2a$12$encoded_password")
                .department("IT")
                .status(EmployeeStatus.ACTIVE)
                .monthlyBudget(new BigDecimal("500.00"))
                .currentMonthSpent(BigDecimal.ZERO)
                .monthlyOrderLimit(30)
                .build();
        testEmployee.addRole(Role.ROLE_EMPLOYEE);
    }

    @Test
    @Order(1)
    @DisplayName("Should save employee successfully")
    void shouldSaveEmployee() {
        // When
        Employee saved = employeeRepository.save(testEmployee);
        entityManager.flush();

        // Then
        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getName()).isEqualTo("John Doe");
        assertThat(saved.getEmail()).isEqualTo("john@example.com");
        assertThat(saved.getCreatedAt()).isNotNull();
        assertThat(saved.getVersion()).isEqualTo(0L);
        assertThat(saved.getDeleted()).isFalse();
    }

    @Test
    @Order(2)
    @DisplayName("Should find employee by email")
    void shouldFindEmployeeByEmail() {
        // Given
        entityManager.persistAndFlush(testEmployee);

        // When
        Optional<Employee> found = employeeRepository.findByEmail("john@example.com");

        // Then
        assertThat(found).isPresent();
        assertThat(found.get().getName()).isEqualTo("John Doe");
        assertThat(found.get().getDepartment()).isEqualTo("IT");
    }

    @Test
    @Order(3)
    @DisplayName("Should return empty when email not found")
    void shouldReturnEmptyWhenEmailNotFound() {
        // When
        Optional<Employee> found = employeeRepository.findByEmail("nonexistent@example.com");

        // Then
        assertThat(found).isEmpty();
    }

    @Test
    @Order(4)
    @DisplayName("Should check if email exists")
    void shouldCheckIfEmailExists() {
        // Given
        entityManager.persistAndFlush(testEmployee);

        // When & Then
        assertThat(employeeRepository.existsByEmail("john@example.com")).isTrue();
        assertThat(employeeRepository.existsByEmail("nonexistent@example.com")).isFalse();
    }

    @Test
    @Order(5)
    @DisplayName("Should enforce unique email constraint")
    void shouldEnforceUniqueEmailConstraint() {
        // Given
        entityManager.persistAndFlush(testEmployee);

        Employee duplicate = Employee.builder()
                .name("Jane Doe")
                .email("john@example.com") // Same email
                .password("password")
                .department("HR")
                .status(EmployeeStatus.ACTIVE)
                .build();

        // When & Then
        assertThatThrownBy(() -> {
            employeeRepository.save(duplicate);
            entityManager.flush();
        }).hasMessageContaining("constraint");
    }

    @Test
    @Order(6)
    @DisplayName("Should perform soft delete")
    void shouldPerformSoftDelete() {
        // Given
        Employee saved = entityManager.persistAndFlush(testEmployee);
        Long employeeId = saved.getId();

        // When
        employeeRepository.deleteById(employeeId);
        entityManager.flush();
        entityManager.clear();

        // Then
        Optional<Employee> found = employeeRepository.findById(employeeId);
        assertThat(found).isEmpty(); // Soft deleted, so not found in normal queries

        // Verify it's marked as deleted in database
        Employee deleted = entityManager.find(Employee.class, employeeId);
        assertThat(deleted).isNull(); // Due to @Where(clause = "deleted = false")
    }

    @Test
    @Order(7)
    @DisplayName("Should save employee roles")
    void shouldSaveEmployeeRoles() {
        // Given
        testEmployee.addRole(Role.ROLE_ADMIN);

        // When
        Employee saved = entityManager.persistAndFlush(testEmployee);
        entityManager.clear();

        // Then
        Employee found = entityManager.find(Employee.class, saved.getId());
        assertThat(found.getRoles()).containsExactlyInAnyOrder(Role.ROLE_EMPLOYEE, Role.ROLE_ADMIN);
    }

    @Test
    @Order(8)
    @DisplayName("Should handle optimistic locking")
    void shouldHandleOptimisticLocking() {
        // Given
        Employee saved = entityManager.persistAndFlush(testEmployee);
        entityManager.clear();

        // When - Simulate concurrent updates
        Employee employee1 = entityManager.find(Employee.class, saved.getId());
        Employee employee2 = entityManager.find(Employee.class, saved.getId());

        employee1.setName("Updated Name 1");
        entityManager.flush();

        employee2.setName("Updated Name 2");

        // Then
        assertThatThrownBy(() -> entityManager.flush())
                .isInstanceOf(jakarta.persistence.OptimisticLockException.class);
    }
}
