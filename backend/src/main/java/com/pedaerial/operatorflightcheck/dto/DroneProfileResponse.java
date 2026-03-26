package com.pedaerial.operatorflightcheck.dto;

import java.time.Instant;

public record DroneProfileResponse(
    String id,
    String userId,
    String name,
    String type,
    Integer windGreenMph,
    Integer windYellowMph,
    Integer gustGreenMph,
    Integer gustYellowMph,
    Integer precipGreenPct,
    Integer precipYellowPct,
    Instant createdAt
) {
}
