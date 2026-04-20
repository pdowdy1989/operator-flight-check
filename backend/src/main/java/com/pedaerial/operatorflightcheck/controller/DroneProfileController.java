package com.pedaerial.operatorflightcheck.controller;

import com.pedaerial.operatorflightcheck.dto.DroneProfileRequest;
import com.pedaerial.operatorflightcheck.dto.DroneProfileResponse;
import com.pedaerial.operatorflightcheck.security.AppUserPrincipal;
import com.pedaerial.operatorflightcheck.service.DroneProfileService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/drones")
public class DroneProfileController {

    private final DroneProfileService droneProfileService;

    public DroneProfileController(DroneProfileService droneProfileService) {
        this.droneProfileService = droneProfileService;
    }

    @PostMapping
    public ResponseEntity<DroneProfileResponse> createDrone(@Valid @RequestBody DroneProfileRequest request,
                                                             @AuthenticationPrincipal AppUserPrincipal principal) {
        return ResponseEntity.ok(droneProfileService.createDroneProfile(request, principal.getId()));
    }

    @GetMapping
    public ResponseEntity<List<DroneProfileResponse>> listDrones(@AuthenticationPrincipal AppUserPrincipal principal) {
        return ResponseEntity.ok(droneProfileService.getDronesForPilot(principal.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DroneProfileResponse> getDrone(@PathVariable UUID id,
                                                          @AuthenticationPrincipal AppUserPrincipal principal) {
        return ResponseEntity.ok(droneProfileService.getDrone(id, principal.getId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DroneProfileResponse> updateDrone(@PathVariable UUID id,
                                                             @Valid @RequestBody DroneProfileRequest request,
                                                             @AuthenticationPrincipal AppUserPrincipal principal) {
        return ResponseEntity.ok(droneProfileService.updateDrone(id, request, principal.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDrone(@PathVariable UUID id,
                                             @AuthenticationPrincipal AppUserPrincipal principal) {
        droneProfileService.deleteDrone(id, principal.getId());
        return ResponseEntity.noContent().build();
    }
}
