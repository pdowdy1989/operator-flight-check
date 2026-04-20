package com.pedaerial.operatorflightcheck.repository;

import com.pedaerial.operatorflightcheck.entity.InsuranceDetails;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface InsuranceDetailsRepository extends JpaRepository<InsuranceDetails, UUID> {
    Optional<InsuranceDetails> findByJobId(UUID jobId);
}
