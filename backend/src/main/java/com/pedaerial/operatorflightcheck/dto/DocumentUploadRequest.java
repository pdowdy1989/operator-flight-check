package com.pedaerial.operatorflightcheck.dto;

import com.pedaerial.operatorflightcheck.entity.DocumentCategory;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record DocumentUploadRequest(
    @NotNull(message = "Job ID is required.")
    UUID jobId,

    UUID missionId,

    @NotNull(message = "Category is required.")
    DocumentCategory category,

    String description,
    String tags,
    Boolean isDeliverable
) {}
