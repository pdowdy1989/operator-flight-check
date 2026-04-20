package com.pedaerial.operatorflightcheck.service;

import com.pedaerial.operatorflightcheck.dto.AuthLoginRequest;
import com.pedaerial.operatorflightcheck.dto.AuthRegisterRequest;
import com.pedaerial.operatorflightcheck.dto.AuthResponse;
import com.pedaerial.operatorflightcheck.dto.CurrentUserResponse;
import com.pedaerial.operatorflightcheck.entity.Role;
import com.pedaerial.operatorflightcheck.entity.User;
import com.pedaerial.operatorflightcheck.exception.DuplicateEmailException;
import com.pedaerial.operatorflightcheck.exception.UnauthorizedException;
import com.pedaerial.operatorflightcheck.repository.UserRepository;
import com.pedaerial.operatorflightcheck.security.AppUserPrincipal;
import com.pedaerial.operatorflightcheck.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
        UserRepository userRepository,
        PasswordEncoder passwordEncoder,
        JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse login(AuthLoginRequest request) {
        User user = userRepository.findByEmail(request.email().trim().toLowerCase())
            .orElseThrow(() -> new UnauthorizedException("Invalid email or password."));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password.");
        }

        return buildAuthResponse(user);
    }

    public AuthResponse register(AuthRegisterRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();

        if (userRepository.findByEmail(normalizedEmail).isPresent()) {
            throw new DuplicateEmailException(normalizedEmail);
        }

        User user = new User();
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(resolveRequestedRole(request.role()));
        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setPhone(request.phone());
        user.setCompany(request.company());
        user.setLicenseNumber(request.licenseNumber());

        User savedUser = userRepository.save(user);
        return buildAuthResponse(savedUser);
    }

    public CurrentUserResponse me(AppUserPrincipal principal) {
        return new CurrentUserResponse(
            principal.getId(),
            principal.getEmail(),
            principal.getRole().name()
        );
    }

    public void seedDemoUser(String email, String password, Role role, String firstName, String lastName,
                              String company, String licenseNumber) {
        String normalizedEmail = email.trim().toLowerCase();

        if (userRepository.findByEmail(normalizedEmail).isPresent()) {
            return;
        }

        User user = new User();
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setRole(role);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setCompany(company);
        user.setLicenseNumber(licenseNumber);
        userRepository.save(user);
    }

    private Role resolveRequestedRole(String rawRole) {
        if (rawRole == null || rawRole.isBlank()) {
            return Role.CLIENT;
        }

        try {
            return Role.valueOf(rawRole.trim().toUpperCase());
        } catch (IllegalArgumentException ignored) {
            return Role.CLIENT;
        }
    }

    private AuthResponse buildAuthResponse(User user) {
        AppUserPrincipal principal = new AppUserPrincipal(user);
        return new AuthResponse(
            user.getId(),
            user.getEmail(),
            user.getRole().name(),
            user.getFirstName(),
            user.getLastName(),
            user.getCompany(),
            jwtService.generateToken(principal)
        );
    }
}
