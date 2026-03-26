package com.pedaerial.operatorflightcheck.controller;

import com.pedaerial.operatorflightcheck.dto.SpotRequest;
import com.pedaerial.operatorflightcheck.dto.SpotResponse;
import com.pedaerial.operatorflightcheck.service.SpotService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@RequestMapping("/api/spots")
@Tag(name = "Spots", description = "Create and manage saved flight locations.")
public class SpotController {

    private final SpotService spotService;

    public SpotController(SpotService spotService) {
        this.spotService = spotService;
    }

    @GetMapping
    @Operation(summary = "List spots", description = "Returns all saved spots owned by the authenticated user.")
    public List<SpotResponse> listSpots(@RequestHeader("X-User-Id") String userId) {
        return spotService.getSpotsForUser(userId);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a spot", description = "Returns a single saved spot owned by the authenticated user.")
    public SpotResponse getSpot(
        @RequestHeader("X-User-Id") String userId,
        @PathVariable String id
    ) {
        return spotService.getSpotById(userId, id);
    }

    @PostMapping
    @Operation(summary = "Create a spot", description = "Creates a new saved launch or observation spot.")
    public ResponseEntity<SpotResponse> createSpot(
        @RequestHeader("X-User-Id") String userId,
        @Valid @RequestBody SpotRequest request
    ) {
        SpotResponse response = spotService.createSpot(userId, request);
        return ResponseEntity
            .created(URI.create("/api/spots/" + response.id()))
            .body(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a spot", description = "Updates a saved spot owned by the authenticated user.")
    public SpotResponse updateSpot(
        @RequestHeader("X-User-Id") String userId,
        @PathVariable String id,
        @Valid @RequestBody SpotRequest request
    ) {
        return spotService.updateSpot(userId, id, request);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a spot", description = "Deletes a saved spot owned by the authenticated user.")
    public ResponseEntity<Void> deleteSpot(
        @RequestHeader("X-User-Id") String userId,
        @PathVariable String id
    ) {
        spotService.deleteSpot(userId, id);
        return ResponseEntity.noContent().build();
    }
}
