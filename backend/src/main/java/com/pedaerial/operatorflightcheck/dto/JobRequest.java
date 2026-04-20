package com.pedaerial.operatorflightcheck.dto;

import com.pedaerial.operatorflightcheck.entity.JobPriority;
import com.pedaerial.operatorflightcheck.entity.JobType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record JobRequest(
    @NotNull(message = "Client ID is required.")
    UUID clientId,

    @NotBlank(message = "Job title is required.")
    @Size(max = 255)
    String title,

    String description,

    @NotNull(message = "Job type is required.")
    JobType jobType,

    JobPriority priority,

    @NotBlank(message = "Site address is required.")
    @Size(max = 500)
    String siteAddress,

    BigDecimal siteLat,
    BigDecimal siteLon,
    LocalDate scheduledDate,
    LocalTime scheduledTime,
    Integer estimatedDuration,
    String notes,

    // Only populated when jobType == INSURANCE_INSPECTION
    InsuranceDetailsRequest insuranceDetails
) {}
