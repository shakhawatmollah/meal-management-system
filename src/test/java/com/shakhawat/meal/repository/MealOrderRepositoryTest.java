package com.shakhawat.meal.repository;

import com.shakhawat.meal.entity.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;
import java.math.BigDecimal;
import java.time.LocalDate;
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
                .build();
        entityManager.persist(employee);

        meal = Meal.builder()
                .name("Test Meal")
                .description("Test Description")
                .type(MealType.LUNCH)
                .price(new BigDecimal("10.00"))
                .available(true)
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
                .build();
        entityManager.persist(order);
        entityManager.flush();

        // When
        List<MealOrder> orders = orderRepository.findByOrderDateWithDetails(orderDate);

        // Then
        assertThat(orders).hasSize(1);
        assertThat(orders.get(0).getQuantity()).isEqualTo(2);
    }

    @Test
    @DisplayName("Should prevent duplicate orders")
    void shouldPreventDuplicateOrders() {
        // Given
        LocalDate orderDate = LocalDate.now().plusDays(1);
        MealOrder order1 = MealOrder.builder()
                .employee(employee)
                .meal(meal)
                .orderDate(orderDate)
                .quantity(1)
                .totalPrice(new BigDecimal("10.00"))
                .status(OrderStatus.PENDING)
                .build();
        entityManager.persist(order1);
        entityManager.flush();

        // When - Try to create duplicate
        MealOrder order2 = MealOrder.builder()
                .employee(employee)
                .meal(meal)
                .orderDate(orderDate)
                .quantity(2)
                .totalPrice(new BigDecimal("20.00"))
                .status(OrderStatus.PENDING)
                .build();

        // Then
        assertThatThrownBy(() -> {
            entityManager.persist(order2);
            entityManager.flush();
        }).hasMessageContaining("constraint");
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
        for (int i = 1; i <= 3; i++) {
            MealOrder order = MealOrder.builder()
                    .employee(employee)
                    .meal(meal)
                    .orderDate(today.plusDays(i))
                    .quantity(1)
                    .totalPrice(new BigDecimal("10.00"))
                    .status(OrderStatus.PENDING)
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
                .build();

        MealOrder order2 = MealOrder.builder()
                .employee(employee)
                .meal(meal)
                .orderDate(end)
                .quantity(1)
                .totalPrice(new BigDecimal("10.00"))
                .status(OrderStatus.PENDING)
                .build();

        entityManager.persist(order1);
        entityManager.persist(order2);
        entityManager.flush();

        // When
        List<MealOrder> orders = orderRepository.findOrdersBetweenDates(start, end);

        // Then
        assertThat(orders).hasSize(2);
    }
}
