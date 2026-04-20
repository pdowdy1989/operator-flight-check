package com.pedaerial.operatorflightcheck.dto;

import com.pedaerial.operatorflightcheck.entity.ConditionRating;
import com.pedaerial.operatorflightcheck.entity.PropertyCondition;
import com.pedaerial.operatorflightcheck.entity.ReportStatus;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record InspectionReportResponse(
    UUID id,
    UUID jobId,
    String pilotId,
    String pilotName,
    LocalDate reportDate,
    PropertyCondition propertyCondition,
    Boolean damageFound,
    String damageSummary,
    ConditionRating roofCondition,
    ConditionRating exteriorCondition,
    String additionalFindings,
    String recommendations,
    String pilotSignature,
    ReportStatus status,
    String reviewerNotes,
    String reviewedById,
    Instant reviewedAt,
    Instant createdAt,
    Instant updatedAt
) {}
