package com.pedaerial.operatorflightcheck.dto;

import com.pedaerial.operatorflightcheck.entity.InvoiceStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record InvoiceResponse(
    UUID id,
    UUID jobId,
    String jobTitle,
    String pilotId,
    String invoiceNumber,
    UUID clientId,
    String clientName,
    BigDecimal amount,
    BigDecimal taxAmount,
    BigDecimal totalAmount,
    InvoiceStatus status,
    LocalDate dueDate,
    LocalDate paidDate,
    String notes,
    List<LineItemResponse> lineItems,
    Instant createdAt,
    Instant updatedAt
) {}
