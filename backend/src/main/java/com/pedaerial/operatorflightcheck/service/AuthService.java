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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

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
        String normalizedEmail = request.email().trim().toLowerCase();
        User user = userRepository.findByEmail(normalizedEmail)
            .orElseThrow(() -> {
                log.debug("Login attempt rejected for email={}", normalizedEmail);
                return new UnauthorizedException("Invalid email or password.");
            });

        log.debug("Login attempt resolved user email={}, id={}", user.getEmail(), user.getId());

        String storedHash = user.getPasswordHash() == null ? null : user.getPasswordHash().trim();
        boolean passwordMatches = storedHash != null && passwordEncoder.matches(request.password(), storedHash);

        if (!passwordMatches) {
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
