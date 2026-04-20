package com.pedaerial.operatorflightcheck.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record LineItemRequest(
    @NotBlank(message = "Description is required.")
    @Size(max = 255)
    String description,

    @NotNull(message = "Quantity is required.")
    BigDecimal quantity,

    @NotNull(message = "Unit price is required.")
    BigDecimal unitPrice,

    Integer sortOrder
) {}
