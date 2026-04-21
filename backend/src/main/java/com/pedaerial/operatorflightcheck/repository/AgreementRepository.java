package com.pedaerial.operatorflightcheck.repository;

import com.pedaerial.operatorflightcheck.entity.Agreement;
import com.pedaerial.operatorflightcheck.entity.AgreementStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AgreementRepository extends JpaRepository<Agreement, UUID> {
    Optional<Agreement> findByJobId(UUID jobId);
    List<Agreement> findByStatusOrderByCreatedAtDesc(AgreementStatus status);

    @Query("SELECT COALESCE(MAX(CAST(SUBSTRING(a.agreementNumber, 10) AS int)), 0) FROM Agreement a WHERE a.agreementNumber LIKE :prefix%")
    int findMaxAgreementNumberForPrefix(@Param("prefix") String prefix);
}
