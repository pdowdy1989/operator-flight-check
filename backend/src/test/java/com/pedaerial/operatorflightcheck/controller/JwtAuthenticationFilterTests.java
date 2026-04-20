package com.pedaerial.operatorflightcheck.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.pedaerial.operatorflightcheck.entity.Role;
import com.pedaerial.operatorflightcheck.entity.User;
import com.pedaerial.operatorflightcheck.repository.UserRepository;
import com.pedaerial.operatorflightcheck.security.AppUserPrincipal;
import com.pedaerial.operatorflightcheck.security.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class JwtAuthenticationFilterTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    @Test
    void validBearerTokenSetsSecurityContextForCurrentUser() throws Exception {
        User user = createUser("jwt-filter-me@pedaerial.com", Role.PILOT);
        String token = jwtService.generateToken(new AppUserPrincipal(user));

        mockMvc.perform(get("/api/auth/me")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(user.getId()))
            .andExpect(jsonPath("$.email").value(user.getEmail()))
            .andExpect(jsonPath("$.role").value(user.getRole().name()));
    }

    @Test
    void validBearerTokenAllowsAccessToProtectedJobsEndpoint() throws Exception {
        User user = createUser("jwt-filter-jobs@pedaerial.com", Role.PILOT);
        String token = jwtService.generateToken(new AppUserPrincipal(user));

        mockMvc.perform(get("/api/jobs")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
            .andExpect(status().isOk());
    }

    @Test
    void invalidBearerTokenDoesNotAuthenticateProtectedRoute() throws Exception {
        mockMvc.perform(get("/api/jobs")
                .header(HttpHeaders.AUTHORIZATION, "Bearer invalid-token"))
            .andExpect(status().isForbidden());
    }

    private User createUser(String email, Role role) {
        User user = new User();
        user.setEmail(email);
        user.setPasswordHash("hashed-password");
        user.setRole(role);
        return userRepository.save(user);
    }
}
