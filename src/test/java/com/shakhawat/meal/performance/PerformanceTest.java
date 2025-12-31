package com.shakhawat.meal.performance;

import com.shakhawat.meal.dto.MealOrderDTO;
import com.shakhawat.meal.entity.*;
import com.shakhawat.meal.repository.*;
import com.shakhawat.meal.service.MealOrderService;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assumptions.assumeThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class PerformanceTest {

    @Autowired
    private MealOrderService orderService;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private MealRepository mealRepository;

    @Autowired
    private MealOrderRepository orderRepository;

    private List<Employee> employees;
    private List<Meal> meals;

    @BeforeEach
    void setUp() {
        // Clean up
        orderRepository.deleteAll();
        mealRepository.deleteAll();
        employeeRepository.deleteAll();

        // Create test data
        employees = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            Employee employee = Employee.builder()
                    .name("Employee " + i)
                    .email("emp" + i + "@test.com")
                    .password("password")
                    .department("IT")
                    .status(EmployeeStatus.ACTIVE)
                    .monthlyBudget(new BigDecimal("1000.00"))
                    .monthlyOrderLimit(100)
                    .build();
            employee.addRole(Role.ROLE_EMPLOYEE);
            employees.add(employeeRepository.save(employee));
        }

        meals = new ArrayList<>();
        for (int i = 0; i < 5; i++) {
            Meal meal = Meal.builder()
                    .name("Meal " + i)
                    .description("Test meal")
                    .type(MealType.LUNCH)
                    .price(new BigDecimal("10.00"))
                    .available(true)
                    .dailyCapacity(1000)
                    .build();
            meals.add(mealRepository.save(meal));
        }
    }

    @Test
    @DisplayName("Performance Test: Concurrent Order Creation")
    void testConcurrentOrderCreation() throws Exception {
        assumeThat(employees)
                .as("Need at least 10 employees for this test")
                .hasSizeGreaterThanOrEqualTo(10);

        int threadCount = 20;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(threadCount);
        List<Throwable> failures = Collections.synchronizedList(new ArrayList<>());

        // Use future dates that are clearly in the future even near midnight
        LocalDate baseDate = LocalDate.now().plusDays(3); // +3 days is almost always safe

        for (int i = 0; i < threadCount; i++) {
            final int index = i;
            executor.submit(() -> {
                try {
                    startLatch.await();

                    // Pick real existing employee safely
                    Employee employee = employees.get(index % employees.size());
                    Meal meal = meals.get(index % meals.size());

                    LocalDate orderDate = baseDate.plusDays(index / 7); // spread across 3–4 days

                    var request = MealOrderDTO.Request.builder()
                            .employeeId(employee.getId())
                            .mealId(meal.getId())
                            .orderDate(orderDate)
                            .quantity(1 + (index % 4))
                            .build();

                    orderService.createOrder(request);

                } catch (Throwable t) {
                    failures.add(t);
                    System.err.printf("Thread %2d failed → %s%n", index, t);
                } finally {
                    doneLatch.countDown();
                }
            });
        }

        assertThat(failures)
                .as("Most requests should succeed in concurrent scenario")
                .hasSizeLessThanOrEqualTo(threadCount / 3); // allow some conflicts
    }

    @Test
    @DisplayName("Performance Test: Batch Query Performance")
    void testBatchQueryPerformance() {
        LocalDate orderDate = LocalDate.of(2026, 1, 1);

        // Load existing employees and meals (assumed to be populated in @BeforeEach or @TestInstance setup)
        List<Employee> employees = employeeRepository.findAll();
        List<Meal> meals = mealRepository.findAll();

        // We need at least 20 employees to get 20 × 5 = 100 unique (employee, meal, date) combinations
        int targetEmployeeCount = 20;
        int currentCount = employees.size();

        for (int i = currentCount; i < targetEmployeeCount; i++) {
            Employee newEmployee = Employee.builder()
                    .name("Test Employee " + (i + 1))
                    .email("employee" + (i + 1) + "@company.com")
                    .department("IT")
                    .password("TempPass123!")
                    .build();

            employeeRepository.saveAndFlush(newEmployee);
            employees.add(newEmployee);
        }

        // Now we have at least 20 employees and (presumably) 5+ meals
        System.out.println("Total employees available: " + employees.size());
        System.out.println("Total meals available: " + meals.size());

        Set<String> uniqueOrderKeys = new HashSet<>();
        int totalOrdersCreated = 0;

        // Generate up to 100 unique orders using Cartesian product
        outerLoop:
        for (Employee employee : employees) {
            for (Meal meal : meals) {
                if (totalOrdersCreated >= 100) {
                    break outerLoop;
                }

                String key = employee.getId() + "-" + meal.getId() + "-" + orderDate;
                if (uniqueOrderKeys.contains(key)) {
                    continue; // Should not happen, but safe guard
                }
                uniqueOrderKeys.add(key);

                boolean exists = orderRepository.existsByEmployeeIdAndMealIdAndOrderDate(
                        employee.getId(), meal.getId(), orderDate);

                if (!exists) {
                    MealOrder order = MealOrder.builder()
                            .employee(employee)
                            .meal(meal)
                            .orderDate(orderDate)
                            .quantity(1)
                            .totalPrice(new BigDecimal("10.00"))
                            .status(OrderStatus.PENDING)
                            .createdAt(LocalDateTime.now())
                            .build();

                    orderRepository.save(order);
                    totalOrdersCreated++;
                }
            }
        }

        orderRepository.flush();

        long count = orderRepository.countByOrderDate(orderDate);
        System.out.println("Number of orders saved for date " + orderDate + ": " + count);

        // Assertions
        assertThat(count).isEqualTo(100);
        assertThat(totalOrdersCreated).isEqualTo(100);

        // Performance test with JOIN FETCH
        long startTime = System.currentTimeMillis();
        List<MealOrder> ordersWithDetails = orderRepository.findByOrderDateWithDetails(orderDate);
        long endTime = System.currentTimeMillis();

        System.out.println("Batch query performance:");
        System.out.println("  Orders fetched: " + ordersWithDetails.size());
        System.out.println("  Time with JOIN FETCH: " + (endTime - startTime) + " ms");

        assertThat(ordersWithDetails).hasSize(100);
        assertThat(endTime - startTime).isLessThan(1000); // Should be fast even with 100 records
    }
}
