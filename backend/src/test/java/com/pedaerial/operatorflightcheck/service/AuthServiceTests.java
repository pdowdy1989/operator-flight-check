package com.pedaerial.operatorflightcheck.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

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
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class AuthServiceTests {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepository, passwordEncoder, jwtService);
    }

    @Test
    // Verifies that valid credentials return a normalized auth payload with a signed token.
    void loginReturnsTokenForValidCredentials() {
        User user = user("pilot@pedaerial.com", "hashed-password");
        when(userRepository.findByEmail("pilot@pedaerial.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password123", "hashed-password")).thenReturn(true);
        when(jwtService.generateToken(any(AppUserPrincipal.class))).thenReturn("jwt-token");

        AuthResponse response = authService.login(new AuthLoginRequest("  PILOT@pedaerial.com  ", "password123"));

        assertThat(response.email()).isEqualTo("pilot@pedaerial.com");
        assertThat(response.role()).isEqualTo("USER");
        assertThat(response.token()).isEqualTo("jwt-token");
    }

    @Test
    // Verifies that login rejects unknown emails without leaking which accounts exist.
    void loginRejectsUnknownEmail() {
        when(userRepository.findByEmail("missing@pedaerial.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(new AuthLoginRequest("missing@pedaerial.com", "password123")))
            .isInstanceOf(UnauthorizedException.class)
            .hasMessage("Invalid email or password.");
    }

    @Test
    // Verifies that login rejects incorrect passwords even when the account exists.
    void loginRejectsWrongPassword() {
        User user = user("pilot@pedaerial.com", "hashed-password");
        when(userRepository.findByEmail("pilot@pedaerial.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong-password", "hashed-password")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(new AuthLoginRequest("pilot@pedaerial.com", "wrong-password")))
            .isInstanceOf(UnauthorizedException.class)
            .hasMessage("Invalid email or password.");
    }

    @Test
    // Verifies that registration hashes the password, normalizes the email, and returns a tokenized session.
    void registerCreatesUserAndReturnsToken() {
        when(userRepository.findByEmail("newpilot@pedaerial.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("password123")).thenReturn("hashed-password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User saved = invocation.getArgument(0);
            saved.setId("user-123");
            return saved;
        });
        when(jwtService.generateToken(any(AppUserPrincipal.class))).thenReturn("jwt-token");

        AuthResponse response = authService.register(new AuthRegisterRequest("  NewPilot@Pedaerial.com  ", "password123"));

        assertThat(response.id()).isEqualTo("user-123");
        assertThat(response.email()).isEqualTo("newpilot@pedaerial.com");
        assertThat(response.token()).isEqualTo("jwt-token");
        verify(passwordEncoder).encode("password123");
    }

    @Test
    // Verifies that duplicate registrations are blocked before writing a second user record.
    void registerRejectsDuplicateEmail() {
        when(userRepository.findByEmail("existing@pedaerial.com")).thenReturn(Optional.of(user("existing@pedaerial.com", "hash")));

        assertThatThrownBy(() -> authService.register(new AuthRegisterRequest("existing@pedaerial.com", "password123")))
            .isInstanceOf(DuplicateEmailException.class)
            .hasMessage("Email already exists: existing@pedaerial.com");

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    // Verifies that the current-user response is derived directly from the authenticated principal.
    void meReturnsCurrentPrincipalDetails() {
        AppUserPrincipal principal = new AppUserPrincipal(user("pilot@pedaerial.com", "hash"));

        CurrentUserResponse response = authService.me(principal);

        assertThat(response.email()).isEqualTo("pilot@pedaerial.com");
        assertThat(response.role()).isEqualTo("USER");
    }

    @Test
    // Verifies that demo seeding creates a default user only when one does not already exist.
    void seedDemoUserCreatesMissingUser() {
        when(userRepository.findByEmail("demo@pedaerial.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("password123")).thenReturn("hashed-password");

        authService.seedDemoUser("  demo@pedaerial.com  ", "password123");

        verify(userRepository).save(any(User.class));
    }

    @Test
    // Verifies that demo seeding becomes a no-op when the demo user is already present.
    void seedDemoUserSkipsExistingUser() {
        when(userRepository.findByEmail("demo@pedaerial.com")).thenReturn(Optional.of(user("demo@pedaerial.com", "hash")));

        authService.seedDemoUser("demo@pedaerial.com", "password123");

        verify(userRepository, never()).save(any(User.class));
    }

    private User user(String email, String passwordHash) {
        User user = new User();
        user.setId("user-1");
        user.setEmail(email);
        user.setPasswordHash(passwordHash);
        user.setRole(Role.USER);
        return user;
    }
}
