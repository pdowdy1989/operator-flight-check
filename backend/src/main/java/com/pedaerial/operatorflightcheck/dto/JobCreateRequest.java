package com.pedaerial.operatorflightcheck.dto;

import com.pedaerial.operatorflightcheck.entity.JobPriority;
import com.pedaerial.operatorflightcheck.entity.JobType;
import com.pedaerial.operatorflightcheck.entity.LossType;
import com.pedaerial.operatorflightcheck.entity.PropertyType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record JobCreateRequest(
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

    // Insurance-claim-ready fields (optional, usable by any role)
    @Size(max = 100) String claimNumber,
    @Size(max = 100) String policyNumber,
    @Size(max = 255) String insuranceCompanyName,
    @Size(max = 255) String adjusterName,
    @Email @Size(max = 255) String adjusterEmail,
    @Size(max = 50) String adjusterPhone,
    LocalDate lossDate,
    LossType lossType,
    PropertyType propertyType,
    String inspectionScope
) {}
