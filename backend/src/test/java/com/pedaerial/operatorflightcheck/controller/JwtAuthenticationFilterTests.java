package com.pedaerial.operatorflightcheck.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.pedaerial.operatorflightcheck.entity.Role;
import com.pedaerial.operatorflightcheck.entity.Spot;
import com.pedaerial.operatorflightcheck.entity.User;
import com.pedaerial.operatorflightcheck.repository.SpotRepository;
import com.pedaerial.operatorflightcheck.repository.UserRepository;
import com.pedaerial.operatorflightcheck.security.AppUserPrincipal;
import com.pedaerial.operatorflightcheck.security.JwtService;
import java.math.BigDecimal;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class JwtAuthenticationFilterTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SpotRepository spotRepository;

    @Autowired
    private JwtService jwtService;

    @Test
    void validBearerTokenSetsSecurityContextForCurrentUser() throws Exception {
        User user = createUser("jwt-filter-me@pedaerial.com");
        String token = jwtService.generateToken(new AppUserPrincipal(user));

        mockMvc.perform(get("/api/auth/me")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(user.getId()))
            .andExpect(jsonPath("$.email").value(user.getEmail()))
            .andExpect(jsonPath("$.role").value(user.getRole().name()));
    }

    @Test
    void validBearerTokenInjectsUserIdIntoProtectedRequests() throws Exception {
        User user = createUser("jwt-filter-spots@pedaerial.com");
        createSpot(user, "Laguna Cliffs");
        String token = jwtService.generateToken(new AppUserPrincipal(user));

        mockMvc.perform(get("/api/spots")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].userId").value(user.getId()))
            .andExpect(jsonPath("$[0].label").value("Laguna Cliffs"));
    }

    @Test
    void invalidBearerTokenDoesNotAuthenticateProtectedRoute() throws Exception {
        mockMvc.perform(get("/api/spots")
                .header(HttpHeaders.AUTHORIZATION, "Bearer invalid-token"))
            .andExpect(status().isForbidden());
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
        spot.setNotes("JWT filter test");
        spot.setFavorite(true);
        return spotRepository.save(spot);
    }
}
