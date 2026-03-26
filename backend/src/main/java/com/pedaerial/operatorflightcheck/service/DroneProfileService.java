package com.pedaerial.operatorflightcheck.service;

import com.pedaerial.operatorflightcheck.dto.DroneProfileRequest;
import com.pedaerial.operatorflightcheck.dto.DroneProfileResponse;
import com.pedaerial.operatorflightcheck.entity.DroneProfile;
import com.pedaerial.operatorflightcheck.entity.User;
import com.pedaerial.operatorflightcheck.exception.ResourceNotFoundException;
import com.pedaerial.operatorflightcheck.repository.DroneProfileRepository;
import com.pedaerial.operatorflightcheck.repository.UserRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class DroneProfileService {

    private final DroneProfileRepository droneProfileRepository;
    private final UserRepository userRepository;

    public DroneProfileService(DroneProfileRepository droneProfileRepository, UserRepository userRepository) {
        this.droneProfileRepository = droneProfileRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<DroneProfileResponse> getProfilesForUser(String userId) {
        return droneProfileRepository.findByUserId(userId)
            .stream()
            .map(this::toResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public DroneProfileResponse getProfileById(String userId, String profileId) {
        return toResponse(getOwnedProfile(userId, profileId));
    }

    public DroneProfileResponse createProfile(String userId, DroneProfileRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        DroneProfile profile = new DroneProfile();
        profile.setUser(user);
        applyRequest(profile, request);

        return toResponse(droneProfileRepository.save(profile));
    }

    public DroneProfileResponse updateProfile(String userId, String profileId, DroneProfileRequest request) {
        DroneProfile profile = getOwnedProfile(userId, profileId);
        applyRequest(profile, request);
        return toResponse(droneProfileRepository.save(profile));
    }

    public void deleteProfile(String userId, String profileId) {
        DroneProfile profile = getOwnedProfile(userId, profileId);
        droneProfileRepository.delete(profile);
    }

    private DroneProfile getOwnedProfile(String userId, String profileId) {
        return droneProfileRepository.findByIdAndUserId(profileId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Drone profile not found: " + profileId));
    }

    private void applyRequest(DroneProfile profile, DroneProfileRequest request) {
        profile.setName(request.getName());
        profile.setType(request.getType());
        profile.setWindGreenMph(request.getWindGreenMph());
        profile.setWindYellowMph(request.getWindYellowMph());
        profile.setGustGreenMph(request.getGustGreenMph());
        profile.setGustYellowMph(request.getGustYellowMph());
        profile.setPrecipGreenPct(request.getPrecipGreenPct());
        profile.setPrecipYellowPct(request.getPrecipYellowPct());
    }

    private DroneProfileResponse toResponse(DroneProfile profile) {
        return new DroneProfileResponse(
            profile.getId(),
            profile.getUser().getId(),
            profile.getName(),
            profile.getType(),
            profile.getWindGreenMph(),
            profile.getWindYellowMph(),
            profile.getGustGreenMph(),
            profile.getGustYellowMph(),
            profile.getPrecipGreenPct(),
            profile.getPrecipYellowPct(),
            profile.getCreatedAt()
        );
    }
}
