package com.pedaerial.operatorflightcheck.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.pedaerial.operatorflightcheck.entity.User;
import com.pedaerial.operatorflightcheck.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    void registerCreatesUserWithHashedPasswordAndReturnsJwt() throws Exception {
        String rawPassword = "supersecure123";

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "email": "  NewPilot@Pedaerial.com  ",
                      "password": "%s"
                    }
                    """.formatted(rawPassword)))
            .andExpect(status().isCreated())
            .andExpect(header().string("Location", "/api/auth/me"))
            .andExpect(jsonPath("$.email").value("newpilot@pedaerial.com"))
            .andExpect(jsonPath("$.role").value("CLIENT"))
            .andExpect(jsonPath("$.token").isString());

        User savedUser = userRepository.findByEmail("newpilot@pedaerial.com").orElseThrow();
        assertThat(savedUser.getPasswordHash()).isNotEqualTo(rawPassword);
        assertThat(passwordEncoder.matches(rawPassword, savedUser.getPasswordHash())).isTrue();
    }

    @Test
    void registerRejectsDuplicateEmail() throws Exception {
        userRepository.save(createUser("existing@pedaerial.com", "hashed-password"));

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "email": "existing@pedaerial.com",
                      "password": "password123"
                    }
                    """))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.message").value("Email already exists: existing@pedaerial.com"));
    }

    @Test
    void registerValidatesEmailAndPasswordRules() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "email": "not-an-email",
                      "password": "short"
                    }
                    """))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.message", containsString("Enter a valid email address.")))
            .andExpect(jsonPath("$.message", containsString("Password must be at least 8 characters.")));
    }

    @Test
    void loginReturnsJwtForValidCredentials() throws Exception {
        String rawPassword = "password123";
        userRepository.save(createUser("login@pedaerial.com", passwordEncoder.encode(rawPassword)));

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "email": "  LOGIN@pedaerial.com  ",
                      "password": "password123"
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.email").value("login@pedaerial.com"))
            .andExpect(jsonPath("$.role").value("CLIENT"))
            .andExpect(jsonPath("$.token").isString())
            .andExpect(jsonPath("$.token", not("")));
    }

    @Test
    void loginRejectsUnknownEmailOrWrongPassword() throws Exception {
        userRepository.save(createUser("known@pedaerial.com", passwordEncoder.encode("password123")));

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "email": "known@pedaerial.com",
                      "password": "wrong-password"
                    }
                    """))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.message").value("Invalid email or password."));

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "email": "missing@pedaerial.com",
                      "password": "password123"
                    }
                    """))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.message").value("Invalid email or password."));
    }

    @Test
    void meReturnsCurrentUserWhenCalledWithLoginToken() throws Exception {
        String rawPassword = "password123";
        User user = userRepository.save(createUser("me@pedaerial.com", passwordEncoder.encode(rawPassword)));

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "email": "me@pedaerial.com",
                      "password": "password123"
                    }
                    """))
            .andExpect(status().isOk())
            .andReturn();

        String responseBody = loginResult.getResponse().getContentAsString();
        String token = responseBody.replaceAll(".*\"token\":\"([^\"]+)\".*", "$1");

        mockMvc.perform(get("/api/auth/me")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(user.getId()))
            .andExpect(jsonPath("$.email").value(user.getEmail()))
            .andExpect(jsonPath("$.role").value("CLIENT"));
    }

    private User createUser(String email, String passwordHash) {
        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordHash);
        return userRepository.save(user);
    }
}
