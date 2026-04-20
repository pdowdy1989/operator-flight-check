package com.pedaerial.operatorflightcheck.controller;

import com.pedaerial.operatorflightcheck.dto.JobRequest;
import com.pedaerial.operatorflightcheck.dto.JobResponse;
import com.pedaerial.operatorflightcheck.dto.JobStatusUpdateRequest;
import com.pedaerial.operatorflightcheck.entity.Role;
import com.pedaerial.operatorflightcheck.security.AppUserPrincipal;
import com.pedaerial.operatorflightcheck.service.JobService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    private final JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    @PostMapping
    public ResponseEntity<JobResponse> createJob(@Valid @RequestBody JobRequest request,
                                                  @AuthenticationPrincipal AppUserPrincipal principal) {
        return ResponseEntity.ok(jobService.createJob(request, principal.getId()));
    }

    @GetMapping
    public ResponseEntity<List<JobResponse>> listJobs(@AuthenticationPrincipal AppUserPrincipal principal) {
        List<JobResponse> jobs;
        if (principal.getRole() == Role.ADMIN) {
            jobs = jobService.getAllJobs();
        } else if (principal.getRole() == Role.PILOT) {
            jobs = jobService.getJobsForPilot(principal.getId());
        } else if (principal.getRole() == Role.CLIENT) {
            jobs = jobService.getJobsForClientUser(principal.getId());
        } else if (principal.getRole() == Role.COMPANY) {
            jobs = jobService.getCompanyJobs();
        } else {
            jobs = jobService.getAllJobs();
        }
        return ResponseEntity.ok(jobs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobResponse> getJob(@PathVariable UUID id,
                                               @AuthenticationPrincipal AppUserPrincipal principal) {
        return ResponseEntity.ok(jobService.getJob(id, principal.getId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobResponse> updateJob(@PathVariable UUID id,
                                                  @Valid @RequestBody JobRequest request,
                                                  @AuthenticationPrincipal AppUserPrincipal principal) {
        return ResponseEntity.ok(jobService.updateJob(id, request, principal.getId()));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<JobResponse> updateStatus(@PathVariable UUID id,
                                                     @Valid @RequestBody JobStatusUpdateRequest request,
                                                     @AuthenticationPrincipal AppUserPrincipal principal) {
        return ResponseEntity.ok(jobService.updateJobStatus(id, request.status(), principal.getId()));
    }

    @PatchMapping("/{id}/accept")
    public ResponseEntity<JobResponse> acceptJob(@PathVariable UUID id,
                                                  @AuthenticationPrincipal AppUserPrincipal principal) {
        return ResponseEntity.ok(jobService.acceptJob(id, principal.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJob(@PathVariable UUID id,
                                           @AuthenticationPrincipal AppUserPrincipal principal) {
        jobService.deleteJob(id, principal.getId());
        return ResponseEntity.noContent().build();
    }
}
