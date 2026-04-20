package com.pedaerial.operatorflightcheck.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record DroneProfileRequest(
    @NotBlank(message = "Drone name is required.")
    @Size(max = 100)
    String name,

    @Size(max = 100)
    String manufacturer,

    @Size(max = 100)
    String model,

    @Size(max = 100)
    String serialNumber,

    @Size(max = 50)
    String faaRegistration,

    Integer weightGrams,
    Integer maxWindMph,
    Integer maxGustMph,
    String notes,
    Boolean active
) {}
