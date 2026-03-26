package com.pedaerial.operatorflightcheck.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootTest
@AutoConfigureMockMvc
@Import(ApiIntegrationTests.TestAdminController.class)
class ApiIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    // Verifies that protected API routes reject requests that do not include an authenticated bearer token.
    void protectedRoutesRequireAuthentication() throws Exception {
        mockMvc.perform(get("/api/spots"))
            .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/drone-profiles"))
            .andExpect(status().isForbidden());
    }

    @Test
    // Verifies that invalid bearer tokens are rejected instead of granting partial access.
    void protectedRoutesRejectInvalidBearerTokens() throws Exception {
        mockMvc.perform(get("/api/spots")
                .header(HttpHeaders.AUTHORIZATION, "Bearer invalid-token"))
            .andExpect(status().isForbidden());
    }

    @Test
    // Verifies the full spot CRUD cycle using a real registered user and JWT from the auth endpoints.
    void spotCrudWorksEndToEndWithJwtAuthentication() throws Exception {
        String token = registerAndExtractToken("spot-flow@pedaerial.com");

        MvcResult createResult = mockMvc.perform(post("/api/spots")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "label": "Laguna Cliffs",
                      "address": "Laguna Cliffs, Dana Point, CA",
                      "lat": 33.460100,
                      "lon": -117.700400,
                      "notes": "Primary coastal launch site",
                      "favorite": true
                    }
                    """))
            .andExpect(status().isCreated())
            .andExpect(header().string("Location", org.hamcrest.Matchers.containsString("/api/spots/")))
            .andExpect(jsonPath("$.label").value("Laguna Cliffs"))
            .andExpect(jsonPath("$.favorite").value(true))
            .andReturn();

        String createdSpotId = extractJsonValue(createResult.getResponse().getContentAsString(), "id");

        mockMvc.perform(get("/api/spots")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].id").value(createdSpotId));

        mockMvc.perform(put("/api/spots/{id}", createdSpotId)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "label": "Laguna Cliffs Updated",
                      "address": "Laguna Cliffs, Dana Point, CA",
                      "lat": 33.460100,
                      "lon": -117.700400,
                      "notes": "Updated note",
                      "favorite": false
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.label").value("Laguna Cliffs Updated"))
            .andExpect(jsonPath("$.favorite").value(false));

        mockMvc.perform(delete("/api/spots/{id}", createdSpotId)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
            .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/spots/{id}", createdSpotId)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
            .andExpect(status().isNotFound());
    }

    @Test
    // Verifies the full drone-profile CRUD cycle using the same real auth path as the frontend.
    void droneProfileCrudWorksEndToEndWithJwtAuthentication() throws Exception {
        String token = registerAndExtractToken("profile-flow@pedaerial.com");

        MvcResult createResult = mockMvc.perform(post("/api/drone-profiles")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
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
            .andReturn();

        String createdProfileId = extractJsonValue(createResult.getResponse().getContentAsString(), "id");

        mockMvc.perform(get("/api/drone-profiles")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].id").value(createdProfileId));

        mockMvc.perform(put("/api/drone-profiles/{id}", createdProfileId)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "name": "DJI Air 3 Updated",
                      "type": "Prosumer",
                      "windGreenMph": 14,
                      "windYellowMph": 20,
                      "gustGreenMph": 18,
                      "gustYellowMph": 26,
                      "precipGreenPct": 12,
                      "precipYellowPct": 32
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("DJI Air 3 Updated"))
            .andExpect(jsonPath("$.gustYellowMph").value(26));

        mockMvc.perform(delete("/api/drone-profiles/{id}", createdProfileId)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
            .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/drone-profiles/{id}", createdProfileId)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
            .andExpect(status().isNotFound());
    }

    @Test
    // Verifies the full spot-check CRUD cycle, including pageable listing, using a real JWT from auth endpoints.
    void spotCheckCrudWorksEndToEndWithJwtAuthentication() throws Exception {
        String token = registerAndExtractToken("check-flow@pedaerial.com");

        String createdSpotId = extractJsonValue(
            mockMvc.perform(post("/api/spots")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                        {
                          "label": "Laguna Cliffs",
                          "address": "Laguna Cliffs, Dana Point, CA",
                          "lat": 33.460100,
                          "lon": -117.700400,
                          "notes": "Primary coastal launch site",
                          "favorite": true
                        }
                        """))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            "id"
        );

        String createdProfileId = extractJsonValue(
            mockMvc.perform(post("/api/drone-profiles")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
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
                .andReturn()
                .getResponse()
                .getContentAsString(),
            "id"
        );

        MvcResult createCheckResult = mockMvc.perform(post("/api/spot-checks")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "spotId": "%s",
                      "profileId": "%s",
                      "date": "2026-03-26",
                      "status": "green",
                      "summary": "Great launch window",
                      "notes": "Looks good"
                    }
                    """.formatted(createdSpotId, createdProfileId)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.spotId").value(createdSpotId))
            .andExpect(jsonPath("$.profileId").value(createdProfileId))
            .andReturn();

        String createdCheckId = extractJsonValue(createCheckResult.getResponse().getContentAsString(), "id");

        mockMvc.perform(get("/api/spot-checks?page=0&size=10")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content.length()").value(1))
            .andExpect(jsonPath("$.content[0].id").value(createdCheckId));

        mockMvc.perform(put("/api/spot-checks/{id}", createdCheckId)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "spotId": "%s",
                      "profileId": "%s",
                      "date": "2026-03-27",
                      "status": "red",
                      "summary": "Unsafe conditions",
                      "notes": "Do not fly"
                    }
                    """.formatted(createdSpotId, createdProfileId)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("RED"));

        mockMvc.perform(delete("/api/spot-checks/{id}", createdCheckId)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
            .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/spot-checks/{id}", createdCheckId)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
            .andExpect(status().isNotFound());
    }

    @Test
    // Verifies that an authenticated regular user is still forbidden from admin-only endpoints.
    void adminEndpointsRemainForbiddenForAuthenticatedNonAdmins() throws Exception {
        String token = registerAndExtractToken("regular-user@pedaerial.com");

        mockMvc.perform(get("/api/admin/test")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
            .andExpect(status().isForbidden());
    }

    private String registerAndExtractToken(String email) throws Exception {
        MvcResult registerResult = mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "email": "%s",
                      "password": "password123"
                    }
                    """.formatted(email)))
            .andExpect(status().isCreated())
            .andReturn();

        String responseBody = registerResult.getResponse().getContentAsString();
        String token = extractJsonValue(responseBody, "token");
        assertThat(token).isNotBlank();
        return token;
    }

    private String extractJsonValue(String json, String field) {
        return json.replaceAll(".*\"" + field + "\":\"([^\"]+)\".*", "$1");
    }

    @RestController
    @RequestMapping("/api/admin")
    static class TestAdminController {

        @GetMapping("/test")
        String test() {
            return "ok";
        }
    }
}
