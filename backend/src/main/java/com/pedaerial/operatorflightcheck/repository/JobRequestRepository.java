package com.pedaerial.operatorflightcheck.repository;

import com.pedaerial.operatorflightcheck.entity.JobRequest;
import com.pedaerial.operatorflightcheck.entity.JobRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface JobRequestRepository extends JpaRepository<JobRequest, UUID> {
    List<JobRequest> findByRequesterIdOrderByCreatedAtDesc(String requesterId);
    List<JobRequest> findByStatusOrderByCreatedAtDesc(JobRequestStatus status);
    List<JobRequest> findByReviewedByPilotIdOrderByCreatedAtDesc(String pilotId);
}
