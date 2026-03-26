package com.pedaerial.operatorflightcheck.controller;

import com.pedaerial.operatorflightcheck.dto.AuthLoginRequest;
import com.pedaerial.operatorflightcheck.dto.AuthRegisterRequest;
import com.pedaerial.operatorflightcheck.dto.AuthResponse;
import com.pedaerial.operatorflightcheck.dto.CurrentUserResponse;
import com.pedaerial.operatorflightcheck.security.AppUserPrincipal;
import com.pedaerial.operatorflightcheck.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.net.URI;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Register, log in, and inspect the current authenticated user.")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    @Operation(summary = "Log in a user", description = "Validates the supplied credentials and returns a JWT.")
    public AuthResponse login(@Valid @RequestBody AuthLoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/register")
    @Operation(summary = "Register a user", description = "Creates a user account and returns a JWT for immediate authenticated use.")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody AuthRegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.created(URI.create("/api/auth/me")).body(response);
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user", description = "Returns the current authenticated user resolved from the bearer token.")
    public CurrentUserResponse me(@AuthenticationPrincipal AppUserPrincipal principal) {
        return authService.me(principal);
    }
}
