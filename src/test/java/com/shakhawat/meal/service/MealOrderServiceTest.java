package com.shakhawat.meal.service;

import com.shakhawat.meal.dto.*;
import com.shakhawat.meal.entity.*;
import com.shakhawat.meal.exception.ResourceNotFoundException;
import com.shakhawat.meal.repository.*;
import com.shakhawat.meal.util.EntityMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MealOrderServiceTest {

    @Mock
    private MealOrderRepository orderRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private MealRepository mealRepository;

    @Mock
    private InventoryService inventoryService;

    @Mock
    private EntityMapper entityMapper;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private MealOrderService orderService;

    private Employee employee;
    private Meal meal;
    private MealOrderDTO.Request orderRequest;
    private MealOrder mealOrder;
    private MealOrderDTO.Response orderResponse;

    @BeforeEach
    void setUp() {
        // Set cutoff hours
        ReflectionTestUtils.setField(orderService, "cutoffHours", 4);

        employee = Employee.builder()
                .id(1L)
                .name("John Doe")
                .email("john@example.com")
                .password("password")
                .department("IT")
                .status(EmployeeStatus.ACTIVE)
                .monthlyBudget(new BigDecimal("500.00"))
                .currentMonthSpent(BigDecimal.ZERO)
                .monthlyOrderLimit(30)
                .build();

        meal = Meal.builder()
                .id(1L)
                .name("Chicken Biryani")
                .description("Aromatic rice")
                .type(MealType.LUNCH)
                .price(new BigDecimal("12.50"))
                .available(true)
                .dailyCapacity(100)
                .build();

        orderRequest = MealOrderDTO.Request.builder()
                .employeeId(1L)
                .mealId(1L)
                .orderDate(LocalDate.now().plusDays(1))
                .quantity(2)
                .build();

        mealOrder = MealOrder.builder()
                .id(1L)
                .employee(employee)
                .meal(meal)
                .orderDate(LocalDate.now().plusDays(1))
                .quantity(2)
                .totalPrice(new BigDecimal("25.00"))
                .status(OrderStatus.PENDING)
                .build();

        orderResponse = MealOrderDTO.Response.builder()
                .id(1L)
                .employeeId(1L)
                .employeeName("John Doe")
                .mealId(1L)
                .mealName("Chicken Biryani")
                .orderDate(LocalDate.now().plusDays(1))
                .quantity(2)
                .totalPrice(new BigDecimal("25.00"))
                .status(OrderStatus.PENDING)
                .build();
    }

    @Nested
    @DisplayName("Create Order Tests")
    class CreateOrderTests {

        @Test
        @DisplayName("Should create order successfully")
        void shouldCreateOrderSuccessfully() {
            // Given
            when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));
            when(mealRepository.findById(1L)).thenReturn(Optional.of(meal));
            when(orderRepository.existsByEmployeeIdAndMealIdAndOrderDate(any(), any(), any()))
                    .thenReturn(false);
            when(orderRepository.countByEmployeeIdAndMonth(any(), anyInt(), anyInt()))
                    .thenReturn(5L);
            doNothing().when(inventoryService).reserveMeal(any(), any(), anyInt());
            when(orderRepository.save(any())).thenReturn(mealOrder);
            when(entityMapper.toDto(any(MealOrder.class))).thenReturn(orderResponse);
            when(employeeRepository.save(any())).thenReturn(employee);

            // When
            MealOrderDTO.Response result = orderService.createOrder(orderRequest);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.getTotalPrice()).isEqualByComparingTo(new BigDecimal("25.00"));
            assertThat(result.getQuantity()).isEqualTo(2);

            verify(orderRepository).save(any(MealOrder.class));
            verify(inventoryService).reserveMeal(1L, orderRequest.getOrderDate(), 2);
            verify(employeeRepository).save(any(Employee.class));
            verify(auditService).logCreate(eq("MealOrder"), eq(1L), anyString());
        }

        @Test
        @DisplayName("Should throw exception when employee not found")
        void shouldThrowExceptionWhenEmployeeNotFound() {
            // Given
            when(employeeRepository.findById(999L)).thenReturn(Optional.empty());

            MealOrderDTO.Request invalidRequest = MealOrderDTO.Request.builder()
                    .employeeId(999L)
                    .mealId(1L)
                    .orderDate(LocalDate.now().plusDays(1))
                    .quantity(1)
                    .build();

            // When & Then
            assertThatThrownBy(() -> orderService.createOrder(invalidRequest))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Employee");

            verify(orderRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should throw exception when meal not found")
        void shouldThrowExceptionWhenMealNotFound() {
            // Given
            when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));
            when(mealRepository.findById(999L)).thenReturn(Optional.empty());

            MealOrderDTO.Request invalidRequest = MealOrderDTO.Request.builder()
                    .employeeId(1L)
                    .mealId(999L)
                    .orderDate(LocalDate.now().plusDays(1))
                    .quantity(1)
                    .build();

            // When & Then
            assertThatThrownBy(() -> orderService.createOrder(invalidRequest))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Meal");
        }

        @Test
        @DisplayName("Should throw exception when meal not available")
        void shouldThrowExceptionWhenMealNotAvailable() {
            // Given
            meal.setAvailable(false);
            when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));
            when(mealRepository.findById(1L)).thenReturn(Optional.of(meal));

            // When & Then
            assertThatThrownBy(() -> orderService.createOrder(orderRequest))
                    .isInstanceOf(InvalidOperationException.class)
                    .hasMessageContaining("not available");
        }

        @Test
        @DisplayName("Should throw exception when duplicate order")
        void shouldThrowExceptionWhenDuplicateOrder() {
            // Given
            when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));
            when(mealRepository.findById(1L)).thenReturn(Optional.of(meal));
            when(orderRepository.existsByEmployeeIdAndMealIdAndOrderDate(1L, 1L, orderRequest.getOrderDate()))
                    .thenReturn(true);

            // When & Then
            assertThatThrownBy(() -> orderService.createOrder(orderRequest))
                    .isInstanceOf(DuplicateResourceException.class)
                    .hasMessageContaining("already exists");
        }

        @Test
        @DisplayName("Should throw exception when ordering for past date")
        void shouldThrowExceptionWhenOrderingForPastDate() {
            // Given
            MealOrderDTO.Request pastDateRequest = MealOrderDTO.Request.builder()
                    .employeeId(1L)
                    .mealId(1L)
                    .orderDate(LocalDate.now().minusDays(1))
                    .quantity(1)
                    .build();

            when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));
            when(mealRepository.findById(1L)).thenReturn(Optional.of(meal));
            when(orderRepository.existsByEmployeeIdAndMealIdAndOrderDate(any(), any(), any()))
                    .thenReturn(false);

            // When & Then
            assertThatThrownBy(() -> orderService.createOrder(pastDateRequest))
                    .isInstanceOf(InvalidOperationException.class)
                    .hasMessageContaining("past dates");
        }

        @Test
        @DisplayName("Should throw exception when budget exceeded")
        void shouldThrowExceptionWhenBudgetExceeded() {
            // Given
            employee.setCurrentMonthSpent(new BigDecimal("490.00")); // Only 10 left, but order is 25

            when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));
            when(mealRepository.findById(1L)).thenReturn(Optional.of(meal));
            when(orderRepository.existsByEmployeeIdAndMealIdAndOrderDate(any(), any(), any()))
                    .thenReturn(false);
            when(orderRepository.countByEmployeeIdAndMonth(any(), anyInt(), anyInt()))
                    .thenReturn(5L);

            // When & Then
            assertThatThrownBy(() -> orderService.createOrder(orderRequest))
                    .isInstanceOf(InvalidOperationException.class)
                    .hasMessageContaining("budget exceeded");
        }

        @Test
        @DisplayName("Should throw exception when monthly order limit exceeded")
        void shouldThrowExceptionWhenOrderLimitExceeded() {
            // Given
            when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));
            when(mealRepository.findById(1L)).thenReturn(Optional.of(meal));
            when(orderRepository.existsByEmployeeIdAndMealIdAndOrderDate(any(), any(), any()))
                    .thenReturn(false);
            when(orderRepository.countByEmployeeIdAndMonth(any(), anyInt(), anyInt()))
                    .thenReturn(30L); // Already at limit

            // When & Then
            assertThatThrownBy(() -> orderService.createOrder(orderRequest))
                    .isInstanceOf(InvalidOperationException.class)
                    .hasMessageContaining("order limit exceeded");
        }
    }

    @Nested
    @DisplayName("Cancel Order Tests")
    class CancelOrderTests {

        @Test
        @DisplayName("Should cancel order successfully")
        void shouldCancelOrderSuccessfully() {
            // Given
            when(orderRepository.findById(1L)).thenReturn(Optional.of(mealOrder));
            doNothing().when(inventoryService).releaseMeal(any(), any(), anyInt());
            when(employeeRepository.save(any())).thenReturn(employee);
            when(orderRepository.save(any())).thenReturn(mealOrder);

            // When
            assertThatCode(() -> orderService.cancelOrder(1L))
                    .doesNotThrowAnyException();

            // Then
            verify(inventoryService).releaseMeal(1L, mealOrder.getOrderDate(), 2);
            verify(employeeRepository).save(employee);
            verify(orderRepository).save(any(MealOrder.class));
            verify(auditService).logUpdate(eq("MealOrder"), eq(1L), anyString(), anyString());
        }

        @Test
        @DisplayName("Should throw exception when cancelling delivered order")
        void shouldThrowExceptionWhenCancellingDeliveredOrder() {
            // Given
            mealOrder.setStatus(OrderStatus.DELIVERED);
            when(orderRepository.findById(1L)).thenReturn(Optional.of(mealOrder));

            // When & Then
            assertThatThrownBy(() -> orderService.cancelOrder(1L))
                    .isInstanceOf(InvalidOperationException.class)
                    .hasMessageContaining("Cannot cancel a delivered order");

            verify(inventoryService, never()).releaseMeal(any(), any(), anyInt());
            verify(orderRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should throw exception when order not found")
        void shouldThrowExceptionWhenOrderNotFound() {
            // Given
            when(orderRepository.findById(999L)).thenReturn(Optional.empty());

            // When & Then
            assertThatThrownBy(() -> orderService.cancelOrder(999L))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("Update Order Status Tests")
    class UpdateOrderStatusTests {

        @Test
        @DisplayName("Should update order status successfully")
        void shouldUpdateOrderStatusSuccessfully() {
            // Given
            when(orderRepository.findById(1L)).thenReturn(Optional.of(mealOrder));
            when(orderRepository.save(any())).thenReturn(mealOrder);
            when(entityMapper.toDto(any(MealOrder.class))).thenReturn(orderResponse);

            // When
            MealOrderDTO.Response result = orderService.updateOrderStatus(1L, OrderStatus.CONFIRMED);

            // Then
            assertThat(result).isNotNull();
            verify(orderRepository).save(any(MealOrder.class));
            verify(auditService).logUpdate(eq("MealOrder"), eq(1L), anyString(), anyString());
        }
    }
}
