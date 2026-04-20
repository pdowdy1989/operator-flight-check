package com.pedaerial.operatorflightcheck.service;

import com.pedaerial.operatorflightcheck.dto.JobRequest;
import com.pedaerial.operatorflightcheck.dto.JobResponse;
import com.pedaerial.operatorflightcheck.entity.*;
import com.pedaerial.operatorflightcheck.exception.BadRequestException;
import com.pedaerial.operatorflightcheck.exception.ResourceNotFoundException;
import com.pedaerial.operatorflightcheck.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JobServiceTest {

    @Mock JobRepository jobRepository;
    @Mock ClientRepository clientRepository;
    @Mock InsuranceDetailsRepository insuranceDetailsRepository;
    @Mock UserRepository userRepository;
    @Mock DocumentRepository documentRepository;
    @Mock ResponseMapper mapper;

    @InjectMocks JobService jobService;

    private User pilot;
    private Client client;

    @BeforeEach
    void setUp() {
        pilot = new User();
        pilot.setId(UUID.randomUUID().toString());
        pilot.setEmail("pilot@test.com");
        pilot.setRole(Role.PILOT);

        client = Client.builder()
            .id(UUID.randomUUID())
            .pilot(pilot)
            .name("Test Client")
            .clientType(ClientType.INDIVIDUAL)
            .build();
    }

    @Test
    void createJob_success() {
        JobRequest request = new JobRequest(client.getId(), "Roof Survey", null,
            JobType.ROOF_SURVEY, JobPriority.NORMAL, "123 Main St", null, null, null, null, null, null, null);

        when(clientRepository.findById(client.getId())).thenReturn(Optional.of(client));
        when(userRepository.findById(pilot.getId())).thenReturn(Optional.of(pilot));
        when(jobRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(documentRepository.countByJobId(any())).thenReturn(0L);
        when(mapper.toJobResponse(any(), anyLong())).thenReturn(mock(JobResponse.class));

        JobResponse response = jobService.createJob(request, pilot.getId());

        assertThat(response).isNotNull();
        verify(jobRepository).save(any(Job.class));
    }

    @Test
    void createJob_insuranceWithoutClaimNumber_throws() {
        JobRequest request = new JobRequest(client.getId(), "Inspection", null,
            JobType.INSURANCE_INSPECTION, JobPriority.HIGH, "123 Main St", null, null, null, null, null, null, null);

        when(clientRepository.findById(client.getId())).thenReturn(Optional.of(client));
        when(userRepository.findById(pilot.getId())).thenReturn(Optional.of(pilot));
        when(jobRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        assertThatThrownBy(() -> jobService.createJob(request, pilot.getId()))
            .isInstanceOf(BadRequestException.class)
            .hasMessageContaining("claim number");
    }

    @Test
    void createJob_clientNotFound_throws() {
        UUID badClientId = UUID.randomUUID();
        JobRequest request = new JobRequest(badClientId, "Survey", null,
            JobType.ROOF_SURVEY, null, "123 Main St", null, null, null, null, null, null, null);

        when(clientRepository.findById(badClientId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> jobService.createJob(request, pilot.getId()))
            .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void updateJobStatus_validTransition_success() {
        Job job = Job.builder()
            .id(UUID.randomUUID())
            .pilot(pilot)
            .client(client)
            .title("Test")
            .status(JobStatus.REQUESTED)
            .jobType(JobType.ROOF_SURVEY)
            .siteAddress("123 Main St")
            .build();

        when(jobRepository.findById(job.getId())).thenReturn(Optional.of(job));
        when(userRepository.findById(pilot.getId())).thenReturn(Optional.of(pilot));
        when(jobRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(documentRepository.countByJobId(any())).thenReturn(0L);
        when(mapper.toJobResponse(any(), anyLong())).thenReturn(mock(JobResponse.class));

        JobResponse response = jobService.updateJobStatus(job.getId(), JobStatus.ACCEPTED, pilot.getId());

        assertThat(response).isNotNull();
        assertThat(job.getStatus()).isEqualTo(JobStatus.ACCEPTED);
    }

    @Test
    void updateJobStatus_invalidTransition_throws() {
        Job job = Job.builder()
            .id(UUID.randomUUID())
            .pilot(pilot)
            .client(client)
            .title("Test")
            .status(JobStatus.COMPLETED)
            .jobType(JobType.ROOF_SURVEY)
            .siteAddress("123 Main St")
            .build();

        when(jobRepository.findById(job.getId())).thenReturn(Optional.of(job));
        when(userRepository.findById(pilot.getId())).thenReturn(Optional.of(pilot));

        assertThatThrownBy(() -> jobService.updateJobStatus(job.getId(), JobStatus.REQUESTED, pilot.getId()))
            .isInstanceOf(BadRequestException.class)
            .hasMessageContaining("Invalid status transition");
    }

    @Test
    void getJobsForPilot_returnsOnlyPilotJobs() {
        when(jobRepository.findByPilotIdOrderByCreatedAtDesc(pilot.getId())).thenReturn(List.of());

        List<JobResponse> result = jobService.getJobsForPilot(pilot.getId());

        assertThat(result).isEmpty();
        verify(jobRepository).findByPilotIdOrderByCreatedAtDesc(pilot.getId());
        verify(jobRepository, never()).findAll();
    }
}
