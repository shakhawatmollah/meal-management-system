package com.shakhawat.meal.dto.reports;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditReport {
    
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer totalActions;
    private List<ActionStats> actionBreakdown;
    private List<UserActivityStats> userActivity;
    private Map<String, Integer> entityActivity;
    private List<SuspiciousActivity> suspiciousActivity;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ActionStats {
        private String action;
        private Integer actionCount;
        private Double percentageOfTotal;
        private LocalDateTime firstAction;
        private LocalDateTime lastAction;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserActivityStats {
        private String userId;
        private Integer actionCount;
        private List<String> actionsPerformed;
        private LocalDateTime lastActivity;
        private String mostFrequentAction;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SuspiciousActivity {
        private String userId;
        private String action;
        private LocalDateTime timestamp;
        private String entityType;
        private String reason;
        private String ipAddress;
    }
}
