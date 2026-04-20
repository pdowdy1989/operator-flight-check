package com.pedaerial.operatorflightcheck.controller;

import com.pedaerial.operatorflightcheck.dto.DashboardResponse;
import com.pedaerial.operatorflightcheck.entity.Role;
import com.pedaerial.operatorflightcheck.security.AppUserPrincipal;
import com.pedaerial.operatorflightcheck.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public ResponseEntity<DashboardResponse> getDashboard(@AuthenticationPrincipal AppUserPrincipal principal) {
        DashboardResponse response;
        if (principal.getRole() == Role.COMPANY) {
            response = dashboardService.getCompanyDashboard(principal.getId());
        } else if (principal.getRole() == Role.CLIENT) {
            response = dashboardService.getClientDashboard(principal.getId());
        } else {
            response = dashboardService.getPilotDashboard(principal.getId());
        }
        return ResponseEntity.ok(response);
    }
}
