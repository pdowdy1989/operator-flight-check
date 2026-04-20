package com.pedaerial.operatorflightcheck.repository;

import com.pedaerial.operatorflightcheck.entity.ClientType;
import com.pedaerial.operatorflightcheck.entity.Job;
import com.pedaerial.operatorflightcheck.entity.JobStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface JobRepository extends JpaRepository<Job, UUID> {
    List<Job> findByPilotIdOrderByCreatedAtDesc(String pilotId);
    List<Job> findByClientIdOrderByCreatedAtDesc(UUID clientId);
    List<Job> findByClientClientTypeOrderByCreatedAtDesc(ClientType clientType);
    List<Job> findByStatusIn(List<JobStatus> statuses);
    List<Job> findByPilotIdAndStatus(String pilotId, JobStatus status);

    @Query("SELECT j FROM Job j WHERE j.client.clientType = :clientType AND j.status = :status")
    List<Job> findJobsByClientTypeAndStatus(@Param("clientType") ClientType clientType, @Param("status") JobStatus status);
}
