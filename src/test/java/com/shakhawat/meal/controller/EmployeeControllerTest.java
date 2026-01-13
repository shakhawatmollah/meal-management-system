package com.shakhawat.meal.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.shakhawat.meal.dto.EmployeeDTO;
import com.shakhawat.meal.entity.EmployeeStatus;
import com.shakhawat.meal.exception.DuplicateResourceException;
import com.shakhawat.meal.exception.ResourceNotFoundException;
import com.shakhawat.meal.security.JwtAuthenticationFilter;
import com.shakhawat.meal.service.EmployeeService;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.data.domain.*;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc(addFilters = false)
class EmployeeControllerTest {

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    MockMvc mockMvc;

    @MockitoBean
    EmployeeService employeeService;

    @MockitoBean
    JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockitoBean
    UserDetailsService userDetailsService;

    private EmployeeDTO.Request createRequest;
    private EmployeeDTO.Response employeeResponse;

    @BeforeEach
    void setUp() {
        // Use EmployeeDTO.Request for the request
        createRequest = EmployeeDTO.Request.builder()
                .name("John Doe")
                .email("john@example.com")
                .password("SecurePass@123")
                .department("IT")
                .status(EmployeeStatus.ACTIVE)
                .monthlyBudget(new BigDecimal("500.00"))
                .monthlyOrderLimit(30)
                .build();

        // Use EmployeeDTO.Response for the response
        employeeResponse = EmployeeDTO.Response.builder()
                .id(1L)
                .name("John Doe")
                .email("john@example.com")
                .department("IT")
                .status(EmployeeStatus.ACTIVE)
                .monthlyBudget(new BigDecimal("500.00"))
                .currentMonthSpent(BigDecimal.ZERO)
                .monthlyOrderLimit(30)
                .accountNonLocked(true)
                .build();
    }

    @Nested
    @DisplayName("Create Employee Tests")
    @WithMockUser(roles = "ADMIN")
    class CreateEmployeeTests {

        @Test
        @DisplayName("Should create employee with valid data")
        void shouldCreateEmployeeWithValidData() throws Exception {
            // Given
            EmployeeDTO.Request request = EmployeeDTO.Request.builder()
                    .name("John Doe")
                    .email("john@example.com")
                    .password("Password@123")
                    .department("IT")
                    .build();

            EmployeeDTO.Response response = EmployeeDTO.Response.builder()
                    .id(1L)
                    .name("John Doe")
                    .email("john@example.com")
                    .department("IT")
                    .status(EmployeeStatus.ACTIVE)
                    .build();

            when(employeeService.createEmployee(any())).thenReturn(response);

            // When & Then
            mockMvc.perform(post("/api/v1/employees")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.name").value("John Doe"));

            verify(employeeService).createEmployee(any(EmployeeDTO.Request.class));
        }

        @Test
        @DisplayName("Should return 400 when name is blank")
        void shouldReturn400WhenNameIsBlank() throws Exception {
            // Given
            EmployeeDTO.Request request = EmployeeDTO.Request.builder()
                    .name("") // Blank name
                    .email("john@example.com")
                    .password("Password@123")
                    .department("IT")
                    .build();

            // When & Then
            mockMvc.perform(post("/api/v1/employees")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error").value("Validation Failed"));

            verify(employeeService, never()).createEmployee(any());
        }
    }

    @Nested
    @DisplayName("Get Employee Tests")
    @WithMockUser(roles = "ADMIN")
    class GetEmployeeTests {

        @Test
        @DisplayName("Should get employee by ID")
        void shouldGetEmployeeById() throws Exception {
            // Given
            EmployeeDTO.Response response = EmployeeDTO.Response.builder()
                    .id(1L)
                    .name("John Doe")
                    .email("john@example.com")
                    .department("IT")
                    .status(EmployeeStatus.ACTIVE)
                    .build();

            when(employeeService.getEmployeeById(1L)).thenReturn(response);

            // When & Then
            mockMvc.perform(get("/api/v1/employees/1")
                            .with(csrf()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.id").value(1))
                    .andExpect(jsonPath("$.data.name").value("John Doe"));
        }

        @Test
        @DisplayName("Should get all employees with pagination")
        void shouldGetAllEmployeesWithPagination() throws Exception {
            // Given
            EmployeeDTO.Response response1 = EmployeeDTO.Response.builder()
                    .id(1L)
                    .name("John Doe")
                    .email("john@example.com")
                    .department("IT")
                    .build();

            EmployeeDTO.Response response2 = EmployeeDTO.Response.builder()
                    .id(2L)
                    .name("Jane Doe")
                    .email("jane@example.com")
                    .department("HR")
                    .build();

            Page<EmployeeDTO.Response> page = new PageImpl<>(
                    Arrays.asList(response1, response2),
                    PageRequest.of(0, 20),
                    2
            );

            when(employeeService.getAllEmployees(any(Pageable.class))).thenReturn(page);

            // When & Then
            mockMvc.perform(get("/api/v1/employees")
                            .param("page", "0")
                            .param("size", "20")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data").isArray())
                    .andExpect(jsonPath("$.data.length()").value(2))
                    .andExpect(jsonPath("$.data[0].name").value("John Doe"))
                    .andExpect(jsonPath("$.data[0].email").value("john@example.com"))
                    .andExpect(jsonPath("$.data[1].name").value("Jane Doe"))
                    .andExpect(jsonPath("$.pagination.page").value(0))
                    .andExpect(jsonPath("$.pagination.size").value(20))
                    .andExpect(jsonPath("$.pagination.totalElements").value(2))
                    .andExpect(jsonPath("$.pagination.totalPages").value(1));
        }
    }

    @Nested
    @DisplayName("Security Tests")
    class SecurityTests {

        @Test
        @DisplayName("Should return 403 when employee tries to create employee")
        @WithMockUser(roles = "EMPLOYEE")
        void shouldReturn403WhenEmployeeTriesToCreate() throws Exception {
            // When & Then
            mockMvc.perform(post("/api/v1/employees")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(createRequest)))
                    .andDo(print())
                    .andExpect(status().isForbidden());

            verify(employeeService, never()).createEmployee(any(EmployeeDTO.Request.class));
        }

        @Test
        @DisplayName("Should return 401 when unauthenticated")
        void shouldReturn401WhenUnauthenticated() throws Exception {
            // When & Then
            mockMvc.perform(post("/api/v1/employees")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(createRequest)))
                    .andDo(print())
                    .andExpect(status().isUnauthorized());

            verify(employeeService, never()).createEmployee(any());
        }

        @Test
        @DisplayName("Should return 400 for validation errors")
        @WithMockUser(roles = "ADMIN")
        void shouldReturn400ForValidationErrors() throws Exception {
            // Given - Invalid request (empty required fields)
            EmployeeDTO.Request invalidRequest = EmployeeDTO.Request.builder()
                    .email("invalid-email") // Invalid format
                    .password("short") // Too short
                    .build();

            // When & Then
            mockMvc.perform(post("/api/v1/employees")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(invalidRequest)))
                    .andDo(print())
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error").value("Validation Failed"))
                    .andExpect(jsonPath("$.validationErrors.name").value("Name is required"))
                    .andExpect(jsonPath("$.validationErrors.email").value("Invalid email format"))
                    .andExpect(jsonPath("$.validationErrors.password").value("Password must be at least 8 characters"))
                    .andExpect(jsonPath("$.validationErrors.department").value("Department is required"));

            verify(employeeService, never()).createEmployee(any());
        }

        @Test
        @DisplayName("Should get all employees")
        @WithMockUser(roles = "ADMIN")
        void shouldGetAllEmployees() throws Exception {
            // Given
            EmployeeDTO.Response emp1 = EmployeeDTO.Response.builder()
                    .id(1L)
                    .name("John Doe")
                    .email("john@example.com")
                    .department("IT")
                    .status(EmployeeStatus.ACTIVE)
                    .build();

            EmployeeDTO.Response emp2 = EmployeeDTO.Response.builder()
                    .id(2L)
                    .name("Jane Doe")
                    .email("jane@example.com")
                    .department("HR")
                    .status(EmployeeStatus.ACTIVE)
                    .build();

            Page<EmployeeDTO.Response> employeePage = new PageImpl<>(List.of(emp1, emp2));
            Pageable pageable = PageRequest.of(0, 20, Sort.by(Sort.Direction.ASC, "id"));

            // Mock
            when(employeeService.getAllEmployees(pageable))
                    .thenReturn(employeePage);

            // When & Then
            mockMvc.perform(get("/api/v1/employees")
                            .param("page", "0")
                            .param("size", "20")
                            .param("sortBy", "id")
                            .param("direction", "ASC")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data").isArray())
                    .andExpect(jsonPath("$.data.length()").value(2))
                    .andExpect(jsonPath("$.data[0].id").value(1))
                    .andExpect(jsonPath("$.data[0].name").value("John Doe"))
                    .andExpect(jsonPath("$.data[1].id").value(2))
                    .andExpect(jsonPath("$.pagination.totalElements").value(2));
        }

        @Test
        @DisplayName("Should get employee by ID")
        @WithMockUser(roles = "ADMIN")
        void shouldGetEmployeeById() throws Exception {
            // Given
            when(employeeService.getEmployeeById(1L))
                    .thenReturn(employeeResponse);

            // When & Then
            mockMvc.perform(get("/api/v1/employees/1")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.id").value(1))
                    .andExpect(jsonPath("$.data.name").value("John Doe"))
                    .andExpect(jsonPath("$.data.email").value("john@example.com"));
        }

        @Test
        @DisplayName("Should return 404 when employee not found")
        @WithMockUser(roles = "ADMIN")
        void shouldReturn404WhenEmployeeNotFound() throws Exception {
            // Given
            when(employeeService.getEmployeeById(999L))
                    .thenThrow(new ResourceNotFoundException("Employee", "999"));

            // When & Then
            mockMvc.perform(get("/api/v1/employees/999")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andDo(print())
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.error").exists());
        }

        @Test
        @DisplayName("Should update employee")
        @WithMockUser(roles = "ADMIN")
        void shouldUpdateEmployee() throws Exception {
            // Given
            EmployeeDTO.Request updateRequest = EmployeeDTO.Request.builder()
                    .name("John Doe Updated")
                    .email("john.updated@example.com")
                    .password("NewPassword@123")
                    .department("Engineering")
                    .status(EmployeeStatus.ACTIVE)
                    .monthlyBudget(new BigDecimal("750.00"))
                    .monthlyOrderLimit(40)
                    .build();

            EmployeeDTO.Response updatedResponse = EmployeeDTO.Response.builder()
                    .id(1L)
                    .name("John Doe Updated")
                    .email("john.updated@example.com")
                    .department("Engineering")
                    .status(EmployeeStatus.ACTIVE)
                    .monthlyBudget(new BigDecimal("750.00"))
                    .monthlyOrderLimit(40)
                    .accountNonLocked(true)
                    .build();

            when(employeeService.updateEmployee(eq(1L), any(EmployeeDTO.Request.class)))
                    .thenReturn(updatedResponse);

            // When & Then
            mockMvc.perform(put("/api/v1/employees/1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(updateRequest)))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.name").value("John Doe Updated"))
                    .andExpect(jsonPath("$.data.department").value("Engineering"))
                    .andExpect(jsonPath("$.data.monthlyBudget").value(750.00));
        }

        @Test
        @DisplayName("Should delete employee")
        @WithMockUser(roles = "ADMIN")
        void shouldDeleteEmployee() throws Exception {
            // Given
            doNothing().when(employeeService).deleteEmployee(1L);

            // When & Then
            mockMvc.perform(delete("/api/v1/employees/1")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.message").exists());

            verify(employeeService, times(1)).deleteEmployee(1L);
        }

        @Test
        @DisplayName("Should return 409 when employee already exists")
        @WithMockUser(roles = "ADMIN") // <-- Authenticate as admin
        void shouldReturn409WhenEmployeeExists() throws Exception {
            // Given
            when(employeeService.createEmployee(any()))
                    .thenThrow(new DuplicateResourceException("Employee with email john@example.com already exists"));

            // When & Then
            mockMvc.perform(post("/api/v1/employees")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(createRequest)))
                    .andExpect(status().isConflict())
                    .andExpect(jsonPath("$.success").value(false))
                    .andExpect(jsonPath("$.message")
                            .value("Employee with email john@example.com already exists"));

            verify(employeeService).createEmployee(any());
        }

    }
}
