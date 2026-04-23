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
    void loginReturnsTokenForValidCredentials() {
        User user = pilotUser("pilot@pedaerial.com", "hashed-password");
        when(userRepository.findByEmail("pilot@pedaerial.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password123", "hashed-password")).thenReturn(true);
        when(jwtService.generateToken(any(AppUserPrincipal.class))).thenReturn("jwt-token");

        AuthResponse response = authService.login(new AuthLoginRequest("  PILOT@pedaerial.com  ", "password123"));

        assertThat(response.email()).isEqualTo("pilot@pedaerial.com");
        assertThat(response.role()).isEqualTo("PILOT");
        assertThat(response.token()).isEqualTo("jwt-token");
    }

    @Test
    void loginRejectsUnknownEmail() {
        when(userRepository.findByEmail("missing@pedaerial.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(new AuthLoginRequest("missing@pedaerial.com", "password123")))
            .isInstanceOf(UnauthorizedException.class)
            .hasMessage("Invalid email or password.");
    }

    @Test
    void loginRejectsWrongPassword() {
        User user = pilotUser("pilot@pedaerial.com", "hashed-password");
        when(userRepository.findByEmail("pilot@pedaerial.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong-password", "hashed-password")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(new AuthLoginRequest("pilot@pedaerial.com", "wrong-password")))
            .isInstanceOf(UnauthorizedException.class)
            .hasMessage("Invalid email or password.");
    }

    @Test
    void loginUsesTrimmedStoredPasswordHash() {
        User user = pilotUser("pilot@pedaerial.com", "hashed-password ");
        when(userRepository.findByEmail("pilot@pedaerial.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password123", "hashed-password")).thenReturn(true);
        when(jwtService.generateToken(any(AppUserPrincipal.class))).thenReturn("jwt-token");

        AuthResponse response = authService.login(new AuthLoginRequest("pilot@pedaerial.com", "password123"));

        assertThat(response.token()).isEqualTo("jwt-token");
        verify(passwordEncoder).matches("password123", "hashed-password");
    }

    @Test
    void loginPreservesPasswordWhitespaceFromRequest() {
        User user = pilotUser("pilot@pedaerial.com", "hashed-password");
        when(userRepository.findByEmail("pilot@pedaerial.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(" password123 ", "hashed-password")).thenReturn(true);
        when(jwtService.generateToken(any(AppUserPrincipal.class))).thenReturn("jwt-token");

        AuthResponse response = authService.login(new AuthLoginRequest("pilot@pedaerial.com", " password123 "));

        assertThat(response.token()).isEqualTo("jwt-token");
        verify(passwordEncoder).matches(" password123 ", "hashed-password");
    }

    @Test
    void registerCreatesUserAndReturnsToken() {
        when(userRepository.findByEmail("newpilot@pedaerial.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("password123")).thenReturn("hashed-password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User saved = invocation.getArgument(0);
            saved.setId("user-123");
            return saved;
        });
        when(jwtService.generateToken(any(AppUserPrincipal.class))).thenReturn("jwt-token");

        AuthResponse response = authService.register(
            new AuthRegisterRequest("  NewPilot@Pedaerial.com  ", "password123", "ADMIN", null, null, null, null, null)
        );

        assertThat(response.id()).isEqualTo("user-123");
        assertThat(response.email()).isEqualTo("newpilot@pedaerial.com");
        assertThat(response.role()).isEqualTo("ADMIN");
        assertThat(response.token()).isEqualTo("jwt-token");
        verify(passwordEncoder).encode("password123");
    }

    @Test
    void registerDefaultsToClientRole() {
        when(userRepository.findByEmail("new@pedaerial.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("password123")).thenReturn("hashed");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User saved = inv.getArgument(0);
            saved.setId("u-1");
            return saved;
        });
        when(jwtService.generateToken(any())).thenReturn("tok");

        AuthResponse response = authService.register(
            new AuthRegisterRequest("new@pedaerial.com", "password123", null, null, null, null, null, null)
        );

        assertThat(response.role()).isEqualTo("CLIENT");
    }

    @Test
    void registerRejectsDuplicateEmail() {
        when(userRepository.findByEmail("existing@pedaerial.com"))
            .thenReturn(Optional.of(pilotUser("existing@pedaerial.com", "hash")));

        assertThatThrownBy(() -> authService.register(
            new AuthRegisterRequest("existing@pedaerial.com", "password123", null, null, null, null, null, null)
        ))
            .isInstanceOf(DuplicateEmailException.class)
            .hasMessage("Email already exists: existing@pedaerial.com");

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void meReturnsCurrentPrincipalDetails() {
        AppUserPrincipal principal = new AppUserPrincipal(pilotUser("pilot@pedaerial.com", "hash"));

        CurrentUserResponse response = authService.me(principal);

        assertThat(response.email()).isEqualTo("pilot@pedaerial.com");
        assertThat(response.role()).isEqualTo("PILOT");
    }

    @Test
    void seedDemoUserCreatesMissingUser() {
        when(userRepository.findByEmail("demo@pedaerial.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("password123")).thenReturn("hashed-password");

        authService.seedDemoUser("  demo@pedaerial.com  ", "password123", Role.ADMIN, "Demo", "User", null, null);

        verify(userRepository).save(any(User.class));
    }

    @Test
    void seedDemoUserSkipsExistingUser() {
        when(userRepository.findByEmail("demo@pedaerial.com"))
            .thenReturn(Optional.of(pilotUser("demo@pedaerial.com", "hash")));

        authService.seedDemoUser("demo@pedaerial.com", "password123", Role.PILOT, null, null, null, null);

        verify(userRepository, never()).save(any(User.class));
    }

    private User pilotUser(String email, String passwordHash) {
        User user = new User();
        user.setId("user-1");
        user.setEmail(email);
        user.setPasswordHash(passwordHash);
        user.setRole(Role.PILOT);
        return user;
    }
}
