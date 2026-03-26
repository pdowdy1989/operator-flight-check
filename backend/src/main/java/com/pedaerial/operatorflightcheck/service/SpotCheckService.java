package com.pedaerial.operatorflightcheck.service;

import com.pedaerial.operatorflightcheck.dto.SpotCheckRequest;
import com.pedaerial.operatorflightcheck.dto.SpotCheckResponse;
import com.pedaerial.operatorflightcheck.entity.DroneProfile;
import com.pedaerial.operatorflightcheck.entity.Spot;
import com.pedaerial.operatorflightcheck.entity.SpotCheck;
import com.pedaerial.operatorflightcheck.entity.User;
import com.pedaerial.operatorflightcheck.exception.ResourceNotFoundException;
import com.pedaerial.operatorflightcheck.repository.DroneProfileRepository;
import com.pedaerial.operatorflightcheck.repository.SpotCheckRepository;
import com.pedaerial.operatorflightcheck.repository.SpotRepository;
import com.pedaerial.operatorflightcheck.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class SpotCheckService {

    private final SpotCheckRepository spotCheckRepository;
    private final SpotRepository spotRepository;
    private final DroneProfileRepository droneProfileRepository;
    private final UserRepository userRepository;

    public SpotCheckService(
        SpotCheckRepository spotCheckRepository,
        SpotRepository spotRepository,
        DroneProfileRepository droneProfileRepository,
        UserRepository userRepository
    ) {
        this.spotCheckRepository = spotCheckRepository;
        this.spotRepository = spotRepository;
        this.droneProfileRepository = droneProfileRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public Page<SpotCheckResponse> getChecksForUser(String userId, Pageable pageable) {
        return spotCheckRepository.findPageByUserId(userId, pageable)
            .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public SpotCheckResponse getCheckById(String userId, String checkId) {
        return toResponse(getOwnedCheck(userId, checkId));
    }

    public SpotCheckResponse createCheck(String userId, SpotCheckRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        SpotCheck check = new SpotCheck();
        check.setUser(user);
        applyRequest(check, userId, request);

        return toResponse(spotCheckRepository.save(check));
    }

    public SpotCheckResponse updateCheck(String userId, String checkId, SpotCheckRequest request) {
        SpotCheck check = getOwnedCheck(userId, checkId);
        applyRequest(check, userId, request);
        return toResponse(spotCheckRepository.save(check));
    }

    public void deleteCheck(String userId, String checkId) {
        SpotCheck check = getOwnedCheck(userId, checkId);
        spotCheckRepository.delete(check);
    }

    private SpotCheck getOwnedCheck(String userId, String checkId) {
        return spotCheckRepository.findByIdAndUserId(checkId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Spot check not found: " + checkId));
    }

    private void applyRequest(SpotCheck check, String userId, SpotCheckRequest request) {
        Spot spot = spotRepository.findByIdAndUserId(request.getSpotId(), userId)
            .orElseThrow(() -> new ResourceNotFoundException("Spot not found: " + request.getSpotId()));

        check.setSpot(spot);
        check.setProfile(resolveProfile(userId, request.getProfileId()));
        check.setDate(request.getDate());
        check.setStatus(request.getStatus().trim().toUpperCase());
        check.setSummary(request.getSummary());
        check.setNotes(request.getNotes());
    }

    private DroneProfile resolveProfile(String userId, String profileId) {
        if (profileId == null || profileId.isBlank()) {
            return null;
        }

        return droneProfileRepository.findByIdAndUserId(profileId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Drone profile not found: " + profileId));
    }

    private SpotCheckResponse toResponse(SpotCheck check) {
        return new SpotCheckResponse(
            check.getId(),
            check.getUser().getId(),
            check.getSpot().getId(),
            check.getSpot().getLabel(),
            check.getProfile() != null ? check.getProfile().getId() : null,
            check.getProfile() != null ? check.getProfile().getName() : null,
            check.getDate(),
            check.getStatus(),
            check.getSummary(),
            check.getNotes(),
            check.getCreatedAt()
        );
    }
}
