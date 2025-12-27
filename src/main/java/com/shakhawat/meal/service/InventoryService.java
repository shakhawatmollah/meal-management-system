package com.shakhawat.meal.service;

import com.shakhawat.meal.entity.DailyMealInventory;
import com.shakhawat.meal.entity.Meal;
import com.shakhawat.meal.exception.InvalidOperationException;
import com.shakhawat.meal.exception.ResourceNotFoundException;
import com.shakhawat.meal.repository.InventoryRepository;
import com.shakhawat.meal.repository.MealRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final MealRepository mealRepository;

    @Transactional
    public void reserveMeal(Long mealId, LocalDate date, int quantity) {
        log.info("Reserving meal - mealId: {}, date: {}, quantity: {}", mealId, date, quantity);

        DailyMealInventory inventory = inventoryRepository
                .findByMealIdAndDateWithLock(mealId, date)
                .orElseGet(() -> createInventory(mealId, date));

        if (inventory.getAvailableQuantity() < quantity) {
            throw new InvalidOperationException(
                    "Insufficient meal capacity. Available: " + inventory.getAvailableQuantity());
        }

        inventory.setAvailableQuantity(inventory.getAvailableQuantity() - quantity);
        inventory.setReservedQuantity(inventory.getReservedQuantity() + quantity);
        inventoryRepository.save(inventory);

        log.info("Meal reserved successfully");
    }

    @Transactional
    public void releaseMeal(Long mealId, LocalDate date, int quantity) {
        log.info("Releasing meal - mealId: {}, date: {}, quantity: {}", mealId, date, quantity);

        DailyMealInventory inventory = inventoryRepository
                .findByMealIdAndDateWithLock(mealId, date)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory",
                        "mealId=" + mealId + ", date=" + date));

        inventory.setAvailableQuantity(inventory.getAvailableQuantity() + quantity);
        inventory.setReservedQuantity(inventory.getReservedQuantity() - quantity);
        inventoryRepository.save(inventory);

        log.info("Meal released successfully");
    }

    private DailyMealInventory createInventory(Long mealId, LocalDate date) {
        Meal meal = mealRepository.findById(mealId)
                .orElseThrow(() -> new ResourceNotFoundException("Meal", mealId));

        return inventoryRepository.save(
                DailyMealInventory.builder()
                        .meal(meal)
                        .date(date)
                        .availableQuantity(meal.getDailyCapacity())
                        .reservedQuantity(0)
                        .build()
        );
    }
}
