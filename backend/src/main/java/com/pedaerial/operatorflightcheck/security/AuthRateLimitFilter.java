package com.pedaerial.operatorflightcheck.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class AuthRateLimitFilter extends OncePerRequestFilter {

    private final Map<String, ArrayDeque<Instant>> requestHistory = new ConcurrentHashMap<>();
    private final int maxRequests;
    private final Duration window;

    public AuthRateLimitFilter(
        @Value("${app.security.auth-rate-limit.max-requests:10}") int maxRequests,
        @Value("${app.security.auth-rate-limit.window-seconds:60}") long windowSeconds
    ) {
        this.maxRequests = maxRequests;
        this.window = Duration.ofSeconds(windowSeconds);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        boolean isOptionsRequest = "OPTIONS".equalsIgnoreCase(request.getMethod());
        boolean isAuthRequest = request.getRequestURI().startsWith("/api/auth/");
        return isOptionsRequest || !isAuthRequest;
    }

    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
    ) throws ServletException, IOException {
        String key = buildKey(request);

        if (!allowRequest(key)) {
            writeTooManyRequests(response);
            return;
        }

        filterChain.doFilter(request, response);
    }

    private String buildKey(HttpServletRequest request) {
        return request.getRemoteAddr() + ":" + request.getRequestURI();
    }

    private boolean allowRequest(String key) {
        Instant now = Instant.now();
        Instant cutoff = now.minus(window);
        ArrayDeque<Instant> requests = requestHistory.computeIfAbsent(key, ignored -> new ArrayDeque<>());

        synchronized (requests) {
            while (!requests.isEmpty() && requests.peekFirst().isBefore(cutoff)) {
                requests.pollFirst();
            }

            if (requests.size() >= maxRequests) {
                return false;
            }

            requests.addLast(now);
            return true;
        }
    }

    private void writeTooManyRequests(HttpServletResponse response) throws IOException {
        // Return a structured API response so the frontend can surface throttling clearly.
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write("""
            {
              "status": 429,
              "error": "Too Many Requests",
              "message": "Too many authentication attempts. Please wait and try again."
            }
            """);
    }
}
