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
import com.pedaerial.operatorflightcheck.entity.User;
import com.pedaerial.operatorflightcheck.repository.DroneProfileRepository;
import com.pedaerial.operatorflightcheck.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class DroneProfileControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DroneProfileRepository droneProfileRepository;

    @Test
    void createProfileReturnsCreatedResponse() throws Exception {
        User user = createUser("profiles-api-create@pedaerial.com");

        mockMvc.perform(post("/api/drone-profiles")
                .with(user("pilot"))
                .header("X-User-Id", user.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "name": "DJI Air 3",
                      "type": "Prosumer",
                      "windGreenMph": 12,
                      "windYellowMph": 18,
                      "gustGreenMph": 16,
                      "gustYellowMph": 24,
                      "precipGreenPct": 10,
                      "precipYellowPct": 30
                    }
                    """))
            .andExpect(status().isCreated())
            .andExpect(header().string("Location", org.hamcrest.Matchers.containsString("/api/drone-profiles/")))
            .andExpect(jsonPath("$.name").value("DJI Air 3"))
            .andExpect(jsonPath("$.type").value("Prosumer"))
            .andExpect(jsonPath("$.userId").value(user.getId()));
    }

    @Test
    void listProfilesReturnsOnlyOwnedProfiles() throws Exception {
        User owner = createUser("profiles-api-owner@pedaerial.com");
        User other = createUser("profiles-api-other@pedaerial.com");
        createProfile(owner, "Mini 4 Pro");
        createProfile(owner, "Air 3");
        createProfile(other, "Matrice 350");

        mockMvc.perform(get("/api/drone-profiles")
                .with(user("pilot"))
                .header("X-User-Id", owner.getId()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(2))
            .andExpect(jsonPath("$[0].userId").value(owner.getId()));
    }

    @Test
    void updateProfileChangesOwnedProfile() throws Exception {
        User owner = createUser("profiles-api-update@pedaerial.com");
        DroneProfile profile = createProfile(owner, "Original Profile");

        mockMvc.perform(put("/api/drone-profiles/{id}", profile.getId())
                .with(user("pilot"))
                .header("X-User-Id", owner.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "name": "Updated Profile",
                      "type": "Heavy",
                      "windGreenMph": 15,
                      "windYellowMph": 22,
                      "gustGreenMph": 20,
                      "gustYellowMph": 28,
                      "precipGreenPct": 12,
                      "precipYellowPct": 35
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("Updated Profile"))
            .andExpect(jsonPath("$.type").value("Heavy"))
            .andExpect(jsonPath("$.gustYellowMph").value(28));
    }

    @Test
    void deleteProfileRemovesOwnedProfile() throws Exception {
        User owner = createUser("profiles-api-delete@pedaerial.com");
        DroneProfile profile = createProfile(owner, "Delete Profile");

        mockMvc.perform(delete("/api/drone-profiles/{id}", profile.getId())
                .with(user("pilot"))
                .header("X-User-Id", owner.getId()))
            .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/drone-profiles/{id}", profile.getId())
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
}
