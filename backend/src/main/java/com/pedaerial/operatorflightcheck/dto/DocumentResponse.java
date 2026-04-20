package com.pedaerial.operatorflightcheck.dto;

import com.pedaerial.operatorflightcheck.entity.DocumentCategory;
import com.pedaerial.operatorflightcheck.entity.DocumentType;

import java.time.Instant;
import java.util.UUID;

public record DocumentResponse(
    UUID id,
    UUID jobId,
    UUID missionId,
    String uploadedById,
    String uploaderName,
    String fileName,
    DocumentType fileType,
    String filePath,
    Long fileSizeBytes,
    String thumbnailPath,
    String mimeType,
    String description,
    String tags,
    DocumentCategory category,
    Boolean isDeliverable,
    String downloadUrl,
    Instant createdAt
) {}
