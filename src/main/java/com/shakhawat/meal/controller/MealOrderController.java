package com.shakhawat.meal.controller;

import com.shakhawat.meal.dto.MealOrderDTO;
import com.shakhawat.meal.entity.OrderStatus;
import com.shakhawat.meal.service.MealOrderService;
import com.shakhawat.meal.util.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Order Management", description = "Meal order management APIs")
public class MealOrderController {

    private final MealOrderService orderService;

    @Operation(summary = "Create order")
    @PostMapping
    public ResponseEntity<ApiResponse<MealOrderDTO.Response>> createOrder(
            @Valid @RequestBody MealOrderDTO.Request request) {
        MealOrderDTO.Response response = orderService.createOrder(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Order created successfully", response));
    }

    @Operation(summary = "Get order by ID")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MealOrderDTO.Response>> getOrder(@PathVariable Long id) {
        MealOrderDTO.Response response = orderService.getOrderById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "Get orders with filters")
    @GetMapping
    public ResponseEntity<?> getOrders(
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String direction) {

        if (employeeId != null && (page == 0 && size == 20)) {
            List<MealOrderDTO.Response> responses = orderService.getOrdersByEmployee(employeeId);
            return ResponseEntity.ok(ApiResponse.success(responses));
        } else if (date != null && (page == 0 && size == 20)) {
            List<MealOrderDTO.Response> responses = orderService.getOrdersByDate(date);
            return ResponseEntity.ok(ApiResponse.success(responses));
        } else {
            Sort.Direction sortDirection = direction.equalsIgnoreCase("ASC")
                    ? Sort.Direction.ASC : Sort.Direction.DESC;
            Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));

            Page<MealOrderDTO.Response> responses = orderService.getAllOrders(pageable);
            return ResponseEntity.ok(ApiResponse.success(responses));
        }
    }

    @Operation(summary = "Update order status (Admin/Staff only)")
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'CAFETERIA_STAFF')")
    public ResponseEntity<ApiResponse<MealOrderDTO.Response>> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam OrderStatus status) {
        MealOrderDTO.Response response = orderService.updateOrderStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Order status updated", response));
    }

    @Operation(summary = "Cancel order")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> cancelOrder(@PathVariable Long id) {
        orderService.cancelOrder(id);
        return ResponseEntity.ok(ApiResponse.success("Order cancelled successfully", null));
    }
}
