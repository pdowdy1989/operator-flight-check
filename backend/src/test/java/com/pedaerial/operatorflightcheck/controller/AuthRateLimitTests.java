package com.pedaerial.operatorflightcheck.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.pedaerial.operatorflightcheck.entity.User;
import com.pedaerial.operatorflightcheck.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(properties = {
    "app.security.auth-rate-limit.max-requests=2",
    "app.security.auth-rate-limit.window-seconds=60"
})
@AutoConfigureMockMvc
class AuthRateLimitTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    void loginIsRateLimitedAfterRepeatedAttemptsFromSameAddress() throws Exception {
        userRepository.save(createUser("ratelimit@pedaerial.com", passwordEncoder.encode("password123")));

        mockMvc.perform(loginRequest("10.0.0.1", "wrong-password"))
            .andExpect(status().isUnauthorized());

        mockMvc.perform(loginRequest("10.0.0.1", "wrong-password"))
            .andExpect(status().isUnauthorized());

        mockMvc.perform(loginRequest("10.0.0.1", "wrong-password"))
            .andExpect(status().isTooManyRequests())
            .andExpect(jsonPath("$.message").value("Too many authentication attempts. Please wait and try again."));
    }

    @Test
    void registerIsRateLimitedIndependentlyPerClientAddress() throws Exception {
        mockMvc.perform(registerRequest("10.0.0.2", "first@pedaerial.com"))
            .andExpect(status().isCreated());

        mockMvc.perform(registerRequest("10.0.0.2", "second@pedaerial.com"))
            .andExpect(status().isCreated());

        mockMvc.perform(registerRequest("10.0.0.2", "third@pedaerial.com"))
            .andExpect(status().isTooManyRequests());

        mockMvc.perform(registerRequest("10.0.0.3", "fresh@pedaerial.com"))
            .andExpect(status().isCreated());
    }

    private org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder loginRequest(
        String remoteAddress,
        String password
    ) {
        return post("/api/auth/login")
            .with(request -> {
                request.setRemoteAddr(remoteAddress);
                return request;
            })
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {
                  "email": "ratelimit@pedaerial.com",
                  "password": "%s"
                }
                """.formatted(password));
    }

    private org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder registerRequest(
        String remoteAddress,
        String email
    ) {
        return post("/api/auth/register")
            .with(request -> {
                request.setRemoteAddr(remoteAddress);
                return request;
            })
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {
                  "email": "%s",
                  "password": "password123"
                }
                """.formatted(email));
    }

    private User createUser(String email, String passwordHash) {
        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordHash);
        return userRepository.save(user);
    }
}
