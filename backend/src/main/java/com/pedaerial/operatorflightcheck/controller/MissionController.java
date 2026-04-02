package com.pedaerial.operatorflightcheck.controller;

import com.pedaerial.operatorflightcheck.dto.MissionRequest;
import com.pedaerial.operatorflightcheck.dto.MissionResponse;
import com.pedaerial.operatorflightcheck.service.MissionService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/missions")
public class MissionController {

    private final MissionService missionService;

    public MissionController(MissionService missionService) {
        this.missionService = missionService;
    }

    @PostMapping
    public ResponseEntity<MissionResponse> createMission(
        @RequestHeader("X-User-Id") String userId,
        @Valid @RequestBody MissionRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(missionService.createMission(userId, request));
    }

    @GetMapping
    public ResponseEntity<Page<MissionResponse>> getMissions(
        @RequestHeader("X-User-Id") String userId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(missionService.getMissions(userId, PageRequest.of(page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MissionResponse> getMissionById(
        @RequestHeader("X-User-Id") String userId,
        @PathVariable String id
    ) {
        return ResponseEntity.ok(missionService.getMissionById(userId, id));
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<MissionResponse>> getMissionsByClient(
        @RequestHeader("X-User-Id") String userId,
        @PathVariable String clientId
    ) {
        return ResponseEntity.ok(missionService.getMissionsByClient(userId, clientId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MissionResponse> updateMission(
        @RequestHeader("X-User-Id") String userId,
        @PathVariable String id,
        @Valid @RequestBody MissionRequest request
    ) {
        return ResponseEntity.ok(missionService.updateMission(userId, id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMission(
        @RequestHeader("X-User-Id") String userId,
        @PathVariable String id
    ) {
        missionService.deleteMission(userId, id);
        return ResponseEntity.noContent().build();
    }
}
