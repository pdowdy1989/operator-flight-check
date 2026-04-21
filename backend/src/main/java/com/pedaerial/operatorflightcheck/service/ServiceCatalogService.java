package com.pedaerial.operatorflightcheck.service;

import com.pedaerial.operatorflightcheck.dto.ServiceCatalogRequest;
import com.pedaerial.operatorflightcheck.dto.ServiceCatalogResponse;
import com.pedaerial.operatorflightcheck.entity.ServiceCatalog;
import com.pedaerial.operatorflightcheck.exception.BadRequestException;
import com.pedaerial.operatorflightcheck.repository.ServiceCatalogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class ServiceCatalogService {

    private final ServiceCatalogRepository serviceCatalogRepository;
    private final ResponseMapper responseMapper;

    public ServiceCatalogResponse create(ServiceCatalogRequest req) {
        ServiceCatalog catalog = ServiceCatalog.builder()
            .jobType(req.getJobType())
            .name(req.getName())
            .description(req.getDescription())
            .basePrice(req.getBasePrice())
            .estimatedDurationMinutes(req.getEstimatedDurationMinutes())
            .active(req.getActive() != null ? req.getActive() : true)
            .sortOrder(req.getSortOrder() != null ? req.getSortOrder() : 0)
            .build();
        return responseMapper.toServiceCatalogResponse(serviceCatalogRepository.save(catalog));
    }

    public ServiceCatalogResponse update(UUID id, ServiceCatalogRequest req) {
        ServiceCatalog catalog = serviceCatalogRepository.findById(id)
            .orElseThrow(() -> new BadRequestException("Service not found: " + id));
        catalog.setJobType(req.getJobType());
        catalog.setName(req.getName());
        catalog.setDescription(req.getDescription());
        catalog.setBasePrice(req.getBasePrice());
        catalog.setEstimatedDurationMinutes(req.getEstimatedDurationMinutes());
        if (req.getActive() != null) catalog.setActive(req.getActive());
        if (req.getSortOrder() != null) catalog.setSortOrder(req.getSortOrder());
        return responseMapper.toServiceCatalogResponse(serviceCatalogRepository.save(catalog));
    }

    public void delete(UUID id) {
        ServiceCatalog catalog = serviceCatalogRepository.findById(id)
            .orElseThrow(() -> new BadRequestException("Service not found: " + id));
        catalog.setActive(false);
        serviceCatalogRepository.save(catalog);
    }

    public List<ServiceCatalogResponse> listActive() {
        return serviceCatalogRepository.findByActiveTrueOrderBySortOrderAsc()
            .stream().map(responseMapper::toServiceCatalogResponse).toList();
    }

    public List<ServiceCatalogResponse> listAll() {
        return serviceCatalogRepository.findAll()
            .stream().map(responseMapper::toServiceCatalogResponse).toList();
    }

    public ServiceCatalogResponse get(UUID id) {
        return responseMapper.toServiceCatalogResponse(findById(id));
    }

    public ServiceCatalog findById(UUID id) {
        return serviceCatalogRepository.findById(id)
            .orElseThrow(() -> new BadRequestException("Service not found: " + id));
    }
}
