package com.pedaerial.operatorflightcheck.dto;

import com.pedaerial.operatorflightcheck.entity.InvoiceStatus;
import jakarta.validation.constraints.NotNull;

public record InvoiceStatusUpdateRequest(
    @NotNull(message = "Status is required.")
    InvoiceStatus status
) {}
