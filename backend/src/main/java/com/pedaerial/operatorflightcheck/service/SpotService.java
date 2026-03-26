package com.pedaerial.operatorflightcheck.service;

import com.pedaerial.operatorflightcheck.dto.SpotRequest;
import com.pedaerial.operatorflightcheck.dto.SpotResponse;
import com.pedaerial.operatorflightcheck.entity.Spot;
import com.pedaerial.operatorflightcheck.entity.User;
import com.pedaerial.operatorflightcheck.exception.ResourceNotFoundException;
import com.pedaerial.operatorflightcheck.repository.SpotRepository;
import com.pedaerial.operatorflightcheck.repository.UserRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class SpotService {

    private final SpotRepository spotRepository;
    private final UserRepository userRepository;

    public SpotService(SpotRepository spotRepository, UserRepository userRepository) {
        this.spotRepository = spotRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<SpotResponse> getSpotsForUser(String userId) {
        return spotRepository.findByUserId(userId)
            .stream()
            .map(this::toResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public SpotResponse getSpotById(String userId, String spotId) {
        return toResponse(getOwnedSpot(userId, spotId));
    }

    public SpotResponse createSpot(String userId, SpotRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        Spot spot = new Spot();
        spot.setUser(user);
        applyRequest(spot, request);

        return toResponse(spotRepository.save(spot));
    }

    public SpotResponse updateSpot(String userId, String spotId, SpotRequest request) {
        Spot spot = getOwnedSpot(userId, spotId);
        applyRequest(spot, request);
        return toResponse(spotRepository.save(spot));
    }

    public void deleteSpot(String userId, String spotId) {
        Spot spot = getOwnedSpot(userId, spotId);
        spotRepository.delete(spot);
    }

    private Spot getOwnedSpot(String userId, String spotId) {
        return spotRepository.findByIdAndUserId(spotId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Spot not found: " + spotId));
    }

    private void applyRequest(Spot spot, SpotRequest request) {
        spot.setLabel(request.getLabel());
        spot.setAddress(request.getAddress());
        spot.setLat(request.getLat());
        spot.setLon(request.getLon());
        spot.setNotes(request.getNotes());
        spot.setFavorite(Boolean.TRUE.equals(request.getFavorite()));
    }

    private SpotResponse toResponse(Spot spot) {
        return new SpotResponse(
            spot.getId(),
            spot.getUser().getId(),
            spot.getLabel(),
            spot.getAddress(),
            spot.getLat(),
            spot.getLon(),
            spot.getNotes(),
            Boolean.TRUE.equals(spot.getFavorite()),
            spot.getCreatedAt()
        );
    }
}
