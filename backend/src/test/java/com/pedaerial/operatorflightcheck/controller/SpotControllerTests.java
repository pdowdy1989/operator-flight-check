package com.pedaerial.operatorflightcheck.controller;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.pedaerial.operatorflightcheck.entity.Role;
import com.pedaerial.operatorflightcheck.entity.Spot;
import com.pedaerial.operatorflightcheck.entity.User;
import com.pedaerial.operatorflightcheck.repository.SpotRepository;
import com.pedaerial.operatorflightcheck.repository.UserRepository;
import java.math.BigDecimal;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class SpotControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SpotRepository spotRepository;

    @Test
    void createSpotReturnsCreatedResponse() throws Exception {
        User user = createUser("spots-api-create@pedaerial.com");

        mockMvc.perform(post("/api/spots")
                .with(user("pilot"))
                .header("X-User-Id", user.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "label": "Cliffside Launch",
                      "address": "Cliffside Launch, CA",
                      "lat": 33.618900,
                      "lon": -117.929800,
                      "notes": "Great sunset conditions",
                      "favorite": true
                    }
                    """))
            .andExpect(status().isCreated())
            .andExpect(header().string("Location", org.hamcrest.Matchers.containsString("/api/spots/")))
            .andExpect(jsonPath("$.label").value("Cliffside Launch"))
            .andExpect(jsonPath("$.address").value("Cliffside Launch, CA"))
            .andExpect(jsonPath("$.favorite").value(true))
            .andExpect(jsonPath("$.userId").value(user.getId()));
    }

    @Test
    void listSpotsReturnsOnlyOwnedSpots() throws Exception {
        User owner = createUser("spots-api-owner@pedaerial.com");
        User other = createUser("spots-api-other@pedaerial.com");
        createSpot(owner, "Harbor Overlook");
        createSpot(owner, "Pier Launch");
        createSpot(other, "Other User Spot");

        mockMvc.perform(get("/api/spots")
                .with(user("pilot"))
                .header("X-User-Id", owner.getId()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(2))
            .andExpect(jsonPath("$[0].userId").value(owner.getId()));
    }

    @Test
    void updateSpotChangesOwnedSpot() throws Exception {
        User owner = createUser("spots-api-update@pedaerial.com");
        Spot spot = createSpot(owner, "Original Spot");

        mockMvc.perform(put("/api/spots/{id}", spot.getId())
                .with(user("pilot"))
                .header("X-User-Id", owner.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "label": "Updated Spot",
                      "address": "Updated Spot, CA",
                      "lat": 34.000000,
                      "lon": -118.000000,
                      "notes": "Updated notes",
                      "favorite": false
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.label").value("Updated Spot"))
            .andExpect(jsonPath("$.favorite").value(false));
    }

    @Test
    void deleteSpotRemovesOwnedSpot() throws Exception {
        User owner = createUser("spots-api-delete@pedaerial.com");
        Spot spot = createSpot(owner, "Delete Me");

        mockMvc.perform(delete("/api/spots/{id}", spot.getId())
                .with(user("pilot"))
                .header("X-User-Id", owner.getId()))
            .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/spots/{id}", spot.getId())
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
        spot.setNotes("Test spot");
        spot.setFavorite(true);
        return spotRepository.save(spot);
    }
}
