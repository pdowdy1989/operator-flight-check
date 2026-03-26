package com.pedaerial.operatorflightcheck.repository;

import static org.assertj.core.api.Assertions.assertThat;

import com.pedaerial.operatorflightcheck.entity.DroneProfile;
import com.pedaerial.operatorflightcheck.entity.Role;
import com.pedaerial.operatorflightcheck.entity.Spot;
import com.pedaerial.operatorflightcheck.entity.SpotCheck;
import com.pedaerial.operatorflightcheck.entity.User;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

@DataJpaTest
class SpotCheckRepositoryTests {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SpotRepository spotRepository;

    @Autowired
    private DroneProfileRepository droneProfileRepository;

    @Autowired
    private SpotCheckRepository spotCheckRepository;

    @Test
    void findBySpotIdReturnsDecisionHistoryForSpot() {
        User pilot = createUser("history@pedaerial.com");
        DroneProfile profile = createProfile(pilot, "DJI Air 3");
        Spot targetSpot = createSpot(pilot, "Sunset Cliffs");
        Spot otherSpot = createSpot(pilot, "Harbor Point");

        spotCheckRepository.save(createSpotCheck(targetSpot, pilot, profile, LocalDate.of(2026, 3, 20), "GREEN"));
        spotCheckRepository.save(createSpotCheck(targetSpot, pilot, profile, LocalDate.of(2026, 3, 21), "YELLOW"));
        spotCheckRepository.save(createSpotCheck(otherSpot, pilot, profile, LocalDate.of(2026, 3, 21), "RED"));

        List<SpotCheck> history = spotCheckRepository.findBySpotId(targetSpot.getId());

        assertThat(history)
            .hasSize(2)
            .extracting(SpotCheck::getStatus)
            .containsExactlyInAnyOrder("GREEN", "YELLOW");
    }

    @Test
    void saveAssignsIdAndCreatedAt() {
        User pilot = createUser("save-check@pedaerial.com");
        DroneProfile profile = createProfile(pilot, "Mini 4 Pro");
        Spot spot = createSpot(pilot, "Pier Launch");

        SpotCheck savedCheck = spotCheckRepository.save(
            createSpotCheck(spot, pilot, profile, LocalDate.of(2026, 3, 23), "GREEN")
        );

        assertThat(savedCheck.getId()).isNotBlank();
        assertThat(savedCheck.getCreatedAt()).isNotNull();
        assertThat(savedCheck.getSpot().getId()).isEqualTo(spot.getId());
        assertThat(savedCheck.getProfile().getId()).isEqualTo(profile.getId());
    }

    @Test
    // Verifies that the custom @Query method supports pageable spot-check history for a single user.
    void findPageByUserIdReturnsPagedHistory() {
        User owner = createUser("paged-history@pedaerial.com");
        User other = createUser("paged-history-other@pedaerial.com");
        DroneProfile ownerProfile = createProfile(owner, "Owner Profile");
        DroneProfile otherProfile = createProfile(other, "Other Profile");
        Spot ownerSpot = createSpot(owner, "Owner Spot");
        Spot otherSpot = createSpot(other, "Other Spot");

        spotCheckRepository.save(createSpotCheck(ownerSpot, owner, ownerProfile, LocalDate.of(2026, 3, 22), "GREEN"));
        spotCheckRepository.save(createSpotCheck(ownerSpot, owner, ownerProfile, LocalDate.of(2026, 3, 23), "YELLOW"));
        spotCheckRepository.save(createSpotCheck(otherSpot, other, otherProfile, LocalDate.of(2026, 3, 24), "RED"));

        Page<SpotCheck> page = spotCheckRepository.findPageByUserId(owner.getId(), PageRequest.of(0, 10));

        assertThat(page.getContent()).hasSize(2);
        assertThat(page.getContent())
            .extracting(SpotCheck::getStatus)
            .containsExactly("YELLOW", "GREEN");
    }

    private User createUser(String email) {
        User user = new User();
        user.setEmail(email);
        user.setPasswordHash("hashed-password");
        user.setRole(Role.USER);
        return userRepository.save(user);
    }

    private DroneProfile createProfile(User user, String name) {
        DroneProfile profile = new DroneProfile();
        profile.setUser(user);
        profile.setName(name);
        profile.setType("Prosumer");
        profile.setWindGreenMph(12);
        profile.setWindYellowMph(18);
        profile.setGustGreenMph(16);
        profile.setGustYellowMph(24);
        profile.setPrecipGreenPct(10);
        profile.setPrecipYellowPct(30);
        return droneProfileRepository.save(profile);
    }

    private Spot createSpot(User user, String label) {
        Spot spot = new Spot();
        spot.setUser(user);
        spot.setLabel(label);
        spot.setAddress(label + ", CA");
        spot.setLat(new BigDecimal("33.618900"));
        spot.setLon(new BigDecimal("-117.929800"));
        spot.setNotes("Spot for flight checks");
        spot.setFavorite(true);
        return spotRepository.save(spot);
    }

    private SpotCheck createSpotCheck(Spot spot, User user, DroneProfile profile, LocalDate date, String status) {
        SpotCheck spotCheck = new SpotCheck();
        spotCheck.setSpot(spot);
        spotCheck.setUser(user);
        spotCheck.setProfile(profile);
        spotCheck.setDate(date);
        spotCheck.setStatus(status);
        spotCheck.setSummary("Flyability decision recorded");
        spotCheck.setNotes("Captured from repository test");
        return spotCheck;
    }
}
