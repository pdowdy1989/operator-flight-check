package com.pedaerial.operatorflightcheck.controller;

import com.pedaerial.operatorflightcheck.dto.InspectionReportRequest;
import com.pedaerial.operatorflightcheck.dto.InspectionReportResponse;
import com.pedaerial.operatorflightcheck.dto.ReportReviewRequest;
import com.pedaerial.operatorflightcheck.security.AppUserPrincipal;
import com.pedaerial.operatorflightcheck.service.InspectionReportService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/inspection-reports")
public class InspectionReportController {

    private final InspectionReportService reportService;

    public InspectionReportController(InspectionReportService reportService) {
        this.reportService = reportService;
    }

    @PostMapping("/job/{jobId}")
    public ResponseEntity<InspectionReportResponse> saveReport(@PathVariable UUID jobId,
                                                                @Valid @RequestBody InspectionReportRequest request,
                                                                @AuthenticationPrincipal AppUserPrincipal principal) {
        return ResponseEntity.ok(reportService.createOrUpdateReport(jobId, request, principal.getId()));
    }

    @GetMapping("/job/{jobId}")
    public ResponseEntity<InspectionReportResponse> getReport(@PathVariable UUID jobId) {
        return ResponseEntity.ok(reportService.getReport(jobId));
    }

    @PatchMapping("/job/{jobId}/submit")
    public ResponseEntity<InspectionReportResponse> submitReport(@PathVariable UUID jobId,
                                                                  @AuthenticationPrincipal AppUserPrincipal principal) {
        return ResponseEntity.ok(reportService.submitReport(jobId, principal.getId()));
    }

    @PatchMapping("/job/{jobId}/review")
    public ResponseEntity<InspectionReportResponse> reviewReport(@PathVariable UUID jobId,
                                                                  @Valid @RequestBody ReportReviewRequest request,
                                                                  @AuthenticationPrincipal AppUserPrincipal principal) {
        return ResponseEntity.ok(reportService.reviewReport(jobId, principal.getId(), request));
    }
}
