package com.shakhawat.meal.integration;

import com.shakhawat.meal.dto.*;
import com.shakhawat.meal.entity.*;
import com.shakhawat.meal.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@Transactional
class MealManagementIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private MealRepository mealRepository;

    @Autowired
    private MealOrderRepository orderRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private String adminToken;

    @BeforeEach
    void setUp() throws Exception {
        // Clean up
        orderRepository.deleteAll();
        mealRepository.deleteAll();
        employeeRepository.deleteAll();

        // Create admin user
        Employee admin = Employee.builder()
                .name("Admin User")
                .email("admin@test.com")
                .password(passwordEncoder.encode("12345678"))
                .department("IT")
                .status(EmployeeStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .build();
        admin.addRole(Role.ROLE_ADMIN);
        employeeRepository.save(admin);

        // Login as admin to get token
        AuthDTO.LoginRequest loginRequest = new AuthDTO.LoginRequest("admin@test.com", "12345678");

        MvcResult result = mockMvc.perform(post("/api/v1/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        String response = result.getResponse().getContentAsString();
        adminToken = objectMapper.readTree(response).get("data").get("accessToken").asText();
    }

    @Test
    @Order(1)
    @DisplayName("Integration Test: Complete Order Workflow")
    void completeOrderWorkflow() throws Exception {
        // Step 1: Register a new employee
        AuthDTO.RegisterRequest registerRequest = new AuthDTO.RegisterRequest(
                "Test Employee",
                "employee@test.com",
                "Password@123",
                "Engineering"
        );

        MvcResult registerResult = mockMvc.perform(post("/api/v1/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.email").value("employee@test.com"))
                .andReturn();

        String registerResponse = registerResult.getResponse().getContentAsString();
        Long createdEmployeeId = objectMapper.readTree(registerResponse).get("data").get("id").asLong();

        // Step 2: Login as employee
        AuthDTO.LoginRequest employeeLogin = new AuthDTO.LoginRequest("employee@test.com", "Password@123");

        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(employeeLogin)))
                .andExpect(status().isOk())
                .andReturn();

        String loginResponse = loginResult.getResponse().getContentAsString();
        String employeeToken = objectMapper.readTree(loginResponse).get("data").get("accessToken").asText();

        // Step 3: Admin creates a meal
        MealDTO.Request mealRequest = MealDTO.Request.builder()
                .name("Test Meal")
                .description("Delicious test meal")
                .type(MealType.LUNCH)
                .price(new BigDecimal("15.00"))
                .available(true)
                .dailyCapacity(100)
                .build();

        MvcResult mealResult = mockMvc.perform(post("/api/v1/meals")
                        .with(csrf())
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(mealRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.name").value("Test Meal"))
                .andReturn();

        String mealResponse = mealResult.getResponse().getContentAsString();
        Long createdMealId = objectMapper.readTree(mealResponse).get("data").get("id").asLong();

        // Step 4: Employee creates an order
        MealOrderDTO.Request orderRequest = MealOrderDTO.Request.builder()
                .employeeId(createdEmployeeId)
                .mealId(createdMealId)
                .orderDate(LocalDate.now().plusDays(1))
                .quantity(2)
                .build();

        MvcResult orderResult = mockMvc.perform(post("/api/v1/orders")
                        .with(csrf())
                        .header("Authorization", "Bearer " + employeeToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(orderRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.quantity").value(2))
                .andExpect(jsonPath("$.data.totalPrice").value(30.00))
                .andExpect(jsonPath("$.data.status").value("PENDING"))
                .andReturn();

        String orderResponse = orderResult.getResponse().getContentAsString();
        Long orderId = objectMapper.readTree(orderResponse).get("data").get("id").asLong();

        // Step 5: Verify duplicate order prevention
        mockMvc.perform(post("/api/v1/orders")
                        .with(csrf())
                        .header("Authorization", "Bearer " + employeeToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(orderRequest)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("already exists")));

        // Step 6: Admin updates order status
        mockMvc.perform(patch("/api/v1/orders/" + orderId + "/status")
                        .with(csrf())
                        .header("Authorization", "Bearer " + adminToken)
                        .param("status", "CONFIRMED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("CONFIRMED"));

        // Step 7: Employee cancels order (should fail if status is not PENDING)
        mockMvc.perform(patch("/api/v1/orders/" + orderId + "/status")
                        .with(csrf())
                        .header("Authorization", "Bearer " + adminToken)
                        .param("status", "PENDING"))
                .andExpect(status().isOk());

        // Now cancel should succeed
        mockMvc.perform(delete("/api/v1/orders/" + orderId)
                        .with(csrf())
                        .header("Authorization", "Bearer " + employeeToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Order cancelled successfully"));

        // Step 8: Verify order is cancelled in database
        MealOrder cancelledOrder = orderRepository.findById(orderId).orElseThrow();
        assertThat(cancelledOrder.getStatus()).isEqualTo(OrderStatus.CANCELLED);

        // Step 9: Verify budget was refunded
        Employee updatedEmployee = employeeRepository.findById(createdEmployeeId).orElseThrow();
        assertThat(updatedEmployee.getCurrentMonthSpent()).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    @Order(2)
    @DisplayName("Integration Test: Budget and Limit Enforcement")
    void budgetAndLimitEnforcement() throws Exception {
        // Create employee with low budget
        Employee employee = Employee.builder()
                .name("Limited Budget Employee")
                .email("limited@test.com")
                .password(passwordEncoder.encode("Password@123"))
                .department("IT")
                .status(EmployeeStatus.ACTIVE)
                .monthlyBudget(new BigDecimal("20.00")) // Only $20
                .monthlyOrderLimit(2) // Only 2 orders
                .createdAt(LocalDateTime.now())
                .build();
        employee.addRole(Role.ROLE_EMPLOYEE);
        Employee savedEmployee = employeeRepository.save(employee);

        // Create meal
        Meal meal = Meal.builder()
                .name("Expensive Meal")
                .description("Very expensive")
                .type(MealType.DINNER)
                .price(new BigDecimal("15.00"))
                .available(true)
                .createdAt(LocalDateTime.now())
                .build();
        Meal savedMeal = mealRepository.save(meal);

        // Login as limited employee
        AuthDTO.LoginRequest loginRequest = new AuthDTO.LoginRequest("limited@test.com", "Password@123");
        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        String token = objectMapper.readTree(loginResult.getResponse().getContentAsString())
                .get("data").get("accessToken").asText();

        // First order should succeed
        MealOrderDTO.Request order1 = MealOrderDTO.Request.builder()
                .employeeId(savedEmployee.getId())
                .mealId(savedMeal.getId())
                .orderDate(LocalDate.now().plusDays(1))
                .quantity(1)
                .build();

        mockMvc.perform(post("/api/v1/orders")
                        .with(csrf())
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(order1)))
                .andExpect(status().isCreated());

        // Second order should fail due to budget
        MealOrderDTO.Request order2 = MealOrderDTO.Request.builder()
                .employeeId(savedEmployee.getId())
                .mealId(savedMeal.getId())
                .orderDate(LocalDate.now().plusDays(2))
                .quantity(1)
                .build();

        mockMvc.perform(post("/api/v1/orders")
                        .with(csrf())
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(order2)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("budget exceeded")));
    }

    @Test
    @Order(3)
    @DisplayName("Integration Test: Inventory Management")
    void inventoryManagement() throws Exception {
        // Create employee
        Employee employee = Employee.builder()
                .name("Test Employee")
                .email("inventory@test.com")
                .password(passwordEncoder.encode("Password@123"))
                .department("IT")
                .status(EmployeeStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .build();
        employee.addRole(Role.ROLE_EMPLOYEE);
        Employee savedEmployee = employeeRepository.save(employee);

        // Create meal with limited capacity
        Meal meal = Meal.builder()
                .name("Limited Meal")
                .description("Only 2 available")
                .type(MealType.LUNCH)
                .price(new BigDecimal("10.00"))
                .available(true)
                .dailyCapacity(2) // Only 2 available
                .createdAt(LocalDateTime.now())
                .build();
        Meal savedMeal = mealRepository.save(meal);

        // Login
        AuthDTO.LoginRequest loginRequest = new AuthDTO.LoginRequest("inventory@test.com", "Password@123");
        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        String token = objectMapper.readTree(loginResult.getResponse().getContentAsString())
                .get("data").get("accessToken").asText();

        LocalDate orderDate = LocalDate.now().plusDays(1);

        // Order 2 meals (should succeed)
        MealOrderDTO.Request order1 = MealOrderDTO.Request.builder()
                .employeeId(savedEmployee.getId())
                .mealId(savedMeal.getId())
                .orderDate(orderDate)
                .quantity(2)
                .build();

        mockMvc.perform(post("/api/v1/orders")
                        .with(csrf())
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(order1)))
                .andExpect(status().isCreated());

        // Create another employee
        Employee employee2 = Employee.builder()
                .name("Second Employee")
                .email("inventory2@test.com")
                .password(passwordEncoder.encode("Password@123"))
                .department("HR")
                .status(EmployeeStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .build();
        employee2.addRole(Role.ROLE_EMPLOYEE);
        Employee savedEmployee2 = employeeRepository.save(employee2);

        // Try to order more (should fail due to insufficient inventory)
        MealOrderDTO.Request order2 = MealOrderDTO.Request.builder()
                .employeeId(savedEmployee2.getId())
                .mealId(savedMeal.getId())
                .orderDate(orderDate)
                .quantity(1)
                .build();

        mockMvc.perform(post("/api/v1/orders")
                        .with(csrf())
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(order2)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("Insufficient")));
    }
}
