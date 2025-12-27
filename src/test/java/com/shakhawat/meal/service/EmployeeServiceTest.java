package com.shakhawat.meal.service;

import com.shakhawat.meal.dto.EmployeeDTO;
import com.shakhawat.meal.entity.Employee;
import com.shakhawat.meal.entity.EmployeeStatus;
import com.shakhawat.meal.entity.Role;
import com.shakhawat.meal.exception.DuplicateResourceException;
import com.shakhawat.meal.exception.ResourceNotFoundException;
import com.shakhawat.meal.repository.EmployeeRepository;
import com.shakhawat.meal.util.EntityMapper;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;
import java.math.BigDecimal;
import java.util.*;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmployeeServiceTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private EntityMapper entityMapper;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private EmployeeService employeeService;

    private EmployeeDTO.Request employeeRequest;
    private Employee employee;
    private EmployeeDTO.Response employeeResponse;

    @BeforeEach
    void setUp() {
        employeeRequest = EmployeeDTO.Request.builder()
                .name("John Doe")
                .email("john@example.com")
                .password("Password@123")
                .department("IT")
                .status(EmployeeStatus.ACTIVE)
                .build();

        employee = Employee.builder()
                .id(1L)
                .name("John Doe")
                .email("john@example.com")
                .password("$2a$12$encoded_password")
                .department("IT")
                .status(EmployeeStatus.ACTIVE)
                .monthlyBudget(new BigDecimal("500.00"))
                .currentMonthSpent(BigDecimal.ZERO)
                .build();
        employee.addRole(Role.ROLE_EMPLOYEE);

        employeeResponse = EmployeeDTO.Response.builder()
                .id(1L)
                .name("John Doe")
                .email("john@example.com")
                .department("IT")
                .status(EmployeeStatus.ACTIVE)
                .build();
    }

    @Nested
    @DisplayName("Create Employee Tests")
    class CreateEmployeeTests {

        @Test
        @DisplayName("Should create employee successfully")
        void shouldCreateEmployeeSuccessfully() {
            // Given
            when(employeeRepository.existsByEmail(anyString())).thenReturn(false);
            when(entityMapper.toEntity((EmployeeDTO.Request) any())).thenReturn(employee);
            when(employeeRepository.save(any())).thenReturn(employee);
            when(entityMapper.toDto(any(Employee.class))).thenReturn(employeeResponse);

            // When
            EmployeeDTO.Response result = employeeService.createEmployee(employeeRequest);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.getName()).isEqualTo("John Doe");
            assertThat(result.getEmail()).isEqualTo("john@example.com");

            verify(employeeRepository).existsByEmail("john@example.com");
            verify(employeeRepository).save(any(Employee.class));
            verify(auditService).logCreate(eq("Employee"), eq(1L), anyString());
        }

        @Test
        @DisplayName("Should throw exception when email already exists")
        void shouldThrowExceptionWhenEmailExists() {
            // Given
            when(employeeRepository.existsByEmail(anyString())).thenReturn(true);

            // When & Then
            assertThatThrownBy(() -> employeeService.createEmployee(employeeRequest))
                    .isInstanceOf(DuplicateResourceException.class)
                    .hasMessageContaining("already exists");

            verify(employeeRepository).existsByEmail("john@example.com");
            verify(employeeRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should sanitize input during creation")
        void shouldSanitizeInputDuringCreation() {
            // Given
            EmployeeDTO.Request requestWithScript = EmployeeDTO.Request.builder()
                    .name("<script>alert('xss')</script>John")
                    .email("john@example.com")
                    .password("Password@123")
                    .department("IT<script>")
                    .build();

            when(employeeRepository.existsByEmail(anyString())).thenReturn(false);
            when(entityMapper.toEntity((EmployeeDTO.Request) any())).thenReturn(employee);
            when(employeeRepository.save(any())).thenReturn(employee);
            when(entityMapper.toDto(any(Employee.class))).thenReturn(employeeResponse);

            // When
            employeeService.createEmployee(requestWithScript);

            // Then
            verify(entityMapper).toEntity(any(EmployeeDTO.Request.class));
            verify(employeeRepository).save(any(Employee.class));
        }
    }

    @Nested
    @DisplayName("Get Employee Tests")
    class GetEmployeeTests {

        @Test
        @DisplayName("Should get employee by ID successfully")
        void shouldGetEmployeeByIdSuccessfully() {
            // Given
            when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));
            when(entityMapper.toDto(any(Employee.class))).thenReturn(employeeResponse);

            // When
            EmployeeDTO.Response result = employeeService.getEmployeeById(1L);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.getId()).isEqualTo(1L);
            verify(employeeRepository).findById(1L);
        }

        @Test
        @DisplayName("Should throw exception when employee not found")
        void shouldThrowExceptionWhenEmployeeNotFound() {
            // Given
            when(employeeRepository.findById(999L)).thenReturn(Optional.empty());

            // When & Then
            assertThatThrownBy(() -> employeeService.getEmployeeById(999L))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("not found");

            verify(employeeRepository).findById(999L);
        }

        @Test
        @DisplayName("Should get all employees with pagination")
        void shouldGetAllEmployeesWithPagination() {
            // Given
            Pageable pageable = PageRequest.of(0, 10);
            List<Employee> employees = Collections.singletonList(employee);
            Page<Employee> page = new PageImpl<>(employees, pageable, 1);

            when(employeeRepository.findAll(pageable)).thenReturn(page);
            when(entityMapper.toDto(any(Employee.class))).thenReturn(employeeResponse);

            // When
            Page<EmployeeDTO.Response> result = employeeService.getAllEmployees(pageable);

            // Then
            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getTotalElements()).isEqualTo(1);
            verify(employeeRepository).findAll(pageable);
        }
    }

    @Nested
    @DisplayName("Update Employee Tests")
    class UpdateEmployeeTests {

        @Test
        @DisplayName("Should update employee successfully")
        void shouldUpdateEmployeeSuccessfully() {
            // Given
            when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));
            when(employeeRepository.existsByEmail(anyString())).thenReturn(false);
            when(employeeRepository.save(any())).thenReturn(employee);
            when(entityMapper.toDto(any(Employee.class))).thenReturn(employeeResponse);

            EmployeeDTO.Request updateRequest = EmployeeDTO.Request.builder()
                    .name("John Updated")
                    .email("john@example.com")
                    .password("NewPassword@123")
                    .department("Engineering")
                    .build();

            // When
            EmployeeDTO.Response result = employeeService.updateEmployee(1L, updateRequest);

            // Then
            assertThat(result).isNotNull();
            verify(employeeRepository).findById(1L);
            verify(employeeRepository).save(any(Employee.class));
            verify(auditService).logUpdate(eq("Employee"), eq(1L), anyString(), anyString());
        }

        @Test
        @DisplayName("Should throw exception when updating with existing email")
        void shouldThrowExceptionWhenUpdatingWithExistingEmail() {
            // Given
            when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));
            when(employeeRepository.existsByEmail("jane@example.com")).thenReturn(true);

            EmployeeDTO.Request updateRequest = EmployeeDTO.Request.builder()
                    .name("John Doe")
                    .email("jane@example.com") // Different email that exists
                    .password("Password@123")
                    .department("IT")
                    .build();

            // When & Then
            assertThatThrownBy(() -> employeeService.updateEmployee(1L, updateRequest))
                    .isInstanceOf(DuplicateResourceException.class);

            verify(employeeRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("Delete Employee Tests")
    class DeleteEmployeeTests {

        @Test
        @DisplayName("Should delete employee successfully (soft delete)")
        void shouldDeleteEmployeeSuccessfully() {
            // Given
            when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));
            doNothing().when(employeeRepository).delete((Employee) any());

            // When
            employeeService.deleteEmployee(1L);

            // Then
            verify(employeeRepository).findById(1L);
            verify(employeeRepository).delete(employee);
            verify(auditService).logDelete(eq("Employee"), eq(1L), anyString());
        }

        @Test
        @DisplayName("Should throw exception when deleting non-existent employee")
        void shouldThrowExceptionWhenDeletingNonExistentEmployee() {
            // Given
            when(employeeRepository.findById(999L)).thenReturn(Optional.empty());

            // When & Then
            assertThatThrownBy(() -> employeeService.deleteEmployee(999L))
                    .isInstanceOf(ResourceNotFoundException.class);

            verify(employeeRepository, never()).delete((Employee) any());
        }
    }
}
