package com.pedaerial.operatorflightcheck.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record SpotResponse(
    String id,
    String userId,
    String label,
    String address,
    BigDecimal lat,
    BigDecimal lon,
    String notes,
    boolean favorite,
    Instant createdAt
) {
}
