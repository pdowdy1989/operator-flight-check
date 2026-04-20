package com.pedaerial.operatorflightcheck.dto;

import com.pedaerial.operatorflightcheck.entity.ReportStatus;
import jakarta.validation.constraints.NotNull;

public record ReportReviewRequest(
    @NotNull(message = "Decision is required.")
    ReportStatus decision,

    String notes
) {}
