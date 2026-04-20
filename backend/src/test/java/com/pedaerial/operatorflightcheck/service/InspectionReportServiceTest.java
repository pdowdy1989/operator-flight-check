package com.pedaerial.operatorflightcheck.service;

import com.pedaerial.operatorflightcheck.dto.InspectionReportRequest;
import com.pedaerial.operatorflightcheck.dto.InspectionReportResponse;
import com.pedaerial.operatorflightcheck.dto.ReportReviewRequest;
import com.pedaerial.operatorflightcheck.entity.*;
import com.pedaerial.operatorflightcheck.exception.BadRequestException;
import com.pedaerial.operatorflightcheck.exception.UnauthorizedException;
import com.pedaerial.operatorflightcheck.repository.InspectionReportRepository;
import com.pedaerial.operatorflightcheck.repository.JobRepository;
import com.pedaerial.operatorflightcheck.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InspectionReportServiceTest {

    @Mock InspectionReportRepository reportRepository;
    @Mock JobRepository jobRepository;
    @Mock UserRepository userRepository;
    @Mock ResponseMapper mapper;

    @InjectMocks InspectionReportService reportService;

    private User pilot;
    private User adjuster;
    private Job job;

    @BeforeEach
    void setUp() {
        pilot = new User();
        pilot.setId(UUID.randomUUID().toString());
        pilot.setRole(Role.PILOT);

        adjuster = new User();
        adjuster.setId(UUID.randomUUID().toString());
        adjuster.setRole(Role.COMPANY);

        Client client = Client.builder()
            .id(UUID.randomUUID())
            .pilot(pilot)
            .name("Test Client")
            .clientType(ClientType.COMPANY)
            .build();

        job = Job.builder()
            .id(UUID.randomUUID())
            .pilot(pilot)
            .client(client)
            .title("Insurance Job")
            .jobType(JobType.INSURANCE_INSPECTION)
            .status(JobStatus.COMPLETED)
            .siteAddress("123 Main St")
            .build();
    }

    @Test
    void submitReport_notDraft_throws() {
        InspectionReport report = InspectionReport.builder()
            .id(UUID.randomUUID())
            .job(job).pilot(pilot)
            .reportDate(LocalDate.now())
            .propertyCondition(PropertyCondition.FAIR)
            .damageFound(false)
            .status(ReportStatus.SUBMITTED)
            .build();

        when(reportRepository.findByJobId(job.getId())).thenReturn(Optional.of(report));

        assertThatThrownBy(() -> reportService.submitReport(job.getId(), pilot.getId()))
            .isInstanceOf(BadRequestException.class)
            .hasMessageContaining("DRAFT");
    }

    @Test
    void submitReport_byWrongPilot_throws() {
        String otherPilotId = UUID.randomUUID().toString();
        InspectionReport report = InspectionReport.builder()
            .id(UUID.randomUUID())
            .job(job).pilot(pilot)
            .reportDate(LocalDate.now())
            .propertyCondition(PropertyCondition.GOOD)
            .damageFound(false)
            .status(ReportStatus.DRAFT)
            .build();

        when(reportRepository.findByJobId(job.getId())).thenReturn(Optional.of(report));

        assertThatThrownBy(() -> reportService.submitReport(job.getId(), otherPilotId))
            .isInstanceOf(UnauthorizedException.class);
    }

    @Test
    void submitReport_draft_succeeds() {
        InspectionReport report = InspectionReport.builder()
            .id(UUID.randomUUID())
            .job(job).pilot(pilot)
            .reportDate(LocalDate.now())
            .propertyCondition(PropertyCondition.POOR)
            .damageFound(true)
            .status(ReportStatus.DRAFT)
            .build();

        when(reportRepository.findByJobId(job.getId())).thenReturn(Optional.of(report));
        when(reportRepository.save(any())).thenReturn(report);
        when(mapper.toInspectionReportResponse(any())).thenReturn(mock(InspectionReportResponse.class));

        reportService.submitReport(job.getId(), pilot.getId());

        assertThat(report.getStatus()).isEqualTo(ReportStatus.SUBMITTED);
    }

    @Test
    void reviewReport_approved_setsStatus() {
        InspectionReport report = InspectionReport.builder()
            .id(UUID.randomUUID())
            .job(job).pilot(pilot)
            .reportDate(LocalDate.now())
            .propertyCondition(PropertyCondition.POOR)
            .damageFound(true)
            .status(ReportStatus.SUBMITTED)
            .build();

        when(reportRepository.findByJobId(job.getId())).thenReturn(Optional.of(report));
        when(userRepository.findById(adjuster.getId())).thenReturn(Optional.of(adjuster));
        when(reportRepository.save(any())).thenReturn(report);
        when(mapper.toInspectionReportResponse(any())).thenReturn(mock(InspectionReportResponse.class));

        ReportReviewRequest reviewRequest = new ReportReviewRequest(ReportStatus.APPROVED, "Looks good.");
        reportService.reviewReport(job.getId(), adjuster.getId(), reviewRequest);

        assertThat(report.getStatus()).isEqualTo(ReportStatus.APPROVED);
    }

    @Test
    void reviewReport_rejected_returnsToDraft() {
        InspectionReport report = InspectionReport.builder()
            .id(UUID.randomUUID())
            .job(job).pilot(pilot)
            .reportDate(LocalDate.now())
            .propertyCondition(PropertyCondition.POOR)
            .damageFound(true)
            .status(ReportStatus.SUBMITTED)
            .build();

        when(reportRepository.findByJobId(job.getId())).thenReturn(Optional.of(report));
        when(userRepository.findById(adjuster.getId())).thenReturn(Optional.of(adjuster));
        when(reportRepository.save(any())).thenReturn(report);
        when(mapper.toInspectionReportResponse(any())).thenReturn(mock(InspectionReportResponse.class));

        ReportReviewRequest reviewRequest = new ReportReviewRequest(ReportStatus.REJECTED, "Missing photos.");
        reportService.reviewReport(job.getId(), adjuster.getId(), reviewRequest);

        assertThat(report.getStatus()).isEqualTo(ReportStatus.DRAFT);
    }
}
