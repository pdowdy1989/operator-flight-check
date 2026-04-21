package com.pedaerial.operatorflightcheck.repository;

import com.pedaerial.operatorflightcheck.entity.JobRequestLineItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface JobRequestLineItemRepository extends JpaRepository<JobRequestLineItem, UUID> {
    List<JobRequestLineItem> findByJobRequestIdOrderBySortOrderAsc(UUID jobRequestId);
}
