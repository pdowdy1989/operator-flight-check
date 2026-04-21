package com.pedaerial.operatorflightcheck.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record JobRequestLineItemResponse(
    UUID id,
    UUID serviceCatalogId,
    String serviceNameSnapshot,
    BigDecimal unitPriceSnapshot,
    Integer quantity,
    BigDecimal amount,
    Integer sortOrder
) {}
