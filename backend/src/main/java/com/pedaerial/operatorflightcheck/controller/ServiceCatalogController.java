package com.pedaerial.operatorflightcheck.controller;

import com.pedaerial.operatorflightcheck.dto.ServiceCatalogRequest;
import com.pedaerial.operatorflightcheck.dto.ServiceCatalogResponse;
import com.pedaerial.operatorflightcheck.entity.Role;
import com.pedaerial.operatorflightcheck.security.AppUserPrincipal;
import com.pedaerial.operatorflightcheck.service.ServiceCatalogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/service-catalog")
@RequiredArgsConstructor
public class ServiceCatalogController {

    private final ServiceCatalogService serviceCatalogService;

    @GetMapping("/active")
    public List<ServiceCatalogResponse> listActive() {
        return serviceCatalogService.listActive();
    }

    @GetMapping
    public List<ServiceCatalogResponse> listAll(@AuthenticationPrincipal AppUserPrincipal principal) {
        requirePilotOrAdmin(principal);
        return serviceCatalogService.listAll();
    }

    @GetMapping("/{id}")
    public ServiceCatalogResponse get(@PathVariable UUID id,
                                      @AuthenticationPrincipal AppUserPrincipal principal) {
        requirePilotOrAdmin(principal);
        return serviceCatalogService.get(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ServiceCatalogResponse create(@RequestBody @Valid ServiceCatalogRequest req,
                                         @AuthenticationPrincipal AppUserPrincipal principal) {
        requirePilotOrAdmin(principal);
        return serviceCatalogService.create(req);
    }

    @PutMapping("/{id}")
    public ServiceCatalogResponse update(@PathVariable UUID id,
                                         @RequestBody @Valid ServiceCatalogRequest req,
                                         @AuthenticationPrincipal AppUserPrincipal principal) {
        requirePilotOrAdmin(principal);
        return serviceCatalogService.update(id, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id,
                       @AuthenticationPrincipal AppUserPrincipal principal) {
        requirePilotOrAdmin(principal);
        serviceCatalogService.delete(id);
    }

    private void requirePilotOrAdmin(AppUserPrincipal principal) {
        if (principal.getRole() != Role.PILOT && principal.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("Pilots and admins only");
        }
    }
}
