package com.pedaerial.operatorflightcheck.dto;

import java.math.BigDecimal;
import java.util.List;

public record DashboardResponse(
    Long totalMissionCount,
    Long completedMissionCount,
    BigDecimal revenueTotal,
    Long activeProjectCount,
    BigDecimal totalSpent,
    Long openClaimCount,
    Long closedClaimCount,

    // pilot fields
    Long activeJobCount,
    Long pendingInspectionCount,
    Long upcomingFlightCount,
    BigDecimal monthRevenue,

    // insurance fields
    Long openRequestCount,
    Long pendingReviewCount,
    Long completedInspectionCount,

    // shared
    List<JobResponse> recentJobs,
    List<DocumentResponse> recentDocuments
) {}
