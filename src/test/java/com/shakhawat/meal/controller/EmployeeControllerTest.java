package com.shakhawat.meal.controller;

import com.shakhawat.meal.dto.EmployeeDTO;
import com.shakhawat.meal.entity.EmployeeStatus;
import com.shakhawat.meal.service.EmployeeService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.data.domain.*;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import java.util.Arrays;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(EmployeeController.class)
@ActiveProfiles("test")
class EmployeeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private EmployeeService employeeService;

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
                            .with(csrf())
                            .param("page", "0")
                            .param("size", "20"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.content").isArray())
                    .andExpect(jsonPath("$.data.content.length()").value(2));
        }
    }

    @Nested
    @DisplayName("Security Tests")
    class SecurityTests {

        @Test
        @DisplayName("Should return 401 when not authenticated")
        void shouldReturn401WhenNotAuthenticated() throws Exception {
            mockMvc.perform(get("/api/v1/employees"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @WithMockUser(roles = "EMPLOYEE") // Not ADMIN
        @DisplayName("Should return 403 when user lacks admin role")
        void shouldReturn403WhenUserLacksAdminRole() throws Exception {
            mockMvc.perform(post("/api/v1/employees")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().isForbidden());
        }
    }
}
