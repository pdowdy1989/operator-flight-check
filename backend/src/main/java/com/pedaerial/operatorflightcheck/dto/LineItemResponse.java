package com.pedaerial.operatorflightcheck.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record LineItemResponse(
    UUID id,
    String description,
    BigDecimal quantity,
    BigDecimal unitPrice,
    BigDecimal amount,
    Integer sortOrder
) {}
