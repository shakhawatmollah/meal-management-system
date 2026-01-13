package com.shakhawat.meal.repository;

import com.shakhawat.meal.entity.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import static org.assertj.core.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
class MealOrderRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private MealOrderRepository orderRepository;

    private Employee employee;
    private Meal meal;

    @BeforeEach
    void setUp() {
        employee = Employee.builder()
                .name("Test User")
                .email("test@example.com")
                .password("password")
                .department("IT")
                .status(EmployeeStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .build();
        entityManager.persist(employee);

        meal = Meal.builder()
                .name("Test Meal")
                .description("Test Description")
                .type(MealType.LUNCH)
                .price(new BigDecimal("10.00"))
                .available(true)
                .createdAt(LocalDateTime.now())
                .build();
        entityManager.persist(meal);

        entityManager.flush();
    }

    @Test
    @DisplayName("Should find orders by employee ID with details")
    void shouldFindOrdersByEmployeeIdWithDetails() {
        // Given
        MealOrder order = MealOrder.builder()
                .employee(employee)
                .meal(meal)
                .orderDate(LocalDate.now().plusDays(1))
                .quantity(1)
                .totalPrice(new BigDecimal("10.00"))
                .status(OrderStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();
        entityManager.persist(order);
        entityManager.flush();
        entityManager.clear();

        // When
        List<MealOrder> orders = orderRepository.findByEmployeeIdWithDetails(employee.getId());

        // Then
        assertThat(orders).hasSize(1);
        assertThat(orders.getFirst().getEmployee().getName()).isEqualTo("Test User");
        assertThat(orders.getFirst().getMeal().getName()).isEqualTo("Test Meal");
    }

    @Test
    @DisplayName("Should find orders by date with details")
    void shouldFindOrdersByDateWithDetails() {
        // Given
        LocalDate orderDate = LocalDate.now().plusDays(1);
        MealOrder order = MealOrder.builder()
                .employee(employee)
                .meal(meal)
                .orderDate(orderDate)
                .quantity(2)
                .totalPrice(new BigDecimal("20.00"))
                .status(OrderStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();
        entityManager.persist(order);
        entityManager.flush();

        // When
        List<MealOrder> orders = orderRepository.findByOrderDateWithDetails(orderDate);

        // Then
        assertThat(orders).hasSize(1);
        assertThat(orders.getFirst().getQuantity()).isEqualTo(2);
    }

    @Test
    @DisplayName("Should prevent duplicate orders")
    void shouldPreventDuplicateOrders() {
        // Given: Create employee and meal
        Employee employee = Employee.builder()
                .name("John Doe")
                .email("john@company.com")
                .password("password123")
                .department("IT")
                .status(EmployeeStatus.ACTIVE)
                .monthlyBudget(new BigDecimal("500.00"))
                .monthlyOrderLimit(30)
                .createdAt(LocalDateTime.now())
                .build();
        entityManager.persist(employee);

        Meal meal = Meal.builder()
                .name("Chicken Biryani")
                .description("Delicious biryani")
                .type(MealType.LUNCH)
                .price(new BigDecimal("12.50"))
                .available(true)
                .dailyCapacity(100)
                .createdAt(LocalDateTime.now())
                .build();
        entityManager.persist(meal);

        LocalDate orderDate = LocalDate.now().plusDays(1);

        // First order
        MealOrder firstOrder = MealOrder.builder()
                .employee(employee)
                .meal(meal)
                .orderDate(orderDate)
                .quantity(2)
                .totalPrice(new BigDecimal("25.00"))
                .status(OrderStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();
        entityManager.persist(firstOrder);
        entityManager.flush();

        // When: Try to create duplicate order
        MealOrder duplicateOrder = MealOrder.builder()
                .employee(employee)
                .meal(meal)
                .orderDate(orderDate) // Same date
                .quantity(1)
                .totalPrice(new BigDecimal("12.50"))
                .status(OrderStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();

        // Then: TestEntityManager throws Hibernate's ConstraintViolationException directly
        assertThatThrownBy(() -> {
            entityManager.persist(duplicateOrder);
            entityManager.flush();
        })
                .isInstanceOf(org.hibernate.exception.ConstraintViolationException.class)
                .hasMessageContaining("UK_ORDER_UNIQUE_INDEX");
    }

    @Test
    @DisplayName("Should check if order exists")
    void shouldCheckIfOrderExists() {
        // Given
        LocalDate orderDate = LocalDate.now().plusDays(1);
        MealOrder order = MealOrder.builder()
                .employee(employee)
                .meal(meal)
                .orderDate(orderDate)
                .quantity(1)
                .totalPrice(new BigDecimal("10.00"))
                .status(OrderStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();
        entityManager.persist(order);
        entityManager.flush();

        // When & Then
        assertThat(orderRepository.existsByEmployeeIdAndMealIdAndOrderDate(
                employee.getId(), meal.getId(), orderDate)).isTrue();

        assertThat(orderRepository.existsByEmployeeIdAndMealIdAndOrderDate(
                employee.getId(), meal.getId(), orderDate.plusDays(1))).isFalse();
    }

    @Test
    @DisplayName("Should count orders by employee and month")
    void shouldCountOrdersByEmployeeAndMonth() {
        // Given - Create orders for current month
        LocalDate today = LocalDate.now();
        LocalDate orderDate = today.withDayOfMonth(1);
        for (int i = 1; i <= 3; i++) {
            MealOrder order = MealOrder.builder()
                    .employee(employee)
                    .meal(meal)
                    .orderDate(orderDate.plusDays(i))
                    .quantity(1)
                    .totalPrice(new BigDecimal("10.00"))
                    .status(OrderStatus.PENDING)
                    .createdAt(LocalDateTime.now())
                    .build();
            entityManager.persist(order);
        }
        entityManager.flush();

        // When
        long count = orderRepository.countByEmployeeIdAndMonth(
                employee.getId(), today.getYear(), today.getMonthValue());

        // Then
        assertThat(count).isEqualTo(3);
    }

    @Test
    @DisplayName("Should find orders between dates")
    void shouldFindOrdersBetweenDates() {
        // Given
        LocalDate start = LocalDate.now().plusDays(1);
        LocalDate end = LocalDate.now().plusDays(5);

        MealOrder order1 = MealOrder.builder()
                .employee(employee)
                .meal(meal)
                .orderDate(start)
                .quantity(1)
                .totalPrice(new BigDecimal("10.00"))
                .status(OrderStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();

        MealOrder order2 = MealOrder.builder()
                .employee(employee)
                .meal(meal)
                .orderDate(end)
                .quantity(1)
                .totalPrice(new BigDecimal("10.00"))
                .status(OrderStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();

        entityManager.persist(order1);
        entityManager.persist(order2);
        entityManager.flush();

        // When
        List<MealOrder> orders = orderRepository.findOrdersBetweenDates(start, end);

        // Then
        assertThat(orders).hasSize(2);
    }

    @Test
    @DisplayName("Should ")
    void shouldPreventDuplicateOrders_AlternativeAssertion() {
        // Given: Setup data
        Employee employee = Employee.builder()
                .name("Jane Smith")
                .email("jane@company.com")
                .password("password123")
                .department("HR")
                .status(EmployeeStatus.ACTIVE)
                .monthlyBudget(new BigDecimal("500.00"))
                .monthlyOrderLimit(30)
                .createdAt(LocalDateTime.now())
                .build();
        entityManager.persist(employee);

        Meal meal = Meal.builder()
                .name("Vegetable Curry")
                .description("Tasty curry")
                .type(MealType.LUNCH)
                .price(new BigDecimal("10.00"))
                .available(true)
                .dailyCapacity(100)
                .createdAt(LocalDateTime.now())
                .build();
        entityManager.persist(meal);

        LocalDate orderDate = LocalDate.of(2026, 1, 1);

        MealOrder firstOrder = MealOrder.builder()
                .employee(employee)
                .meal(meal)
                .orderDate(orderDate)
                .quantity(1)
                .totalPrice(new BigDecimal("10.00"))
                .status(OrderStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();
        entityManager.persist(firstOrder);
        entityManager.flush();

        MealOrder duplicateOrder = MealOrder.builder()
                .employee(employee)
                .meal(meal)
                .orderDate(orderDate)
                .quantity(2)
                .totalPrice(new BigDecimal("20.00"))
                .status(OrderStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();

        // Then - Expect Hibernate DB-level constraint violation
        assertThatThrownBy(() -> {
            entityManager.persist(duplicateOrder);
            entityManager.flush();
        }).isInstanceOf(org.hibernate.exception.ConstraintViolationException.class)
                .hasMessageContaining("UK_ORDER_UNIQUE_INDEX");
    }

    @Test
    void shouldAllowOrdersForDifferentDates() {
        // Given: Create employee and meal
        Employee employee = Employee.builder()
                .name("Test User")
                .email("test@company.com")
                .password("password123")
                .department("Engineering")
                .status(EmployeeStatus.ACTIVE)
                .monthlyBudget(new BigDecimal("500.00"))
                .monthlyOrderLimit(30)
                .createdAt(LocalDateTime.now())
                .build();
        entityManager.persist(employee);

        Meal meal = Meal.builder()
                .name("Pasta")
                .description("Italian pasta")
                .type(MealType.LUNCH)
                .price(new BigDecimal("15.00"))
                .available(true)
                .dailyCapacity(100)
                .createdAt(LocalDateTime.now())
                .build();
        entityManager.persist(meal);

        // When: Create orders for different dates
        MealOrder order1 = MealOrder.builder()
                .employee(employee)
                .meal(meal)
                .orderDate(LocalDate.now().plusDays(1))
                .quantity(1)
                .totalPrice(new BigDecimal("15.00"))
                .status(OrderStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();
        entityManager.persist(order1);

        MealOrder order2 = MealOrder.builder()
                .employee(employee)
                .meal(meal)
                .orderDate(LocalDate.now().plusDays(2)) // Different date
                .quantity(1)
                .totalPrice(new BigDecimal("15.00"))
                .status(OrderStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();
        entityManager.persist(order2);
        entityManager.flush();

        // Then: Both orders should be saved successfully
        assertThat(order1.getId()).isNotNull();
        assertThat(order2.getId()).isNotNull();
    }

    @Test
    void shouldAllowSameEmployeeDifferentMeals() {
        // Given: Create employee and two meals
        Employee employee = Employee.builder()
                .name("Multi Order User")
                .email("multi@company.com")
                .password("password123")
                .department("Sales")
                .status(EmployeeStatus.ACTIVE)
                .monthlyBudget(new BigDecimal("500.00"))
                .monthlyOrderLimit(30)
                .createdAt(LocalDateTime.now())
                .build();
        entityManager.persist(employee);

        Meal meal1 = Meal.builder()
                .name("Burger")
                .description("Beef burger")
                .type(MealType.LUNCH)
                .price(new BigDecimal("8.00"))
                .available(true)
                .dailyCapacity(100)
                .createdAt(LocalDateTime.now())
                .build();
        entityManager.persist(meal1);

        Meal meal2 = Meal.builder()
                .name("Pizza")
                .description("Cheese pizza")
                .type(MealType.DINNER)
                .price(new BigDecimal("12.00"))
                .available(true)
                .dailyCapacity(100)
                .createdAt(LocalDateTime.now())
                .build();
        entityManager.persist(meal2);

        LocalDate orderDate = LocalDate.now().plusDays(1);

        // When: Create orders for different meals on same date
        MealOrder order1 = MealOrder.builder()
                .employee(employee)
                .meal(meal1)
                .orderDate(orderDate)
                .quantity(1)
                .totalPrice(new BigDecimal("8.00"))
                .status(OrderStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();
        entityManager.persist(order1);

        MealOrder order2 = MealOrder.builder()
                .employee(employee)
                .meal(meal2) // Different meal
                .orderDate(orderDate)
                .quantity(1)
                .totalPrice(new BigDecimal("12.00"))
                .status(OrderStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();
        entityManager.persist(order2);
        entityManager.flush();

        // Then: Both orders should be saved successfully
        assertThat(order1.getId()).isNotNull();
        assertThat(order2.getId()).isNotNull();
    }

    @Test
    void shouldFindOrdersByEmployee() {
        // Given: Create employee with orders
        Employee employee = Employee.builder()
                .name("Query Test")
                .email("query@company.com")
                .password("password123")
                .department("Finance")
                .status(EmployeeStatus.ACTIVE)
                .monthlyBudget(new BigDecimal("500.00"))
                .monthlyOrderLimit(30)
                .createdAt(LocalDateTime.now())
                .build();
        entityManager.persist(employee);

        Meal meal = Meal.builder()
                .name("Sandwich")
                .description("Club sandwich")
                .type(MealType.LUNCH)
                .price(new BigDecimal("6.00"))
                .available(true)
                .dailyCapacity(100)
                .createdAt(LocalDateTime.now())
                .build();
        entityManager.persist(meal);

        MealOrder order = MealOrder.builder()
                .employee(employee)
                .meal(meal)
                .orderDate(LocalDate.now().plusDays(1))
                .quantity(1)
                .totalPrice(new BigDecimal("6.00"))
                .status(OrderStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();
        entityManager.persist(order);
        entityManager.flush();

        // When: Find orders by employee
        var orders = orderRepository.findByEmployee(employee);

        // Then: Should return the order
      //  org.assertj.core.api.Assertions.<MealOrder>assertThat(orders).hasSize(1);
        assertThat(orders.getEmployee().getEmail()).isEqualTo("query@company.com");
    }

    // Helper method to get root cause
    private Throwable getRootCause(Throwable throwable) {
        Throwable cause = throwable;
        while (cause.getCause() != null && cause.getCause() != cause) {
            cause = cause.getCause();
        }
        return cause;
    }
}
