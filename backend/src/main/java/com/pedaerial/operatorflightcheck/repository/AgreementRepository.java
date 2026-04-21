package com.pedaerial.operatorflightcheck.repository;

import com.pedaerial.operatorflightcheck.entity.Agreement;
import com.pedaerial.operatorflightcheck.entity.AgreementStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AgreementRepository extends JpaRepository<Agreement, UUID> {
    Optional<Agreement> findByJobId(UUID jobId);
    List<Agreement> findByStatusOrderByCreatedAtDesc(AgreementStatus status);
}
