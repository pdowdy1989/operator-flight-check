package com.pedaerial.operatorflightcheck.controller;

import com.pedaerial.operatorflightcheck.dto.DroneProfileRequest;
import com.pedaerial.operatorflightcheck.dto.DroneProfileResponse;
import com.pedaerial.operatorflightcheck.service.DroneProfileService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/drone-profiles")
public class DroneProfileController {

    private final DroneProfileService droneProfileService;

    public DroneProfileController(DroneProfileService droneProfileService) {
        this.droneProfileService = droneProfileService;
    }

    @GetMapping
    public List<DroneProfileResponse> listProfiles(@RequestHeader("X-User-Id") String userId) {
        return droneProfileService.getProfilesForUser(userId);
    }

    @GetMapping("/{id}")
    public DroneProfileResponse getProfile(
        @RequestHeader("X-User-Id") String userId,
        @PathVariable String id
    ) {
        return droneProfileService.getProfileById(userId, id);
    }

    @PostMapping
    public ResponseEntity<DroneProfileResponse> createProfile(
        @RequestHeader("X-User-Id") String userId,
        @Valid @RequestBody DroneProfileRequest request
    ) {
        DroneProfileResponse response = droneProfileService.createProfile(userId, request);
        return ResponseEntity
            .created(URI.create("/api/drone-profiles/" + response.id()))
            .body(response);
    }

    @PutMapping("/{id}")
    public DroneProfileResponse updateProfile(
        @RequestHeader("X-User-Id") String userId,
        @PathVariable String id,
        @Valid @RequestBody DroneProfileRequest request
    ) {
        return droneProfileService.updateProfile(userId, id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProfile(
        @RequestHeader("X-User-Id") String userId,
        @PathVariable String id
    ) {
        droneProfileService.deleteProfile(userId, id);
        return ResponseEntity.noContent().build();
    }
}
