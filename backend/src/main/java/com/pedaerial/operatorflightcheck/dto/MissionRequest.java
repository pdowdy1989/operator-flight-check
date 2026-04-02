package com.pedaerial.operatorflightcheck.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MissionRequest {
    private String clientId;
    private String droneProfileId;

    @NotBlank
    private String title;

    private String description;
    private String locationLabel;
    private String locationAddress;
    private BigDecimal locationLat;
    private BigDecimal locationLon;

    @NotNull
    private LocalDate missionDate;

    private String status;
    private Integer flyScore;
    private String weatherSummary;
    private BigDecimal durationHours;
    private String notes;
}
