package com.pedaerial.operatorflightcheck.controller;

import com.pedaerial.operatorflightcheck.dto.MissionCompletionRequest;
import com.pedaerial.operatorflightcheck.dto.MissionRequest;
import com.pedaerial.operatorflightcheck.dto.MissionResponse;
import com.pedaerial.operatorflightcheck.security.AppUserPrincipal;
import com.pedaerial.operatorflightcheck.service.MissionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/missions")
public class MissionController {

    private final MissionService missionService;

    public MissionController(MissionService missionService) {
        this.missionService = missionService;
    }

    @PostMapping
    public ResponseEntity<MissionResponse> createMission(@Valid @RequestBody MissionRequest request,
                                                          @AuthenticationPrincipal AppUserPrincipal principal) {
        return ResponseEntity.ok(missionService.createMission(request, principal.getId()));
    }

    @GetMapping("/job/{jobId}")
    public ResponseEntity<List<MissionResponse>> getMissionsForJob(@PathVariable UUID jobId) {
        return ResponseEntity.ok(missionService.getMissionsForJob(jobId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MissionResponse> getMission(@PathVariable UUID id) {
        return ResponseEntity.ok(missionService.getMission(id));
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<MissionResponse> completeMission(@PathVariable UUID id,
                                                            @RequestBody MissionCompletionRequest request,
                                                            @AuthenticationPrincipal AppUserPrincipal principal) {
        return ResponseEntity.ok(missionService.completeMission(id, request, principal.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMission(@PathVariable UUID id,
                                               @AuthenticationPrincipal AppUserPrincipal principal) {
        missionService.deleteMission(id, principal.getId());
        return ResponseEntity.noContent().build();
    }
}
