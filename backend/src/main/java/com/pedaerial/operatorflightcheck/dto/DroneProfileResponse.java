package com.pedaerial.operatorflightcheck.dto;

import java.time.Instant;
import java.util.UUID;

public record DroneProfileResponse(
    UUID id,
    String pilotId,
    String name,
    String manufacturer,
    String model,
    String serialNumber,
    String faaRegistration,
    Integer weightGrams,
    Integer maxWindMph,
    Integer maxGustMph,
    String notes,
    Boolean active,
    Instant createdAt
) {}
