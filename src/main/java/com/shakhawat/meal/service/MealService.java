package com.shakhawat.meal.service;

import com.shakhawat.meal.dto.MealDTO;
import com.shakhawat.meal.entity.Meal;
import com.shakhawat.meal.entity.MealType;
import com.shakhawat.meal.exception.ResourceNotFoundException;
import com.shakhawat.meal.repository.MealRepository;
import com.shakhawat.meal.util.EntityMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Validated
@Slf4j
public class MealService {

    private final MealRepository mealRepository;
    private final EntityMapper entityMapper;
    private final AuditService auditService;

    @Transactional
    @CacheEvict(value = "meals", allEntries = true)
    public MealDTO.Response createMeal(@Valid MealDTO.Request request) {
        log.info("Creating meal: {}", request.getName());

        Meal meal = entityMapper.toEntity(request);
        Meal savedMeal = mealRepository.save(meal);

        auditService.logCreate("Meal", savedMeal.getId(), savedMeal.toString());
        log.info("Meal created with ID: {}", savedMeal.getId());

        return entityMapper.toDto(savedMeal);
    }

    @Cacheable(value = "meals", key = "#id")
    public MealDTO.Response getMealById(Long id) {
        log.debug("Fetching meal with ID: {}", id);

        Meal meal = mealRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Meal", id));
        return entityMapper.toDto(meal);
    }

    public Page<MealDTO.Response> getAllMeals(Pageable pageable) {
        log.debug("Fetching all meals with pagination: {}", pageable);

        return mealRepository.findAll(pageable)
                .map(entityMapper::toDto);
    }

    @Cacheable(value = "meals", key = "'available'")
    public List<MealDTO.Response> getAvailableMeals() {
        log.debug("Fetching available meals");

        return mealRepository.findByAvailableTrue().stream()
                .map(entityMapper::toDto)
                .toList();
    }

    public Page<MealDTO.Response> getAvailableMeals(Pageable pageable) {
        log.debug("Fetching available meals with pagination");

        return mealRepository.findByAvailableTrue(pageable)
                .map(entityMapper::toDto);
    }

    public Page<MealDTO.Response> getMealsByType(MealType type, Pageable pageable) {
        log.debug("Fetching meals by type: {}", type);

        return mealRepository.findByType(type, pageable)
                .map(entityMapper::toDto);
    }

    @Transactional
    @CacheEvict(value = "meals", allEntries = true)
    public MealDTO.Response updateMeal(Long id, @Valid MealDTO.Request request) {
        log.info("Updating meal with ID: {}", id);

        Meal meal = mealRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Meal", id));

        String oldValue = meal.toString();

        meal.setName(request.getName());
        meal.setDescription(request.getDescription());
        meal.setType(request.getType());
        meal.setPrice(request.getPrice());
        if (request.getAvailable() != null) {
            meal.setAvailable(request.getAvailable());
        }
        if (request.getDailyCapacity() != null) {
            meal.setDailyCapacity(request.getDailyCapacity());
        }

        Meal updatedMeal = mealRepository.save(meal);

        auditService.logUpdate("Meal", updatedMeal.getId(), oldValue, updatedMeal.toString());
        log.info("Meal updated with ID: {}", id);

        return entityMapper.toDto(updatedMeal);
    }

    @Transactional
    @CacheEvict(value = "meals", allEntries = true)
    public void deleteMeal(Long id) {
        log.info("Deleting meal with ID: {}", id);

        if (!mealRepository.existsById(id)) {
            throw new ResourceNotFoundException("Meal", id);
        }

        mealRepository.deleteById(id);

        auditService.logDelete("Meal", id, "Meal deleted");
        log.info("Meal deleted with ID: {}", id);
    }
}
