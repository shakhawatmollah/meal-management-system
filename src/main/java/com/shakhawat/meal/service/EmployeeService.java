package com.shakhawat.meal.service;

import com.shakhawat.meal.dto.EmployeeDTO;
import com.shakhawat.meal.entity.Employee;
import com.shakhawat.meal.exception.*;
import com.shakhawat.meal.repository.EmployeeRepository;
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

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Validated
@Slf4j
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final EntityMapper entityMapper;
    private final AuditService auditService;

    @Transactional
    @CacheEvict(value = "employees", allEntries = true)
    public EmployeeDTO.Response createEmployee(@Valid EmployeeDTO.Request request) {
        log.info("Creating employee with email: {}", request.getEmail());

        if (employeeRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Employee with email " + request.getEmail() + " already exists");
        }

        Employee employee = entityMapper.toEntity(request);
        Employee savedEmployee = employeeRepository.save(employee);

        auditService.logCreate("Employee", savedEmployee.getId(), savedEmployee.toString());
        log.info("Employee created with ID: {}", savedEmployee.getId());

        return entityMapper.toDto(savedEmployee);
    }

    @Cacheable(value = "employees", key = "#id")
    public EmployeeDTO.Response getEmployeeById(Long id) {
        log.debug("Fetching employee with ID: {}", id);

        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", id));
        return entityMapper.toDto(employee);
    }

    public Page<EmployeeDTO.Response> getAllEmployees(Pageable pageable) {
        log.debug("Fetching all employees with pagination: {}", pageable);

        return employeeRepository.findAll(pageable)
                .map(entityMapper::toDto);
    }

    @Transactional
    @CacheEvict(value = "employees", key = "#id")
    public EmployeeDTO.Response updateEmployee(Long id, @Valid EmployeeDTO.Request request) {
        log.info("Updating employee with ID: {}", id);

        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", id));

        String oldValue = employee.toString();

        if (!employee.getEmail().equals(request.getEmail()) &&
                employeeRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Employee with email " + request.getEmail() + " already exists");
        }

        employee.setName(request.getName());
        employee.setEmail(request.getEmail());
        employee.setDepartment(request.getDepartment());
        if (request.getStatus() != null) {
            employee.setStatus(request.getStatus());
        }
        if (request.getRoles() != null && !request.getRoles().isEmpty()) {
            employee.setRoles(request.getRoles());
        }

        Employee updatedEmployee = employeeRepository.save(employee);

        auditService.logUpdate("Employee", updatedEmployee.getId(), oldValue, updatedEmployee.toString());
        log.info("Employee updated with ID: {}", id);

        return entityMapper.toDto(updatedEmployee);
    }

    @Transactional
    @CacheEvict(value = "employees", key = "#id")
    public void deleteEmployee(Long id) {
        log.info("Deleting employee with ID: {}", id);

        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", id));

        employeeRepository.delete(employee); // Soft delete via @SQLDelete

        auditService.logDelete("Employee", id, employee.toString());
        log.info("Employee deleted with ID: {}", id);
    }
}
