package com.pedaerial.operatorflightcheck.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.pedaerial.operatorflightcheck.entity.Role;
import com.pedaerial.operatorflightcheck.entity.User;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class JwtServiceTests {

    private static final String TEST_SECRET = "test-jwt-secret-key-for-operator-flight-check";

    private JwtService jwtService;
    private AppUserPrincipal principal;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService(TEST_SECRET);
        principal = new AppUserPrincipal(user("user-1", "pilot@pedaerial.com"));
    }

    @Test
    // Verifies that generated tokens contain the expected identity and role claims.
    void generateTokenProducesParsableClaims() {
        String token = jwtService.generateToken(principal);

        assertThat(jwtService.extractUserId(token)).isEqualTo("user-1");
        assertThat(jwtService.extractEmail(token)).isEqualTo("pilot@pedaerial.com");
        assertThat(jwtService.parseClaims(token).get("role", String.class)).isEqualTo("PILOT");
    }

    @Test
    // Verifies that a freshly issued token is accepted for the matching authenticated user.
    void isTokenValidReturnsTrueForMatchingPrincipal() {
        String token = jwtService.generateToken(principal);

        boolean valid = jwtService.isTokenValid(token, principal);

        assertThat(valid).isTrue();
    }

    @Test
    // Verifies that a token is rejected when presented by a different user principal.
    void isTokenValidRejectsMismatchedPrincipal() {
        String token = jwtService.generateToken(principal);
        AppUserPrincipal otherPrincipal = new AppUserPrincipal(user("user-2", "other@pedaerial.com"));

        boolean valid = jwtService.isTokenValid(token, otherPrincipal);

        assertThat(valid).isFalse();
    }

    @Test
    // Verifies that expired tokens fail validation even when the signature is otherwise valid.
    void isTokenValidRejectsExpiredToken() {
        String expiredToken = buildExpiredToken(principal);

        assertThatThrownBy(() -> jwtService.isTokenValid(expiredToken, principal))
            .isInstanceOf(io.jsonwebtoken.ExpiredJwtException.class);
    }

    @Test
    // Verifies that malformed tokens are rejected instead of producing partial auth state.
    void parseClaimsRejectsMalformedToken() {
        assertThatThrownBy(() -> jwtService.parseClaims("not-a-real-jwt"))
            .isInstanceOf(io.jsonwebtoken.JwtException.class);
    }

    private String buildExpiredToken(AppUserPrincipal principal) {
        Instant now = Instant.now();
        Instant issuedAt = now.minus(30, ChronoUnit.MINUTES);
        Instant expiresAt = now.minus(15, ChronoUnit.MINUTES);

        return Jwts.builder()
            .setSubject(principal.getId())
            .claim("email", principal.getEmail())
            .claim("role", principal.getRole().name())
            .setIssuedAt(Date.from(issuedAt))
            .setExpiration(Date.from(expiresAt))
            .signWith(signingKey(TEST_SECRET), SignatureAlgorithm.HS256)
            .compact();
    }

    private Key signingKey(String secret) {
        try {
            return Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
        } catch (RuntimeException ignored) {
            String normalized = secret;
            if (normalized.length() < 32) {
                normalized = (normalized + "operator-flight-check-secret-key").repeat(2);
            }
            return Keys.hmacShaKeyFor(normalized.substring(0, 32).getBytes(StandardCharsets.UTF_8));
        }
    }

    private User user(String id, String email) {
        User user = new User();
        user.setId(id);
        user.setEmail(email);
        user.setPasswordHash("hashed-password");
        user.setRole(Role.PILOT);
        return user;
    }
}
