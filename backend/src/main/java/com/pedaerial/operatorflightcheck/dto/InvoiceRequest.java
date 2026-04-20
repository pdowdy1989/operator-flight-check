package com.pedaerial.operatorflightcheck.dto;

import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record InvoiceRequest(
    @NotNull(message = "Job ID is required.")
    UUID jobId,

    BigDecimal taxAmount,
    LocalDate dueDate,
    String notes,

    @NotNull(message = "At least one line item is required.")
    List<LineItemRequest> lineItems
) {}
