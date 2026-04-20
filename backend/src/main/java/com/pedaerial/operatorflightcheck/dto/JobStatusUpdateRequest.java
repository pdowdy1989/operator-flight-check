package com.pedaerial.operatorflightcheck.dto;

import com.pedaerial.operatorflightcheck.entity.JobStatus;
import jakarta.validation.constraints.NotNull;

public record JobStatusUpdateRequest(
    @NotNull(message = "Status is required.")
    JobStatus status
) {}
