package com.shakhawat.meal.controller;

import com.shakhawat.meal.dto.EmployeeDTO;
import com.shakhawat.meal.entity.EmployeeStatus;
import com.shakhawat.meal.service.EmployeeService;
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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/employees")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Employee Management", description = "Employee management APIs (Admin only)")
public class EmployeeController {

    private final EmployeeService employeeService;

    @Operation(summary = "Create employee")
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<EmployeeDTO.Response>> createEmployee(
            @Valid @RequestBody EmployeeDTO.Request request) {
        EmployeeDTO.Response response = employeeService.createEmployee(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Employee created successfully", response));
    }

    @Operation(summary = "Get employee by ID")
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<EmployeeDTO.Response>> getEmployee(@PathVariable Long id) {
        EmployeeDTO.Response response = employeeService.getEmployeeById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "Get all employees with pagination")
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<EmployeeDTO.Response>>> getAllEmployees(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "DESC") String direction,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) EmployeeStatus status) {

        Sort.Direction sortDirection = direction.equalsIgnoreCase("ASC")
                ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));

        Page<EmployeeDTO.Response> responses;
        if (!StringUtils.hasText(search) && !StringUtils.hasText(department) && status == null) {
            responses = employeeService.getAllEmployees(pageable);
        } else {
            responses = employeeService.getAllEmployees(pageable, search, department, status);
        }
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @Operation(summary = "Update employee")
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<EmployeeDTO.Response>> updateEmployee(
            @PathVariable Long id,
            @Valid @RequestBody EmployeeDTO.Request request) {
        EmployeeDTO.Response response = employeeService.updateEmployee(id, request);
        return ResponseEntity.ok(ApiResponse.success("Employee updated successfully", response));
    }

    @Operation(summary = "Delete employee")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteEmployee(@PathVariable Long id) {
        employeeService.deleteEmployee(id);
        return ResponseEntity.ok(ApiResponse.success("Employee deleted successfully", null));
    }
}
