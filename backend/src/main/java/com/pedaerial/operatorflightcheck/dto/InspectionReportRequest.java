package com.pedaerial.operatorflightcheck.dto;

import com.pedaerial.operatorflightcheck.entity.ConditionRating;
import com.pedaerial.operatorflightcheck.entity.PropertyCondition;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record InspectionReportRequest(
    @NotNull(message = "Report date is required.")
    LocalDate reportDate,

    @NotNull(message = "Property condition is required.")
    PropertyCondition propertyCondition,

    @NotNull(message = "Damage found indicator is required.")
    Boolean damageFound,

    String damageSummary,
    ConditionRating roofCondition,
    ConditionRating exteriorCondition,
    String additionalFindings,
    String recommendations,
    String pilotSignature
) {}
