package com.pedaerial.operatorflightcheck.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record JobRequestLineItemResponse(
    UUID id,
    UUID pilotServiceId,
    String serviceNameSnapshot,
    BigDecimal unitPriceSnapshot,
    String pricingTypeSnapshot,
    Integer quantity,
    BigDecimal amount,
    Integer sortOrder
) {}
