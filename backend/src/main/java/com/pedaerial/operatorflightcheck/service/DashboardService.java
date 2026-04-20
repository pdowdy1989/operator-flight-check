package com.pedaerial.operatorflightcheck.service;

import com.pedaerial.operatorflightcheck.dto.DashboardResponse;
import com.pedaerial.operatorflightcheck.dto.DocumentResponse;
import com.pedaerial.operatorflightcheck.dto.JobResponse;
import com.pedaerial.operatorflightcheck.entity.Client;
import com.pedaerial.operatorflightcheck.entity.ClientType;
import com.pedaerial.operatorflightcheck.entity.JobStatus;
import com.pedaerial.operatorflightcheck.entity.ReportStatus;
import com.pedaerial.operatorflightcheck.entity.User;
import com.pedaerial.operatorflightcheck.exception.ResourceNotFoundException;
import com.pedaerial.operatorflightcheck.repository.ClientRepository;
import com.pedaerial.operatorflightcheck.repository.DocumentRepository;
import com.pedaerial.operatorflightcheck.repository.InspectionReportRepository;
import com.pedaerial.operatorflightcheck.repository.InvoiceRepository;
import com.pedaerial.operatorflightcheck.repository.JobRepository;
import com.pedaerial.operatorflightcheck.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.EnumSet;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final JobRepository jobRepository;
    private final InspectionReportRepository reportRepository;
    private final InvoiceRepository invoiceRepository;
    private final DocumentRepository documentRepository;
    private final ClientRepository clientRepository;
    private final UserRepository userRepository;
    private final ResponseMapper mapper;

    public DashboardService(JobRepository jobRepository, InspectionReportRepository reportRepository,
                            InvoiceRepository invoiceRepository, DocumentRepository documentRepository,
                            ClientRepository clientRepository, UserRepository userRepository,
                            ResponseMapper mapper) {
        this.jobRepository = jobRepository;
        this.reportRepository = reportRepository;
        this.invoiceRepository = invoiceRepository;
        this.documentRepository = documentRepository;
        this.clientRepository = clientRepository;
        this.userRepository = userRepository;
        this.mapper = mapper;
    }

    public DashboardResponse getPilotDashboard(String pilotId) {
        var activeJobs = jobRepository.findByPilotIdAndStatus(pilotId, JobStatus.IN_PROGRESS);
        var scheduledJobs = jobRepository.findByPilotIdAndStatus(pilotId, JobStatus.SCHEDULED);
        var pendingReports = reportRepository.findByStatus(ReportStatus.SUBMITTED);

        var allPilotJobs = jobRepository.findByPilotIdOrderByCreatedAtDesc(pilotId);
        List<JobResponse> recentJobs = allPilotJobs.stream()
            .limit(5)
            .map(job -> mapper.toJobResponse(job, documentRepository.countByJobId(job.getId())))
            .toList();

        BigDecimal revenueTotal = invoiceRepository.findByPilotIdOrderByCreatedAtDesc(pilotId)
            .stream()
            .map(inv -> inv.getTotalAmount() != null ? inv.getTotalAmount() : BigDecimal.ZERO)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        var coreMissionJobs = allPilotJobs.stream()
            .filter(job -> job.getClient() != null && job.getClient().getClientType() != ClientType.COMPANY)
            .toList();
        long totalMissionCount = coreMissionJobs.size();
        long completedMissionCount = coreMissionJobs.stream()
            .filter(job -> job.getStatus() == JobStatus.COMPLETED || job.getStatus() == JobStatus.DELIVERED)
            .count();

        return new DashboardResponse(
            totalMissionCount,
            completedMissionCount,
            revenueTotal,
            null,
            null,
            null,
            null,
            (long) activeJobs.size(),
            (long) pendingReports.size(),
            (long) scheduledJobs.size(),
            revenueTotal,
            null, null, null,
            recentJobs,
            List.of()
        );
    }

    public DashboardResponse getCompanyDashboard(String userId) {
        var openRequests = jobRepository.findByClientClientTypeOrderByCreatedAtDesc(ClientType.COMPANY)
            .stream()
            .filter(job -> EnumSet.of(
                JobStatus.REQUESTED,
                JobStatus.ACCEPTED,
                JobStatus.SCHEDULED,
                JobStatus.IN_PROGRESS,
                JobStatus.COMPLETED
            ).contains(job.getStatus()))
            .toList();
        var pendingReview = reportRepository.findByStatus(ReportStatus.SUBMITTED);
        var completed = jobRepository.findJobsByClientTypeAndStatus(ClientType.COMPANY, JobStatus.DELIVERED);

        return new DashboardResponse(
            null,
            null,
            null,
            null,
            null,
            (long) openRequests.size(),
            (long) completed.size(),
            null, null, null, null,
            (long) openRequests.size(),
            (long) pendingReview.size(),
            (long) completed.size(),
            List.of(),
            List.of()
        );
    }

    public DashboardResponse getClientDashboard(String userId) {
        Client client = findClientForUser(userId);
        var jobs = jobRepository.findByClientIdOrderByCreatedAtDesc(client.getId());
        long activeProjectCount = jobs.stream()
            .filter(job -> EnumSet.of(JobStatus.REQUESTED, JobStatus.ACCEPTED, JobStatus.SCHEDULED, JobStatus.IN_PROGRESS).contains(job.getStatus()))
            .count();
        BigDecimal totalSpent = invoiceRepository.findByClientIdOrderByCreatedAtDesc(client.getId())
            .stream()
            .map(inv -> inv.getTotalAmount() != null ? inv.getTotalAmount() : BigDecimal.ZERO)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new DashboardResponse(
            null,
            null,
            null,
            activeProjectCount,
            totalSpent,
            null,
            null,
            null, null, null, null,
            null, null, null,
            List.of(),
            List.of()
        );
    }

    private Client findClientForUser(String userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        return clientRepository.findByEmailIgnoreCase(user.getEmail())
            .orElseThrow(() -> new ResourceNotFoundException("Client profile not found for: " + user.getEmail()));
    }
}
