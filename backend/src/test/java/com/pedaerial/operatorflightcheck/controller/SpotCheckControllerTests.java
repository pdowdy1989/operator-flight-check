package com.pedaerial.operatorflightcheck.controller;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.pedaerial.operatorflightcheck.entity.DroneProfile;
import com.pedaerial.operatorflightcheck.entity.Role;
import com.pedaerial.operatorflightcheck.entity.Spot;
import com.pedaerial.operatorflightcheck.entity.SpotCheck;
import com.pedaerial.operatorflightcheck.entity.User;
import com.pedaerial.operatorflightcheck.repository.DroneProfileRepository;
import com.pedaerial.operatorflightcheck.repository.SpotCheckRepository;
import com.pedaerial.operatorflightcheck.repository.SpotRepository;
import com.pedaerial.operatorflightcheck.repository.UserRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class SpotCheckControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SpotRepository spotRepository;

    @Autowired
    private DroneProfileRepository droneProfileRepository;

    @Autowired
    private SpotCheckRepository spotCheckRepository;

    @Test
    // Verifies that creating a spot check returns 201 and includes the linked spot and profile details.
    void createSpotCheckReturnsCreatedResponse() throws Exception {
        User user = createUser("spot-check-create@pedaerial.com");
        Spot spot = createSpot(user, "Laguna Cliffs");
        DroneProfile profile = createProfile(user, "DJI Air 3");

        mockMvc.perform(post("/api/spot-checks")
                .with(user("pilot"))
                .header("X-User-Id", user.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "spotId": "%s",
                      "profileId": "%s",
                      "date": "2026-03-26",
                      "status": "green",
                      "summary": "Excellent window",
                      "notes": "Go for launch"
                    }
                    """.formatted(spot.getId(), profile.getId())))
            .andExpect(status().isCreated())
            .andExpect(header().string("Location", org.hamcrest.Matchers.containsString("/api/spot-checks/")))
            .andExpect(jsonPath("$.spotId").value(spot.getId()))
            .andExpect(jsonPath("$.profileId").value(profile.getId()))
            .andExpect(jsonPath("$.status").value("GREEN"));
    }

    @Test
    // Verifies that listing spot checks returns Spring page metadata and only the current user's content.
    void listSpotChecksReturnsPaginatedResults() throws Exception {
        User owner = createUser("spot-check-list-owner@pedaerial.com");
        User other = createUser("spot-check-list-other@pedaerial.com");
        Spot ownerSpot = createSpot(owner, "Owner Spot");
        Spot otherSpot = createSpot(other, "Other Spot");

        spotCheckRepository.save(createSpotCheck(ownerSpot, owner, null, "GREEN"));
        spotCheckRepository.save(createSpotCheck(otherSpot, other, null, "RED"));

        mockMvc.perform(get("/api/spot-checks?page=0&size=10")
                .with(user("pilot"))
                .header("X-User-Id", owner.getId()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content.length()").value(1))
            .andExpect(jsonPath("$.content[0].userId").value(owner.getId()))
            .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    // Verifies that updating a spot check changes the editable fields while preserving ownership checks.
    void updateSpotCheckChangesOwnedCheck() throws Exception {
        User owner = createUser("spot-check-update@pedaerial.com");
        Spot spot = createSpot(owner, "Laguna Cliffs");
        SpotCheck check = createSpotCheck(spot, owner, null, "GREEN");
        spotCheckRepository.save(check);

        mockMvc.perform(put("/api/spot-checks/{id}", check.getId())
                .with(user("pilot"))
                .header("X-User-Id", owner.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "spotId": "%s",
                      "date": "2026-03-27",
                      "status": "red",
                      "summary": "Unsafe conditions",
                      "notes": "Do not launch"
                    }
                    """.formatted(spot.getId())))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("RED"))
            .andExpect(jsonPath("$.summary").value("Unsafe conditions"));
    }

    @Test
    // Verifies that deleting a spot check removes it and future fetches return the domain not-found response.
    void deleteSpotCheckRemovesOwnedCheck() throws Exception {
        User owner = createUser("spot-check-delete@pedaerial.com");
        Spot spot = createSpot(owner, "Laguna Cliffs");
        SpotCheck check = spotCheckRepository.save(createSpotCheck(spot, owner, null, "GREEN"));

        mockMvc.perform(delete("/api/spot-checks/{id}", check.getId())
                .with(user("pilot"))
                .header("X-User-Id", owner.getId()))
            .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/spot-checks/{id}", check.getId())
                .with(user("pilot"))
                .header("X-User-Id", owner.getId()))
            .andExpect(status().isNotFound());
    }

    private User createUser(String email) {
        User user = new User();
        user.setEmail(email);
        user.setPasswordHash("hashed-password");
        user.setRole(Role.USER);
        return userRepository.save(user);
    }

    private Spot createSpot(User user, String label) {
        Spot spot = new Spot();
        spot.setUser(user);
        spot.setLabel(label);
        spot.setAddress(label + ", CA");
        spot.setLat(new BigDecimal("33.618900"));
        spot.setLon(new BigDecimal("-117.929800"));
        spot.setNotes("Spot for check tests");
        spot.setFavorite(true);
        return spotRepository.save(spot);
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

    private SpotCheck createSpotCheck(Spot spot, User user, DroneProfile profile, String status) {
        SpotCheck check = new SpotCheck();
        check.setSpot(spot);
        check.setUser(user);
        check.setProfile(profile);
        check.setDate(LocalDate.of(2026, 3, 26));
        check.setStatus(status);
        check.setSummary("Saved in controller test");
        check.setNotes("Controller note");
        return check;
    }
}
