package com.pedaerial.operatorflightcheck.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MissionResponse {
    private String id;
    private String clientId;
    private String clientName;
    private String droneProfileId;
    private String droneProfileName;
    private String title;
    private String description;
    private String locationLabel;
    private String locationAddress;
    private BigDecimal locationLat;
    private BigDecimal locationLon;
    private LocalDate missionDate;
    private String status;
    private Integer flyScore;
    private String weatherSummary;
    private BigDecimal durationHours;
    private String notes;
    private Instant createdAt;
    private Instant updatedAt;
}
