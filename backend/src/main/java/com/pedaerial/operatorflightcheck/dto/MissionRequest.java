package com.pedaerial.operatorflightcheck.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record MissionRequest(
    @NotNull(message = "Job ID is required.")
    UUID jobId,

    UUID droneProfileId,

    @NotNull(message = "Flight date is required.")
    LocalDate flightDate,

    LocalTime flightTime,
    String notes
) {}
