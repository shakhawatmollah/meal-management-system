package com.shakhawat.meal.service;

import com.shakhawat.meal.dto.ProfileDTO;
import com.shakhawat.meal.entity.Employee;
import com.shakhawat.meal.exception.ResourceNotFoundException;
import com.shakhawat.meal.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProfileService {

    private final EmployeeRepository employeeRepository;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public ProfileDTO.Response getCurrentProfile() {
        Employee employee = getCurrentEmployee();
        return toResponse(employee);
    }

    @Transactional
    public ProfileDTO.Response updateCurrentProfile(ProfileDTO.UpdateRequest request) {
        Employee employee = getCurrentEmployee();
        String oldValue = employee.toString();

        employee.setName(request.getName().trim());
        employee.setDepartment(request.getDepartment().trim());
        Employee updatedEmployee = employeeRepository.save(employee);

        auditService.logUpdate("EmployeeProfile", updatedEmployee.getId(), oldValue, updatedEmployee.toString());
        log.info("Profile updated for employeeId={}", updatedEmployee.getId());

        return toResponse(updatedEmployee);
    }

    private Employee getCurrentEmployee() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new AuthenticationCredentialsNotFoundException("Authentication credentials are required");
        }

        String email = authentication.getName();
        return employeeRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", email));
    }

    private ProfileDTO.Response toResponse(Employee employee) {
        return ProfileDTO.Response.builder()
                .id(employee.getId())
                .name(employee.getName())
                .email(employee.getEmail())
                .department(employee.getDepartment())
                .status(employee.getStatus())
                .roles(employee.getRoles().stream().map(Enum::name).collect(Collectors.toSet()))
                .build();
    }
}
