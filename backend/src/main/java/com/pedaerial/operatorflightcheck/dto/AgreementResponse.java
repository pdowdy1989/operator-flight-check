package com.pedaerial.operatorflightcheck.dto;

import com.pedaerial.operatorflightcheck.entity.AgreementStatus;

import java.time.Instant;
import java.util.UUID;

public record AgreementResponse(
    UUID id,
    UUID jobId,
    String agreementNumber,
    AgreementStatus status,
    Instant signedAt,
    String signedByName,
    String signedByEmail,
    String pdfPath,
    Instant createdAt
) {}
