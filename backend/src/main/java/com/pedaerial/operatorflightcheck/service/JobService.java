package com.pedaerial.operatorflightcheck.service;

import com.pedaerial.operatorflightcheck.dto.JobCreateRequest;
import com.pedaerial.operatorflightcheck.dto.JobResponse;
import com.pedaerial.operatorflightcheck.dto.JobStatusUpdateRequest;
import com.pedaerial.operatorflightcheck.entity.*;
import com.pedaerial.operatorflightcheck.exception.BadRequestException;
import com.pedaerial.operatorflightcheck.exception.ResourceNotFoundException;
import com.pedaerial.operatorflightcheck.exception.UnauthorizedException;
import com.pedaerial.operatorflightcheck.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class JobService {

    private final JobRepository jobRepository;
    private final ClientRepository clientRepository;
    private final UserRepository userRepository;
    private final DocumentRepository documentRepository;
    private final ResponseMapper mapper;

    public JobService(JobRepository jobRepository, ClientRepository clientRepository,
                      UserRepository userRepository, DocumentRepository documentRepository,
                      ResponseMapper mapper) {
        this.jobRepository = jobRepository;
        this.clientRepository = clientRepository;
        this.userRepository = userRepository;
        this.documentRepository = documentRepository;
        this.mapper = mapper;
    }

    public JobResponse createJob(JobCreateRequest request, String pilotId) {
        Client client = clientRepository.findById(request.clientId())
            .orElseThrow(() -> new ResourceNotFoundException("Client not found: " + request.clientId()));

        User pilot = userRepository.findById(pilotId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + pilotId));

        if (request.jobType() == JobType.INSURANCE_INSPECTION) {
            if (request.claimNumber() == null || request.claimNumber().isBlank()) {
                throw new BadRequestException("Insurance inspection requires a claim number.");
            }
        }

        Job job = Job.builder()
            .pilot(pilot)
            .client(client)
            .title(request.title())
            .description(request.description())
            .jobType(request.jobType())
            .status(JobStatus.REQUESTED)
            .priority(request.priority() != null ? request.priority() : JobPriority.NORMAL)
            .siteAddress(request.siteAddress())
            .siteLat(request.siteLat())
            .siteLon(request.siteLon())
            .scheduledDate(request.scheduledDate())
            .scheduledTime(request.scheduledTime())
            .estimatedDuration(request.estimatedDuration())
            .notes(request.notes())
            .claimNumber(request.claimNumber())
            .policyNumber(request.policyNumber())
            .insuranceCompanyName(request.insuranceCompanyName())
            .adjusterName(request.adjusterName())
            .adjusterEmail(request.adjusterEmail())
            .adjusterPhone(request.adjusterPhone())
            .lossDate(request.lossDate())
            .lossType(request.lossType())
            .propertyType(request.propertyType())
            .inspectionScope(request.inspectionScope())
            .build();

        job = jobRepository.save(job);
        long docCount = documentRepository.countByJobId(job.getId());
        return mapper.toJobResponse(job, docCount);
    }

    public JobResponse acceptJob(UUID jobId, String pilotId) {
        Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new ResourceNotFoundException("Job not found: " + jobId));

        if (job.getStatus() != JobStatus.REQUESTED) {
            throw new BadRequestException("Only REQUESTED jobs can be accepted.");
        }

        User pilot = userRepository.findById(pilotId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + pilotId));

        job.setPilot(pilot);
        job.setStatus(JobStatus.ACCEPTED);
        job = jobRepository.save(job);

        long docCount = documentRepository.countByJobId(job.getId());
        return mapper.toJobResponse(job, docCount);
    }

    public JobResponse updateJobStatus(UUID jobId, JobStatus newStatus, String requesterId) {
        Job job = findJobAccessible(jobId, requesterId);
        validateStatusTransition(job.getStatus(), newStatus);
        job.setStatus(newStatus);
        job = jobRepository.save(job);

        long docCount = documentRepository.countByJobId(job.getId());
        return mapper.toJobResponse(job, docCount);
    }

    public JobResponse updateJob(UUID jobId, JobCreateRequest request, String requesterId) {
        Job job = findJobOwned(jobId, requesterId);

        job.setTitle(request.title());
        job.setDescription(request.description());
        job.setPriority(request.priority() != null ? request.priority() : job.getPriority());
        job.setSiteAddress(request.siteAddress());
        job.setSiteLat(request.siteLat());
        job.setSiteLon(request.siteLon());
        job.setScheduledDate(request.scheduledDate());
        job.setScheduledTime(request.scheduledTime());
        job.setEstimatedDuration(request.estimatedDuration());
        job.setNotes(request.notes());
        job.setClaimNumber(request.claimNumber());
        job.setPolicyNumber(request.policyNumber());
        job.setInsuranceCompanyName(request.insuranceCompanyName());
        job.setAdjusterName(request.adjusterName());
        job.setAdjusterEmail(request.adjusterEmail());
        job.setAdjusterPhone(request.adjusterPhone());
        job.setLossDate(request.lossDate());
        job.setLossType(request.lossType());
        job.setPropertyType(request.propertyType());
        job.setInspectionScope(request.inspectionScope());

        job = jobRepository.save(job);
        long docCount = documentRepository.countByJobId(job.getId());
        return mapper.toJobResponse(job, docCount);
    }

    @Transactional(readOnly = true)
    public List<JobResponse> getJobsForPilot(String pilotId) {
        return jobRepository.findByPilotIdOrderByCreatedAtDesc(pilotId)
            .stream()
            .map(job -> mapper.toJobResponse(job, documentRepository.countByJobId(job.getId())))
            .toList();
    }

    @Transactional(readOnly = true)
    public List<JobResponse> getJobsForClient(UUID clientId) {
        return jobRepository.findByClientIdOrderByCreatedAtDesc(clientId)
            .stream()
            .map(job -> mapper.toJobResponse(job, documentRepository.countByJobId(job.getId())))
            .toList();
    }

    @Transactional(readOnly = true)
    public List<JobResponse> getJobsForClientUser(String userId) {
        Client client = resolveClientForUser(userId);
        return getJobsForClient(client.getId());
    }

    @Transactional(readOnly = true)
    public List<JobResponse> getCompanyJobs() {
        return jobRepository.findByClientClientTypeOrderByCreatedAtDesc(ClientType.COMPANY)
            .stream()
            .map(job -> mapper.toJobResponse(job, documentRepository.countByJobId(job.getId())))
            .toList();
    }

    @Transactional(readOnly = true)
    public List<JobResponse> getAllJobs() {
        return jobRepository.findAll()
            .stream()
            .map(job -> mapper.toJobResponse(job, documentRepository.countByJobId(job.getId())))
            .toList();
    }

    @Transactional(readOnly = true)
    public JobResponse getJob(UUID jobId, String requesterId) {
        Job job = findJobAccessible(jobId, requesterId);
        long docCount = documentRepository.countByJobId(job.getId());
        return mapper.toJobResponse(job, docCount);
    }

    public void deleteJob(UUID jobId, String requesterId) {
        Job job = findJobOwned(jobId, requesterId);
        jobRepository.delete(job);
    }

    private Job findJobOwned(UUID jobId, String requesterId) {
        Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new ResourceNotFoundException("Job not found: " + jobId));
        if (job.getPilot() == null || !job.getPilot().getId().equals(requesterId)) {
            throw new UnauthorizedException("Access denied.");
        }
        return job;
    }

    private Job findJobAccessible(UUID jobId, String requesterId) {
        Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new ResourceNotFoundException("Job not found: " + jobId));

        User requester = userRepository.findById(requesterId).orElse(null);
        boolean isPilot = job.getPilot() != null && job.getPilot().getId().equals(requesterId);
        boolean isClient = requester != null
            && requester.getRole() == Role.CLIENT
            && job.getClient() != null
            && job.getClient().getEmail() != null
            && job.getClient().getEmail().equalsIgnoreCase(requester.getEmail());
        boolean isCompany = requester != null
            && requester.getRole() == Role.COMPANY
            && job.getClient() != null
            && job.getClient().getClientType() == ClientType.COMPANY;
        boolean isAdmin = requester != null && requester.getRole() == Role.ADMIN;

        if (!isPilot && !isClient && !isCompany && !isAdmin) {
            throw new UnauthorizedException("Access denied.");
        }
        return job;
    }

    private Client resolveClientForUser(String userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        return clientRepository.findByEmailIgnoreCase(user.getEmail())
            .orElseThrow(() -> new ResourceNotFoundException("Client profile not found for: " + user.getEmail()));
    }

    private void validateStatusTransition(JobStatus current, JobStatus next) {
        boolean valid = switch (current) {
            case REQUESTED -> next == JobStatus.ACCEPTED || next == JobStatus.CANCELLED;
            case ACCEPTED -> next == JobStatus.SCHEDULED || next == JobStatus.CANCELLED;
            case SCHEDULED -> next == JobStatus.IN_PROGRESS || next == JobStatus.CANCELLED;
            case IN_PROGRESS -> next == JobStatus.COMPLETED;
            case COMPLETED -> next == JobStatus.DELIVERED;
            default -> false;
        };
        if (!valid) {
            throw new BadRequestException("Invalid status transition: " + current + " → " + next);
        }
    }
}
