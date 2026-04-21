package com.pedaerial.operatorflightcheck.dto;

import com.pedaerial.operatorflightcheck.entity.JobType;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record ServiceCatalogResponse(
    UUID id,
    JobType jobType,
    String name,
    String description,
    BigDecimal basePrice,
    Integer estimatedDurationMinutes,
    Boolean active,
    Integer sortOrder,
    Instant createdAt,
    Instant updatedAt
) {}
