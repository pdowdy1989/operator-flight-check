package com.pedaerial.operatorflightcheck.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.pedaerial.operatorflightcheck.dto.SpotCheckRequest;
import com.pedaerial.operatorflightcheck.dto.SpotCheckResponse;
import com.pedaerial.operatorflightcheck.entity.DroneProfile;
import com.pedaerial.operatorflightcheck.entity.Role;
import com.pedaerial.operatorflightcheck.entity.Spot;
import com.pedaerial.operatorflightcheck.entity.SpotCheck;
import com.pedaerial.operatorflightcheck.entity.User;
import com.pedaerial.operatorflightcheck.exception.ResourceNotFoundException;
import com.pedaerial.operatorflightcheck.repository.DroneProfileRepository;
import com.pedaerial.operatorflightcheck.repository.SpotCheckRepository;
import com.pedaerial.operatorflightcheck.repository.SpotRepository;
import com.pedaerial.operatorflightcheck.repository.UserRepository;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

@ExtendWith(MockitoExtension.class)
class SpotCheckServiceTests {

    @Mock
    private SpotCheckRepository spotCheckRepository;

    @Mock
    private SpotRepository spotRepository;

    @Mock
    private DroneProfileRepository droneProfileRepository;

    @Mock
    private UserRepository userRepository;

    private SpotCheckService spotCheckService;

    @BeforeEach
    void setUp() {
        spotCheckService = new SpotCheckService(
            spotCheckRepository,
            spotRepository,
            droneProfileRepository,
            userRepository
        );
    }

    @Test
    // Verifies that paginated listing maps repository checks into API responses without losing spot details.
    void getChecksForUserReturnsMappedPage() {
        SpotCheck check = spotCheck("check-1", "user-1", "spot-1", "Laguna Cliffs", "profile-1", "DJI Air 3");
        when(spotCheckRepository.findPageByUserId("user-1", PageRequest.of(0, 20)))
            .thenReturn(new PageImpl<>(List.of(check)));

        Page<SpotCheckResponse> page = spotCheckService.getChecksForUser("user-1", PageRequest.of(0, 20));

        assertThat(page.getContent()).hasSize(1);
        assertThat(page.getContent().get(0).spotLabel()).isEqualTo("Laguna Cliffs");
        assertThat(page.getContent().get(0).profileName()).isEqualTo("DJI Air 3");
    }

    @Test
    // Verifies that fetching a spot check by id only succeeds when it belongs to the requesting user.
    void getCheckByIdReturnsOwnedCheck() {
        when(spotCheckRepository.findByIdAndUserId("check-1", "user-1"))
            .thenReturn(Optional.of(spotCheck("check-1", "user-1", "spot-1", "Laguna Cliffs", null, null)));

        SpotCheckResponse response = spotCheckService.getCheckById("user-1", "check-1");

        assertThat(response.id()).isEqualTo("check-1");
        assertThat(response.spotLabel()).isEqualTo("Laguna Cliffs");
    }

    @Test
    // Verifies that creating a spot check links the user, spot, and optional profile before persistence.
    void createCheckPersistsCheckForExistingUser() {
        User user = user("user-1");
        Spot spot = spot("spot-1", "user-1", "Laguna Cliffs");
        DroneProfile profile = profile("profile-1", "user-1", "DJI Air 3");
        SpotCheckRequest request = spotCheckRequest("spot-1", "profile-1");
        when(userRepository.findById("user-1")).thenReturn(Optional.of(user));
        when(spotRepository.findByIdAndUserId("spot-1", "user-1")).thenReturn(Optional.of(spot));
        when(droneProfileRepository.findByIdAndUserId("profile-1", "user-1")).thenReturn(Optional.of(profile));
        when(spotCheckRepository.save(any(SpotCheck.class))).thenAnswer(invocation -> {
            SpotCheck saved = invocation.getArgument(0);
            saved.setId("check-1");
            saved.setCreatedAt(Instant.parse("2026-03-26T11:00:00Z"));
            return saved;
        });

        SpotCheckResponse response = spotCheckService.createCheck("user-1", request);

        assertThat(response.id()).isEqualTo("check-1");
        assertThat(response.profileId()).isEqualTo("profile-1");
        assertThat(response.status()).isEqualTo("GREEN");
    }

    @Test
    // Verifies that creating a check fails when the spot does not belong to the requesting user.
    void createCheckRejectsMissingSpot() {
        when(userRepository.findById("user-1")).thenReturn(Optional.of(user("user-1")));
        when(spotRepository.findByIdAndUserId("spot-404", "user-1")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> spotCheckService.createCheck("user-1", spotCheckRequest("spot-404", null)))
            .isInstanceOf(ResourceNotFoundException.class)
            .hasMessage("Spot not found: spot-404");
    }

    @Test
    // Verifies that updating a check rewrites the editable fields while keeping ownership checks intact.
    void updateCheckUpdatesOwnedCheck() {
        SpotCheck existing = spotCheck("check-1", "user-1", "spot-1", "Laguna Cliffs", null, null);
        SpotCheckRequest request = spotCheckRequest("spot-1", null);
        request.setStatus("yellow");
        request.setSummary("Updated summary");
        when(spotCheckRepository.findByIdAndUserId("check-1", "user-1")).thenReturn(Optional.of(existing));
        when(spotRepository.findByIdAndUserId("spot-1", "user-1"))
            .thenReturn(Optional.of(spot("spot-1", "user-1", "Laguna Cliffs")));
        when(spotCheckRepository.save(existing)).thenReturn(existing);

        SpotCheckResponse response = spotCheckService.updateCheck("user-1", "check-1", request);

        assertThat(response.status()).isEqualTo("YELLOW");
        assertThat(existing.getSummary()).isEqualTo("Updated summary");
    }

    @Test
    // Verifies that deleting a spot check delegates to the repository only after ownership is confirmed.
    void deleteCheckDeletesOwnedCheck() {
        SpotCheck existing = spotCheck("check-1", "user-1", "spot-1", "Laguna Cliffs", null, null);
        when(spotCheckRepository.findByIdAndUserId("check-1", "user-1")).thenReturn(Optional.of(existing));

        spotCheckService.deleteCheck("user-1", "check-1");

        verify(spotCheckRepository).delete(existing);
    }

    private SpotCheckRequest spotCheckRequest(String spotId, String profileId) {
        SpotCheckRequest request = new SpotCheckRequest();
        request.setSpotId(spotId);
        request.setProfileId(profileId);
        request.setDate(LocalDate.of(2026, 3, 26));
        request.setStatus("green");
        request.setSummary("Conditions look good");
        request.setNotes("Captured in service test");
        return request;
    }

    private SpotCheck spotCheck(
        String id,
        String userId,
        String spotId,
        String spotLabel,
        String profileId,
        String profileName
    ) {
        SpotCheck check = new SpotCheck();
        check.setId(id);
        check.setUser(user(userId));
        check.setSpot(spot(spotId, userId, spotLabel));
        if (profileId != null) {
            check.setProfile(profile(profileId, userId, profileName));
        }
        check.setDate(LocalDate.of(2026, 3, 26));
        check.setStatus("GREEN");
        check.setSummary("Good conditions");
        check.setNotes("Saved note");
        check.setCreatedAt(Instant.parse("2026-03-26T11:00:00Z"));
        return check;
    }

    private Spot spot(String id, String userId, String label) {
        Spot spot = new Spot();
        spot.setId(id);
        spot.setUser(user(userId));
        spot.setLabel(label);
        spot.setAddress(label + ", CA");
        spot.setLat(new BigDecimal("33.618900"));
        spot.setLon(new BigDecimal("-117.929800"));
        spot.setFavorite(true);
        return spot;
    }

    private DroneProfile profile(String id, String userId, String name) {
        DroneProfile profile = new DroneProfile();
        profile.setId(id);
        profile.setUser(user(userId));
        profile.setName(name);
        profile.setType("Prosumer");
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
