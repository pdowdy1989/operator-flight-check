package com.pedaerial.operatorflightcheck.controller;

import com.pedaerial.operatorflightcheck.dto.SpotCheckRequest;
import com.pedaerial.operatorflightcheck.dto.SpotCheckResponse;
import com.pedaerial.operatorflightcheck.service.SpotCheckService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.net.URI;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
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
@RequestMapping("/api/spot-checks")
@Tag(name = "Spot Checks", description = "Create and manage logged flight decision checks.")
public class SpotCheckController {

    private final SpotCheckService spotCheckService;

    public SpotCheckController(SpotCheckService spotCheckService) {
        this.spotCheckService = spotCheckService;
    }

    @GetMapping
    @Operation(summary = "List spot checks", description = "Returns the authenticated user's spot checks with pagination.")
    public Page<SpotCheckResponse> listChecks(
        @RequestHeader("X-User-Id") String userId,
        @ParameterObject @PageableDefault(size = 20) Pageable pageable
    ) {
        return spotCheckService.getChecksForUser(userId, pageable);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a spot check", description = "Returns a single spot check owned by the authenticated user.")
    public SpotCheckResponse getCheck(
        @RequestHeader("X-User-Id") String userId,
        @PathVariable String id
    ) {
        return spotCheckService.getCheckById(userId, id);
    }

    @PostMapping
    @Operation(summary = "Create a spot check", description = "Creates a new spot check record linked to a saved spot and optional drone profile.")
    public ResponseEntity<SpotCheckResponse> createCheck(
        @RequestHeader("X-User-Id") String userId,
        @Valid @RequestBody SpotCheckRequest request
    ) {
        SpotCheckResponse response = spotCheckService.createCheck(userId, request);
        return ResponseEntity
            .created(URI.create("/api/spot-checks/" + response.id()))
            .body(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a spot check", description = "Updates an existing spot check owned by the authenticated user.")
    public SpotCheckResponse updateCheck(
        @RequestHeader("X-User-Id") String userId,
        @PathVariable String id,
        @Valid @RequestBody SpotCheckRequest request
    ) {
        return spotCheckService.updateCheck(userId, id, request);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a spot check", description = "Deletes an existing spot check owned by the authenticated user.")
    public ResponseEntity<Void> deleteCheck(
        @RequestHeader("X-User-Id") String userId,
        @PathVariable String id
    ) {
        spotCheckService.deleteCheck(userId, id);
        return ResponseEntity.noContent().build();
    }
}
