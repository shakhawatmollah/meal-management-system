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
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.*;
import static org.assertj.core.api.Assertions.assertThat;

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
    void testConcurrentOrderCreation() throws InterruptedException {
        int threadCount = 20;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch latch = new CountDownLatch(threadCount);
        List<Future<Boolean>> futures = new ArrayList<>();

        long startTime = System.currentTimeMillis();

        for (int i = 0; i < threadCount; i++) {
            final int index = i;
            Future<Boolean> future = executor.submit(() -> {
                try {
                    Employee employee = employees.get(index % employees.size());
                    Meal meal = meals.get(index % meals.size());

                    MealOrderDTO.Request request = MealOrderDTO.Request.builder()
                            .employeeId(employee.getId())
                            .mealId(meal.getId())
                            .orderDate(LocalDate.now().plusDays(index + 1))
                            .quantity(1)
                            .build();

                    orderService.createOrder(request);
                    return true;
                } catch (Exception e) {
                    System.err.println("Error in thread " + index + ": " + e.getMessage());
                    return false;
                } finally {
                    latch.countDown();
                }
            });
            futures.add(future);
        }

        latch.await(30, TimeUnit.SECONDS);
        long endTime = System.currentTimeMillis();

        executor.shutdown();

        // Verify results
        long successCount = futures.stream()
                .filter(f -> {
                    try {
                        return f.get();
                    } catch (Exception e) {
                        return false;
                    }
                })
                .count();

        System.out.println("Concurrent order creation:");
        System.out.println("  Total threads: " + threadCount);
        System.out.println("  Successful orders: " + successCount);
        System.out.println("  Time taken: " + (endTime - startTime) + "ms");
        System.out.println("  Average time per order: " + (endTime - startTime) / threadCount + "ms");

        assertThat(successCount).isGreaterThan(0);
    }

    @Test
    @DisplayName("Performance Test: Batch Query Performance")
    void testBatchQueryPerformance() {
        // Create 100 orders
        LocalDate orderDate = LocalDate.now().plusDays(1);
        for (int i = 0; i < 100; i++) {
            MealOrder order = MealOrder.builder()
                    .employee(employees.get(i % employees.size()))
                    .meal(meals.get(i % meals.size()))
                    .orderDate(orderDate)
                    .quantity(1)
                    .totalPrice(new BigDecimal("10.00"))
                    .status(OrderStatus.PENDING)
                    .build();
            orderRepository.save(order);
        }

        // Test query with JOIN FETCH (should be faster)
        long startTime = System.currentTimeMillis();
        List<MealOrder> ordersWithJoinFetch = orderRepository.findByOrderDateWithDetails(orderDate);
        long endTime = System.currentTimeMillis();

        System.out.println("Batch query performance:");
        System.out.println("  Orders fetched: " + ordersWithJoinFetch.size());
        System.out.println("  Time with JOIN FETCH: " + (endTime - startTime) + "ms");

        assertThat(ordersWithJoinFetch).hasSize(100);
        assertThat(endTime - startTime).isLessThan(1000); // Should complete in less than 1 second
    }
}
