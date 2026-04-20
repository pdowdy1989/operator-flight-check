package com.pedaerial.operatorflightcheck.service;

import com.pedaerial.operatorflightcheck.dto.InspectionReportRequest;
import com.pedaerial.operatorflightcheck.dto.InspectionReportResponse;
import com.pedaerial.operatorflightcheck.dto.ReportReviewRequest;
import com.pedaerial.operatorflightcheck.entity.*;
import com.pedaerial.operatorflightcheck.exception.BadRequestException;
import com.pedaerial.operatorflightcheck.exception.ResourceNotFoundException;
import com.pedaerial.operatorflightcheck.exception.UnauthorizedException;
import com.pedaerial.operatorflightcheck.repository.InspectionReportRepository;
import com.pedaerial.operatorflightcheck.repository.JobRepository;
import com.pedaerial.operatorflightcheck.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@Transactional
public class InspectionReportService {

    private final InspectionReportRepository reportRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final ResponseMapper mapper;

    public InspectionReportService(InspectionReportRepository reportRepository, JobRepository jobRepository,
                                   UserRepository userRepository, ResponseMapper mapper) {
        this.reportRepository = reportRepository;
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
        this.mapper = mapper;
    }

    public InspectionReportResponse createOrUpdateReport(UUID jobId, InspectionReportRequest request, String pilotId) {
        Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new ResourceNotFoundException("Job not found: " + jobId));

        User pilot = userRepository.findById(pilotId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + pilotId));

        InspectionReport report = reportRepository.findByJobId(jobId).orElseGet(InspectionReport::new);

        if (report.getStatus() == ReportStatus.SUBMITTED || report.getStatus() == ReportStatus.APPROVED) {
            throw new BadRequestException("Cannot edit a submitted or approved report.");
        }

        report.setJob(job);
        report.setPilot(pilot);
        report.setReportDate(request.reportDate());
        report.setPropertyCondition(request.propertyCondition());
        report.setDamageFound(request.damageFound());
        report.setDamageSummary(request.damageSummary());
        report.setRoofCondition(request.roofCondition());
        report.setExteriorCondition(request.exteriorCondition());
        report.setAdditionalFindings(request.additionalFindings());
        report.setRecommendations(request.recommendations());
        report.setPilotSignature(request.pilotSignature());

        if (report.getStatus() == null) {
            report.setStatus(ReportStatus.DRAFT);
        }

        return mapper.toInspectionReportResponse(reportRepository.save(report));
    }

    public InspectionReportResponse submitReport(UUID jobId, String pilotId) {
        InspectionReport report = reportRepository.findByJobId(jobId)
            .orElseThrow(() -> new ResourceNotFoundException("Report not found for job: " + jobId));

        if (!report.getPilot().getId().equals(pilotId)) {
            throw new UnauthorizedException("Only the pilot can submit this report.");
        }
        if (report.getStatus() != ReportStatus.DRAFT) {
            throw new BadRequestException("Only DRAFT reports can be submitted.");
        }

        report.setStatus(ReportStatus.SUBMITTED);
        return mapper.toInspectionReportResponse(reportRepository.save(report));
    }

    public InspectionReportResponse reviewReport(UUID jobId, String reviewerId, ReportReviewRequest request) {
        InspectionReport report = reportRepository.findByJobId(jobId)
            .orElseThrow(() -> new ResourceNotFoundException("Report not found for job: " + jobId));

        if (report.getStatus() != ReportStatus.SUBMITTED) {
            throw new BadRequestException("Only SUBMITTED reports can be reviewed.");
        }

        ReportStatus decision = request.decision();
        if (decision != ReportStatus.APPROVED && decision != ReportStatus.REJECTED) {
            throw new BadRequestException("Decision must be APPROVED or REJECTED.");
        }

        User reviewer = userRepository.findById(reviewerId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + reviewerId));

        report.setStatus(decision == ReportStatus.APPROVED ? ReportStatus.APPROVED : ReportStatus.DRAFT);
        report.setReviewerNotes(request.notes());
        report.setReviewedBy(reviewer);
        report.setReviewedAt(Instant.now());

        return mapper.toInspectionReportResponse(reportRepository.save(report));
    }

    @Transactional(readOnly = true)
    public InspectionReportResponse getReport(UUID jobId) {
        InspectionReport report = reportRepository.findByJobId(jobId)
            .orElseThrow(() -> new ResourceNotFoundException("Report not found for job: " + jobId));
        return mapper.toInspectionReportResponse(report);
    }
}
