package com.pedaerial.operatorflightcheck.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.pedaerial.operatorflightcheck.dto.SpotRequest;
import com.pedaerial.operatorflightcheck.dto.SpotResponse;
import com.pedaerial.operatorflightcheck.entity.Role;
import com.pedaerial.operatorflightcheck.entity.Spot;
import com.pedaerial.operatorflightcheck.entity.User;
import com.pedaerial.operatorflightcheck.exception.ResourceNotFoundException;
import com.pedaerial.operatorflightcheck.repository.SpotRepository;
import com.pedaerial.operatorflightcheck.repository.UserRepository;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class SpotServiceTests {

    @Mock
    private SpotRepository spotRepository;

    @Mock
    private UserRepository userRepository;

    private SpotService spotService;

    @BeforeEach
    void setUp() {
        spotService = new SpotService(spotRepository, userRepository);
    }

    @Test
    // Verifies that listing spots only transforms and returns the repository results for that user.
    void getSpotsForUserReturnsMappedResponses() {
        when(spotRepository.findByUserId("user-1")).thenReturn(List.of(spot("spot-1", "user-1", "Laguna Cliffs")));

        List<SpotResponse> results = spotService.getSpotsForUser("user-1");

        assertThat(results).hasSize(1);
        assertThat(results.get(0).label()).isEqualTo("Laguna Cliffs");
    }

    @Test
    // Verifies that fetching a spot by id succeeds only when the spot belongs to the requesting user.
    void getSpotByIdReturnsOwnedSpot() {
        when(spotRepository.findByIdAndUserId("spot-1", "user-1"))
            .thenReturn(Optional.of(spot("spot-1", "user-1", "Laguna Cliffs")));

        SpotResponse response = spotService.getSpotById("user-1", "spot-1");

        assertThat(response.id()).isEqualTo("spot-1");
        assertThat(response.userId()).isEqualTo("user-1");
    }

    @Test
    // Verifies that creating a spot attaches it to the owning user and persists the request fields.
    void createSpotPersistsSpotForExistingUser() {
        User user = user("user-1");
        SpotRequest request = spotRequest("Cliffside Launch");
        when(userRepository.findById("user-1")).thenReturn(Optional.of(user));
        when(spotRepository.save(any(Spot.class))).thenAnswer(invocation -> {
            Spot saved = invocation.getArgument(0);
            saved.setId("spot-1");
            saved.setCreatedAt(Instant.parse("2026-03-26T10:00:00Z"));
            return saved;
        });

        SpotResponse response = spotService.createSpot("user-1", request);

        assertThat(response.id()).isEqualTo("spot-1");
        assertThat(response.address()).isEqualTo("Cliffside Launch, CA");
        assertThat(response.favorite()).isTrue();
    }

    @Test
    // Verifies that creating a spot fails fast when the owning user does not exist.
    void createSpotRejectsMissingUser() {
        when(userRepository.findById("missing-user")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> spotService.createSpot("missing-user", spotRequest("Missing User Spot")))
            .isInstanceOf(ResourceNotFoundException.class)
            .hasMessage("User not found: missing-user");
    }

    @Test
    // Verifies that updating a spot rewrites the editable fields while keeping ownership checks in place.
    void updateSpotUpdatesOwnedSpot() {
        Spot existing = spot("spot-1", "user-1", "Old Label");
        SpotRequest request = spotRequest("Updated Label");
        when(spotRepository.findByIdAndUserId("spot-1", "user-1")).thenReturn(Optional.of(existing));
        when(spotRepository.save(existing)).thenReturn(existing);

        SpotResponse response = spotService.updateSpot("user-1", "spot-1", request);

        assertThat(response.label()).isEqualTo("Updated Label");
        assertThat(existing.getNotes()).isEqualTo("Great launch point");
    }

    @Test
    // Verifies that updating a non-owned or missing spot returns the domain not-found error.
    void updateSpotRejectsMissingSpot() {
        when(spotRepository.findByIdAndUserId("spot-404", "user-1")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> spotService.updateSpot("user-1", "spot-404", spotRequest("Updated")))
            .isInstanceOf(ResourceNotFoundException.class)
            .hasMessage("Spot not found: spot-404");
    }

    @Test
    // Verifies that deleting a spot delegates to the repository only after ownership is confirmed.
    void deleteSpotDeletesOwnedSpot() {
        Spot existing = spot("spot-1", "user-1", "Delete Me");
        when(spotRepository.findByIdAndUserId("spot-1", "user-1")).thenReturn(Optional.of(existing));

        spotService.deleteSpot("user-1", "spot-1");

        verify(spotRepository).delete(existing);
    }

    private SpotRequest spotRequest(String label) {
        SpotRequest request = new SpotRequest();
        request.setLabel(label);
        request.setAddress(label + ", CA");
        request.setLat(new BigDecimal("33.618900"));
        request.setLon(new BigDecimal("-117.929800"));
        request.setNotes("Great launch point");
        request.setFavorite(true);
        return request;
    }

    private Spot spot(String id, String userId, String label) {
        Spot spot = new Spot();
        spot.setId(id);
        spot.setUser(user(userId));
        spot.setLabel(label);
        spot.setAddress(label + ", CA");
        spot.setLat(new BigDecimal("33.618900"));
        spot.setLon(new BigDecimal("-117.929800"));
        spot.setNotes("Saved spot");
        spot.setFavorite(true);
        spot.setCreatedAt(Instant.parse("2026-03-26T10:00:00Z"));
        return spot;
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
