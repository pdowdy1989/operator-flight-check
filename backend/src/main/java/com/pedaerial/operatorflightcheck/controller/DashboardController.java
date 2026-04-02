package com.pedaerial.operatorflightcheck.controller;

import com.pedaerial.operatorflightcheck.dto.DashboardResponse;
import com.pedaerial.operatorflightcheck.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
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
    public ResponseEntity<DashboardResponse> getDashboard(@RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(dashboardService.getDashboard(userId));
    }
}
