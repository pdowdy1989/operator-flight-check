package com.pedaerial.operatorflightcheck.dto;

import com.pedaerial.operatorflightcheck.entity.MissionStatus;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record MissionResponse(
    UUID id,
    UUID jobId,
    String jobTitle,
    String pilotId,
    UUID droneProfileId,
    String droneName,
    LocalDate flightDate,
    LocalTime flightTime,
    Integer durationMinutes,
    Double weatherTempF,
    Double weatherWindMph,
    Double weatherGustMph,
    String weatherConditions,
    String weatherVisibility,
    Integer flyScore,
    MissionStatus status,
    String notes,
    Instant createdAt
) {}
