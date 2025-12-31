package com.shakhawat.meal.repository;

import com.shakhawat.meal.entity.Meal;
import com.shakhawat.meal.entity.MealType;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import static org.assertj.core.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
class MealRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private MealRepository mealRepository;

    @BeforeEach
    void setUp() {
        // Create test meals
        Meal breakfast = Meal.builder()
                .name("Continental Breakfast")
                .description("Eggs, toast, coffee")
                .type(MealType.BREAKFAST)
                .price(new BigDecimal("8.50"))
                .available(true)
                .dailyCapacity(100)
                .createdAt(LocalDateTime.now())
                .build();

        Meal lunch = Meal.builder()
                .name("Chicken Biryani")
                .description("Aromatic rice with chicken")
                .type(MealType.LUNCH)
                .price(new BigDecimal("12.00"))
                .available(true)
                .dailyCapacity(150)
                .createdAt(LocalDateTime.now())
                .build();

        Meal dinner = Meal.builder()
                .name("Grilled Salmon")
                .description("Salmon with vegetables")
                .type(MealType.DINNER)
                .price(new BigDecimal("15.00"))
                .available(false)
                .dailyCapacity(80)
                .createdAt(LocalDateTime.now())
                .build();

        entityManager.persist(breakfast);
        entityManager.persist(lunch);
        entityManager.persist(dinner);
        entityManager.flush();
    }

    @Test
    @DisplayName("Should find meals by type")
    void shouldFindMealsByType() {
        // When
        List<Meal> breakfastMeals = mealRepository.findByType(MealType.BREAKFAST, null).getContent();
        List<Meal> lunchMeals = mealRepository.findByType(MealType.LUNCH, null).getContent();

        // Then
        assertThat(breakfastMeals).hasSize(1);
        assertThat(breakfastMeals.getFirst().getName()).isEqualTo("Continental Breakfast");

        assertThat(lunchMeals).hasSize(1);
        assertThat(lunchMeals.getFirst().getName()).isEqualTo("Chicken Biryani");
    }

    @Test
    @DisplayName("Should find only available meals")
    void shouldFindOnlyAvailableMeals() {
        // When
        List<Meal> availableMeals = mealRepository.findByAvailableTrue();

        // Then
        assertThat(availableMeals).hasSize(2);
        assertThat(availableMeals)
                .extracting(Meal::getName)
                .containsExactlyInAnyOrder("Continental Breakfast", "Chicken Biryani");
    }

    @Test
    @DisplayName("Should find available meals by type")
    void shouldFindAvailableMealsByType() {
        // When
        List<Meal> availableBreakfast = mealRepository.findAvailableMealsByType(MealType.BREAKFAST);
        List<Meal> availableDinner = mealRepository.findAvailableMealsByType(MealType.DINNER);

        // Then
        assertThat(availableBreakfast).hasSize(1);
        assertThat(availableDinner).isEmpty(); // Dinner is not available
    }

    @Test
    @DisplayName("Should save meal with all properties")
    void shouldSaveMealWithAllProperties() {
        // Given
        Meal snack = Meal.builder()
                .name("Fresh Fruit Bowl")
                .description("Seasonal fruits")
                .type(MealType.SNACK)
                .price(new BigDecimal("5.00"))
                .available(true)
                .dailyCapacity(200)
                .createdAt(LocalDateTime.now())
                .build();

        // When
        Meal saved = mealRepository.save(snack);
        entityManager.flush();

        // Then
        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getPrice()).isEqualByComparingTo(new BigDecimal("5.00"));
        assertThat(saved.getDailyCapacity()).isEqualTo(200);
        assertThat(saved.getCreatedAt()).isNotNull();
        assertThat(saved.getVersion()).isEqualTo(0L);
    }
}
