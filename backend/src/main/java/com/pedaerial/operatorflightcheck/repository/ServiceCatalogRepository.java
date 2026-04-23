package com.pedaerial.operatorflightcheck.repository;

import com.pedaerial.operatorflightcheck.entity.JobType;
import com.pedaerial.operatorflightcheck.entity.ServiceCatalog;
import com.pedaerial.operatorflightcheck.entity.ServiceCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ServiceCatalogRepository extends JpaRepository<ServiceCatalog, UUID> {
    List<ServiceCatalog> findByActiveTrueOrderBySortOrderAsc();
    List<ServiceCatalog> findByJobTypeAndActiveTrueOrderBySortOrderAsc(JobType jobType);
    List<ServiceCatalog> findByCategoryAndActiveTrueOrderBySortOrderAsc(ServiceCategory category);
    List<ServiceCatalog> findByActiveTrueOrderByCategoryAscSortOrderAsc();
}
