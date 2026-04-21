package com.pedaerial.operatorflightcheck.dto;

import com.pedaerial.operatorflightcheck.entity.JobRequestStatus;
import com.pedaerial.operatorflightcheck.entity.LossType;
import com.pedaerial.operatorflightcheck.entity.PropertyType;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

public record JobRequestResponse(
    UUID id,
    String requesterId,
    String reviewedByPilotId,
    JobRequestStatus status,
    String siteAddress,
    BigDecimal siteLat,
    BigDecimal siteLon,
    LocalDate requestedDate,
    LocalTime requestedTime,
    Boolean isRecurring,
    String recurrencePattern,
    String notes,
    BigDecimal rateCardTotal,
    BigDecimal discountPercent,
    BigDecimal finalAmount,
    BigDecimal proposedBudget,
    String claimNumber,
    String policyNumber,
    String insuranceCompanyName,
    String adjusterName,
    String adjusterEmail,
    String adjusterPhone,
    LocalDate lossDate,
    LossType lossType,
    PropertyType propertyType,
    String inspectionScope,
    List<JobRequestLineItemResponse> lineItems,
    UUID createdJobId,
    Instant decidedAt,
    String decisionNotes,
    Instant createdAt,
    Instant updatedAt
) {}
