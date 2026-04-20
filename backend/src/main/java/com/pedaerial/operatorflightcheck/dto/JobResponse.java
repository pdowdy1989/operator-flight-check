package com.pedaerial.operatorflightcheck.dto;

import com.pedaerial.operatorflightcheck.entity.JobPriority;
import com.pedaerial.operatorflightcheck.entity.JobStatus;
import com.pedaerial.operatorflightcheck.entity.JobType;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record JobResponse(
    UUID id,
    String pilotId,
    String pilotName,
    UUID clientId,
    String clientName,
    String clientType,
    String title,
    String description,
    JobType jobType,
    JobStatus status,
    JobPriority priority,
    String siteAddress,
    BigDecimal siteLat,
    BigDecimal siteLon,
    LocalDate scheduledDate,
    LocalTime scheduledTime,
    Integer estimatedDuration,
    Integer actualDuration,
    String notes,
    long documentCount,
    InsuranceDetailsResponse insuranceDetails,
    Instant createdAt,
    Instant updatedAt
) {}
