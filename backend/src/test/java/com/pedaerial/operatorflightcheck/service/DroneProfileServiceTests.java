package com.pedaerial.operatorflightcheck.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.pedaerial.operatorflightcheck.dto.DroneProfileRequest;
import com.pedaerial.operatorflightcheck.dto.DroneProfileResponse;
import com.pedaerial.operatorflightcheck.entity.DroneProfile;
import com.pedaerial.operatorflightcheck.entity.Role;
import com.pedaerial.operatorflightcheck.entity.User;
import com.pedaerial.operatorflightcheck.exception.ResourceNotFoundException;
import com.pedaerial.operatorflightcheck.repository.DroneProfileRepository;
import com.pedaerial.operatorflightcheck.repository.UserRepository;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class DroneProfileServiceTests {

    @Mock
    private DroneProfileRepository droneProfileRepository;

    @Mock
    private UserRepository userRepository;

    private DroneProfileService droneProfileService;

    @BeforeEach
    void setUp() {
        droneProfileService = new DroneProfileService(droneProfileRepository, userRepository);
    }

    @Test
    // Verifies that listing profiles returns the current user's saved threshold configurations.
    void getProfilesForUserReturnsMappedResponses() {
        when(droneProfileRepository.findByUserId("user-1"))
            .thenReturn(List.of(profile("profile-1", "user-1", "Mini 4 Pro")));

        List<DroneProfileResponse> results = droneProfileService.getProfilesForUser("user-1");

        assertThat(results).hasSize(1);
        assertThat(results.get(0).name()).isEqualTo("Mini 4 Pro");
    }

    @Test
    // Verifies that reading a single profile succeeds only when it belongs to the requesting user.
    void getProfileByIdReturnsOwnedProfile() {
        when(droneProfileRepository.findByIdAndUserId("profile-1", "user-1"))
            .thenReturn(Optional.of(profile("profile-1", "user-1", "Mini 4 Pro")));

        DroneProfileResponse response = droneProfileService.getProfileById("user-1", "profile-1");

        assertThat(response.id()).isEqualTo("profile-1");
        assertThat(response.userId()).isEqualTo("user-1");
    }

    @Test
    // Verifies that creating a profile persists the requested thresholds under the owning user.
    void createProfilePersistsThresholdsForExistingUser() {
        User user = user("user-1");
        DroneProfileRequest request = profileRequest("DJI Air 3");
        when(userRepository.findById("user-1")).thenReturn(Optional.of(user));
        when(droneProfileRepository.save(any(DroneProfile.class))).thenAnswer(invocation -> {
            DroneProfile saved = invocation.getArgument(0);
            saved.setId("profile-1");
            saved.setCreatedAt(Instant.parse("2026-03-26T10:00:00Z"));
            return saved;
        });

        DroneProfileResponse response = droneProfileService.createProfile("user-1", request);

        assertThat(response.id()).isEqualTo("profile-1");
        assertThat(response.name()).isEqualTo("DJI Air 3");
        assertThat(response.gustYellowMph()).isEqualTo(24);
    }

    @Test
    // Verifies that profile creation fails when the target user account does not exist.
    void createProfileRejectsMissingUser() {
        when(userRepository.findById("missing-user")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> droneProfileService.createProfile("missing-user", profileRequest("Mini 4 Pro")))
            .isInstanceOf(ResourceNotFoundException.class)
            .hasMessage("User not found: missing-user");
    }

    @Test
    // Verifies that updating a profile overwrites the threshold values for an owned profile.
    void updateProfileUpdatesOwnedProfile() {
        DroneProfile existing = profile("profile-1", "user-1", "Old Profile");
        DroneProfileRequest request = profileRequest("Updated Profile");
        when(droneProfileRepository.findByIdAndUserId("profile-1", "user-1")).thenReturn(Optional.of(existing));
        when(droneProfileRepository.save(existing)).thenReturn(existing);

        DroneProfileResponse response = droneProfileService.updateProfile("user-1", "profile-1", request);

        assertThat(response.name()).isEqualTo("Updated Profile");
        assertThat(existing.getPrecipYellowPct()).isEqualTo(30);
    }

    @Test
    // Verifies that updating a missing or non-owned profile returns the domain not-found error.
    void updateProfileRejectsMissingProfile() {
        when(droneProfileRepository.findByIdAndUserId("profile-404", "user-1")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> droneProfileService.updateProfile("user-1", "profile-404", profileRequest("Updated")))
            .isInstanceOf(ResourceNotFoundException.class)
            .hasMessage("Drone profile not found: profile-404");
    }

    @Test
    // Verifies that deleting a profile only happens after ownership has been confirmed.
    void deleteProfileDeletesOwnedProfile() {
        DroneProfile existing = profile("profile-1", "user-1", "Delete Me");
        when(droneProfileRepository.findByIdAndUserId("profile-1", "user-1")).thenReturn(Optional.of(existing));

        droneProfileService.deleteProfile("user-1", "profile-1");

        verify(droneProfileRepository).delete(existing);
    }

    private DroneProfileRequest profileRequest(String name) {
        DroneProfileRequest request = new DroneProfileRequest();
        request.setName(name);
        request.setType("Prosumer");
        request.setWindGreenMph(12);
        request.setWindYellowMph(18);
        request.setGustGreenMph(16);
        request.setGustYellowMph(24);
        request.setPrecipGreenPct(10);
        request.setPrecipYellowPct(30);
        return request;
    }

    private DroneProfile profile(String id, String userId, String name) {
        DroneProfile profile = new DroneProfile();
        profile.setId(id);
        profile.setUser(user(userId));
        profile.setName(name);
        profile.setType("Prosumer");
        profile.setWindGreenMph(12);
        profile.setWindYellowMph(18);
        profile.setGustGreenMph(16);
        profile.setGustYellowMph(24);
        profile.setPrecipGreenPct(10);
        profile.setPrecipYellowPct(30);
        profile.setCreatedAt(Instant.parse("2026-03-26T10:00:00Z"));
        return profile;
    }

    private User user(String id) {
        User user = new User();
        user.setId(id);
        user.setEmail(id + "@pedaerial.com");
        user.setPasswordHash("hash");
        user.setRole(Role.USER);
        return user;
    }
}
