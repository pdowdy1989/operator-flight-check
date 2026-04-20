package com.pedaerial.operatorflightcheck.dto;

import com.pedaerial.operatorflightcheck.entity.LossType;
import com.pedaerial.operatorflightcheck.entity.PropertyType;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record InsuranceDetailsResponse(
    UUID id,
    UUID jobId,
    String claimNumber,
    String policyNumber,
    String insuranceCompany,
    String adjusterName,
    String adjusterEmail,
    String adjusterPhone,
    LocalDate lossDate,
    LossType lossType,
    PropertyType propertyType,
    String inspectionScope,
    Instant createdAt
) {}
