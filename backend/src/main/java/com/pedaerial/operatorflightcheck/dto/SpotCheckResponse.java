package com.pedaerial.operatorflightcheck.dto;

import java.time.Instant;
import java.time.LocalDate;

public record SpotCheckResponse(
    String id,
    String userId,
    String spotId,
    String spotLabel,
    String profileId,
    String profileName,
    LocalDate date,
    String status,
    String summary,
    String notes,
    Instant createdAt
) {
}
