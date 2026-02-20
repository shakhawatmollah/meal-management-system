package com.shakhawat.meal.service;

import com.shakhawat.meal.dto.MealOrderDTO;
import com.shakhawat.meal.entity.*;
import com.shakhawat.meal.exception.*;
import com.shakhawat.meal.repository.*;
import com.shakhawat.meal.util.EntityMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Validated
@Slf4j
public class MealOrderService {

    private final MealOrderRepository orderRepository;
    private final EmployeeRepository employeeRepository;
    private final MealRepository mealRepository;
    private final InventoryService inventoryService;
    private final EntityMapper entityMapper;
    private final AuditService auditService;

    @Value("${order.cutoff.hours:4}")
    private int cutoffHours;

    @Transactional
    public MealOrderDTO.Response createOrder(@Valid MealOrderDTO.Request request) {
        log.info("Creating order - employeeId: {}, mealId: {}, date: {}",
                request.getEmployeeId(), request.getMealId(), request.getOrderDate());
        ensureCanActOnEmployee(request.getEmployeeId());

        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", request.getEmployeeId()));

        Meal meal = mealRepository.findById(request.getMealId())
                .orElseThrow(() -> new ResourceNotFoundException("Meal", request.getMealId()));

        // Validations
        validateMealAvailability(meal);
        validateOrderTiming(request.getOrderDate(), meal.getType());
        validateDuplicateOrder(request);

        BigDecimal totalPrice = meal.getPrice().multiply(BigDecimal.valueOf(request.getQuantity()));

        validateBudget(employee, totalPrice);

        // Reserve inventory
        inventoryService.reserveMeal(meal.getId(), request.getOrderDate(), request.getQuantity());

        // Create order
        MealOrder order = MealOrder.builder()
                .employee(employee)
                .meal(meal)
                .orderDate(request.getOrderDate())
                .quantity(request.getQuantity())
                .totalPrice(totalPrice)
                .status(OrderStatus.PENDING)
                .build();

        MealOrder savedOrder = orderRepository.save(order);

        // Update employee budget
        employee.setCurrentMonthSpent(employee.getCurrentMonthSpent().add(totalPrice));
        employeeRepository.save(employee);

        auditService.logCreate("MealOrder", savedOrder.getId(), savedOrder.toString());
        log.info("Order created successfully - orderId: {}, total: {}",
                savedOrder.getId(), savedOrder.getTotalPrice());

        return entityMapper.toDto(savedOrder);
    }

    private void validateMealAvailability(Meal meal) {
        if (!meal.getAvailable()) {
            throw new InvalidOperationException("Meal is not available");
        }
    }

    private void validateOrderTiming(LocalDate orderDate, MealType mealType) {
        LocalDateTime now = LocalDateTime.now();

        if (orderDate.isBefore(now.toLocalDate())) {
            throw new InvalidOperationException("Cannot order meals for past dates");
        }

        if (orderDate.isEqual(now.toLocalDate())) {
            LocalTime mealTime = getMealTime(mealType);
            LocalTime cutoffTime = mealTime.minusHours(cutoffHours);

            if (now.toLocalTime().isAfter(cutoffTime)) {
                throw new InvalidOperationException(
                        String.format("Order deadline passed. Cutoff time was %s", cutoffTime));
            }
        }
    }

    private LocalTime getMealTime(MealType type) {
        return switch (type) {
            case BREAKFAST -> LocalTime.of(8, 0);
            case LUNCH -> LocalTime.of(12, 30);
            case DINNER -> LocalTime.of(19, 0);
            case SNACK -> LocalTime.of(15, 0);
        };
    }

    private void validateDuplicateOrder(MealOrderDTO.Request request) {
        if (orderRepository.existsByEmployeeIdAndMealIdAndOrderDate(
                request.getEmployeeId(), request.getMealId(), request.getOrderDate())) {
            throw new DuplicateResourceException("Order already exists for this employee, meal, and date");
        }
    }

    private void validateBudget(Employee employee, BigDecimal orderTotal) {
        if (employee.getCurrentMonthSpent().add(orderTotal)
                .compareTo(employee.getMonthlyBudget()) > 0) {
            throw new InvalidOperationException("Monthly budget exceeded");
        }

        long monthOrders = orderRepository.countByEmployeeIdAndMonth(
                employee.getId(),
                LocalDate.now().getYear(),
                LocalDate.now().getMonthValue()
        );

        if (monthOrders >= employee.getMonthlyOrderLimit()) {
            throw new InvalidOperationException("Monthly order limit exceeded");
        }
    }

    public MealOrderDTO.Response getOrderById(Long id) {
        log.debug("Fetching order with ID: {}", id);

        MealOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MealOrder", id));
        ensureCanAccessOrder(order);
        return entityMapper.toDto(order);
    }

    public Page<MealOrderDTO.Response> getAllOrders(Pageable pageable) {
        log.debug("Fetching all orders with pagination");

        Employee currentEmployee = getCurrentEmployeeIfRestrictedUser();
        if (currentEmployee != null) {
            return orderRepository.findByEmployeeId(currentEmployee.getId(), pageable)
                    .map(entityMapper::toDto);
        }

        return orderRepository.findAll(pageable)
                .map(entityMapper::toDto);
    }

    public List<MealOrderDTO.Response> getOrdersByEmployee(Long employeeId) {
        log.debug("Fetching orders for employee: {}", employeeId);
        ensureCanActOnEmployee(employeeId);

        return orderRepository.findByEmployeeIdWithDetails(employeeId).stream()
                .map(entityMapper::toDto)
                .toList();
    }

    public List<MealOrderDTO.Response> getOrdersByDate(LocalDate date) {
        log.debug("Fetching orders for date: {}", date);
        ensurePrivilegedUser();

        return orderRepository.findByOrderDateWithDetails(date).stream()
                .map(entityMapper::toDto)
                .toList();
    }

    @Transactional
    public MealOrderDTO.Response updateOrderStatus(Long id, OrderStatus status) {
        log.info("Updating order status - orderId: {}, newStatus: {}", id, status);

        MealOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MealOrder", id));

        String oldValue = order.toString();
        order.setStatus(status);
        MealOrder updatedOrder = orderRepository.save(order);

        auditService.logUpdate("MealOrder", updatedOrder.getId(), oldValue, updatedOrder.toString());
        log.info("Order status updated - orderId: {}", id);

        return entityMapper.toDto(updatedOrder);
    }

    @Transactional
    public void cancelOrder(Long id) {
        log.info("Cancelling order with ID: {}", id);

        MealOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MealOrder", id));
        ensureCanAccessOrder(order);

        if (order.getStatus() == OrderStatus.DELIVERED) {
            throw new InvalidOperationException("Cannot cancel a delivered order");
        }

        // Release inventory
        inventoryService.releaseMeal(order.getMeal().getId(), order.getOrderDate(), order.getQuantity());

        // Refund budget
        Employee employee = order.getEmployee();
        employee.setCurrentMonthSpent(employee.getCurrentMonthSpent().subtract(order.getTotalPrice()));
        employeeRepository.save(employee);

        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);

        auditService.logUpdate("MealOrder", order.getId(), "Status: " + OrderStatus.PENDING, "Status: CANCELLED");
        log.info("Order cancelled successfully - orderId: {}", id);
    }

    private void ensureCanActOnEmployee(Long employeeId) {
        Employee currentEmployee = getCurrentEmployeeIfRestrictedUser();
        if (currentEmployee == null) {
            return;
        }

        if (!currentEmployee.getId().equals(employeeId)) {
            throw new AccessDeniedException("You can only access your own orders");
        }
    }

    private void ensureCanAccessOrder(MealOrder order) {
        Employee currentEmployee = getCurrentEmployeeIfRestrictedUser();
        if (currentEmployee == null) {
            return;
        }

        if (!currentEmployee.getId().equals(order.getEmployee().getId())) {
            throw new AccessDeniedException("You can only access your own orders");
        }
    }

    private void ensurePrivilegedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            return;
        }

        if (!isPrivileged(authentication)) {
            throw new AccessDeniedException("Access denied");
        }
    }

    /**
     * Returns current employee only for ROLE_EMPLOYEE users.
     * For admin/staff (or missing auth context), returns null to indicate unrestricted flow.
     */
    private Employee getCurrentEmployeeIfRestrictedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            return null;
        }

        if (isPrivileged(authentication)) {
            return null;
        }

        return employeeRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new AccessDeniedException("Authenticated employee not found"));
    }

    private boolean isPrivileged(Authentication authentication) {
        return authentication.getAuthorities().stream().anyMatch(authority ->
                "ROLE_ADMIN".equals(authority.getAuthority()) ||
                        "ROLE_CAFETERIA_STAFF".equals(authority.getAuthority()));
    }
}
