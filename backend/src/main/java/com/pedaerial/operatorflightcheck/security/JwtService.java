package com.pedaerial.operatorflightcheck.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.io.DecodingException;
import io.jsonwebtoken.security.Keys;
import java.security.Key;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    private static final long ACCESS_TOKEN_EXPIRY_MINUTES = 15;

    private final Key signingKey;

    public JwtService(@Value("${jwt.secret}") String jwtSecret) {
        this.signingKey = Keys.hmacShaKeyFor(normalizeSecret(jwtSecret));
    }

    public String generateToken(AppUserPrincipal principal) {
        Instant now = Instant.now();
        // Keep access tokens short-lived so a leaked bearer token has a small impact window.
        Instant expiresAt = now.plus(ACCESS_TOKEN_EXPIRY_MINUTES, ChronoUnit.MINUTES);

        return Jwts.builder()
            .setSubject(principal.getId())
            .claim("email", principal.getEmail())
            .claim("role", principal.getRole().name())
            .setIssuedAt(Date.from(now))
            .setExpiration(Date.from(expiresAt))
            .signWith(signingKey, SignatureAlgorithm.HS256)
            .compact();
    }

    public Claims parseClaims(String token) {
        return Jwts.parserBuilder()
            .setSigningKey(signingKey)
            .build()
            .parseClaimsJws(token)
            .getBody();
    }

    public String extractUserId(String token) {
        return parseClaims(token).getSubject();
    }

    public String extractEmail(String token) {
        return parseClaims(token).get("email", String.class);
    }

    public boolean isTokenValid(String token, AppUserPrincipal principal) {
        Claims claims = parseClaims(token);
        return principal.getId().equals(claims.getSubject())
            && principal.getEmail().equalsIgnoreCase(claims.get("email", String.class))
            && claims.getExpiration().after(new Date());
    }

    private byte[] normalizeSecret(String secret) {
        try {
            return Decoders.BASE64.decode(secret);
        } catch (IllegalArgumentException | DecodingException ignored) {
            String normalized = secret;
            if (normalized.length() < 32) {
                normalized = (normalized + "operator-flight-check-secret-key").repeat(2);
            }
            return normalized.substring(0, 32).getBytes(StandardCharsets.UTF_8);
        }
    }
}
