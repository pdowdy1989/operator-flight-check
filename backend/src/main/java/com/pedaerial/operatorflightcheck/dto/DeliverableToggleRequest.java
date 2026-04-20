package com.pedaerial.operatorflightcheck.dto;

import jakarta.validation.constraints.NotNull;

public record DeliverableToggleRequest(
    @NotNull
    Boolean isDeliverable
) {}
