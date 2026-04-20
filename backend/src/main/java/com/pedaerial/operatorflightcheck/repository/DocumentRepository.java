package com.pedaerial.operatorflightcheck.repository;

import com.pedaerial.operatorflightcheck.entity.Document;
import com.pedaerial.operatorflightcheck.entity.DocumentCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface DocumentRepository extends JpaRepository<Document, UUID> {
    List<Document> findByJobIdOrderByCreatedAtDesc(UUID jobId);
    List<Document> findByJobIdAndIsDeliverableTrue(UUID jobId);
    List<Document> findByMissionIdOrderByCreatedAtDesc(UUID missionId);
    List<Document> findByJobIdAndCategory(UUID jobId, DocumentCategory category);

    @Query("SELECT COUNT(d) FROM Document d WHERE d.job.id = :jobId")
    long countByJobId(@Param("jobId") UUID jobId);
}
