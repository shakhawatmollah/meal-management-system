package com.shakhawat.meal.repository;

import com.shakhawat.meal.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    Page<AuditLog> findByEntityTypeAndEntityId(String entityType, Long entityId, Pageable pageable);
    Page<AuditLog> findByUserId(String userId, Pageable pageable);
    Page<AuditLog> findByTimestampBetween(LocalDateTime start, LocalDateTime end, Pageable pageable);

    // Report-specific queries
    @Query("SELECT al FROM AuditLog al " +
           "WHERE al.timestamp BETWEEN :start AND :end " +
           "ORDER BY al.timestamp DESC")
    List<AuditLog> findByTimestampBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT al.action, COUNT(*) FROM AuditLog al " +
           "WHERE al.timestamp BETWEEN :start AND :end " +
           "GROUP BY al.action " +
           "ORDER BY COUNT(*) DESC")
    List<Object[]> findActionStats(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT al.userId, COUNT(*), MIN(al.timestamp), MAX(al.timestamp) FROM AuditLog al " +
           "WHERE al.timestamp BETWEEN :start AND :end " +
           "GROUP BY al.userId " +
           "ORDER BY COUNT(*) DESC")
    List<Object[]> findUserActivityStats(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT al.entityType, COUNT(*) FROM AuditLog al " +
           "WHERE al.timestamp BETWEEN :start AND :end " +
           "GROUP BY al.entityType " +
           "ORDER BY COUNT(*) DESC")
    List<Object[]> findEntityActivityStats(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
