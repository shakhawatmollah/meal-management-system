package com.shakhawat.meal.controller;

import com.shakhawat.meal.dto.MealDTO;
import com.shakhawat.meal.entity.MealType;
import com.shakhawat.meal.service.MealService;
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
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/meals")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Meal Management", description = "Meal management APIs")
public class MealController {

    private final MealService mealService;

    @Operation(summary = "Create meal (Admin only)")
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<MealDTO.Response>> createMeal(
            @Valid @RequestBody MealDTO.Request request) {
        MealDTO.Response response = mealService.createMeal(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Meal created successfully", response));
    }

    @Operation(summary = "Get meal by ID")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MealDTO.Response>> getMeal(@PathVariable Long id) {
        MealDTO.Response response = mealService.getMealById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "Get all meals with filters and pagination")
    @GetMapping
    public ResponseEntity<?> getAllMeals(
            @RequestParam(required = false) Boolean available,
            @RequestParam(required = false) MealType type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "ASC") String direction) {

        Sort.Direction sortDirection = direction.equalsIgnoreCase("ASC")
                ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));

        if (Boolean.TRUE.equals(available) && page == 0 && size == 20) {
            List<MealDTO.Response> responses = mealService.getAvailableMeals();
            return ResponseEntity.ok(ApiResponse.success(responses));
        } else if (Boolean.TRUE.equals(available)) {
            Page<MealDTO.Response> responses = mealService.getAvailableMeals(pageable);
            return ResponseEntity.ok(ApiResponse.success(responses));
        } else if (type != null) {
            Page<MealDTO.Response> responses = mealService.getMealsByType(type, pageable);
            return ResponseEntity.ok(ApiResponse.success(responses));
        } else {
            Page<MealDTO.Response> responses = mealService.getAllMeals(pageable);
            return ResponseEntity.ok(ApiResponse.success(responses));
        }
    }

    @Operation(summary = "Update meal (Admin only)")
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<MealDTO.Response>> updateMeal(
            @PathVariable Long id,
            @Valid @RequestBody MealDTO.Request request) {
        MealDTO.Response response = mealService.updateMeal(id, request);
        return ResponseEntity.ok(ApiResponse.success("Meal updated successfully", response));
    }

    @Operation(summary = "Delete meal (Admin only)")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteMeal(@PathVariable Long id) {
        mealService.deleteMeal(id);
        return ResponseEntity.ok(ApiResponse.success("Meal deleted successfully", null));
    }
}
