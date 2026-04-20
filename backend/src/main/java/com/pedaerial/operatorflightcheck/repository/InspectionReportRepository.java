package com.pedaerial.operatorflightcheck.repository;

import com.pedaerial.operatorflightcheck.entity.InspectionReport;
import com.pedaerial.operatorflightcheck.entity.ReportStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InspectionReportRepository extends JpaRepository<InspectionReport, UUID> {
    Optional<InspectionReport> findByJobId(UUID jobId);
    List<InspectionReport> findByStatus(ReportStatus status);
    List<InspectionReport> findByPilotIdOrderByCreatedAtDesc(String pilotId);
}
