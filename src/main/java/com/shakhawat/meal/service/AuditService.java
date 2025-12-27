package com.shakhawat.meal.service;

import com.shakhawat.meal.entity.AuditLog;
import com.shakhawat.meal.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    @Async
    @Transactional
    public void logCreate(String entityType, Long entityId, String newValue) {
        log.debug("Logging CREATE action for {} with ID: {}", entityType, entityId);

        AuditLog auditLog = AuditLog.builder()
                .entityType(entityType)
                .entityId(entityId)
                .action("CREATE")
                .userId(getCurrentUserId())
                .timestamp(LocalDateTime.now())
                .newValue(newValue)
                .build();

        auditLogRepository.save(auditLog);
    }

    @Async
    @Transactional
    public void logUpdate(String entityType, Long entityId, String oldValue, String newValue) {
        log.debug("Logging UPDATE action for {} with ID: {}", entityType, entityId);

        AuditLog auditLog = AuditLog.builder()
                .entityType(entityType)
                .entityId(entityId)
                .action("UPDATE")
                .userId(getCurrentUserId())
                .timestamp(LocalDateTime.now())
                .oldValue(oldValue)
                .newValue(newValue)
                .build();

        auditLogRepository.save(auditLog);
    }

    @Async
    @Transactional
    public void logDelete(String entityType, Long entityId, String oldValue) {
        log.debug("Logging DELETE action for {} with ID: {}", entityType, entityId);

        AuditLog auditLog = AuditLog.builder()
                .entityType(entityType)
                .entityId(entityId)
                .action("DELETE")
                .userId(getCurrentUserId())
                .timestamp(LocalDateTime.now())
                .oldValue(oldValue)
                .build();

        auditLogRepository.save(auditLog);
    }

    private String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            return authentication.getName();
        }
        return "SYSTEM";
    }
}
