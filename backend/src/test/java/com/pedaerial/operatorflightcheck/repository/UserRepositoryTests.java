package com.pedaerial.operatorflightcheck.repository;

import static org.assertj.core.api.Assertions.assertThat;

import com.pedaerial.operatorflightcheck.entity.Role;
import com.pedaerial.operatorflightcheck.entity.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

@DataJpaTest
@ActiveProfiles("test")
class UserRepositoryTests {

    @Autowired
    private UserRepository userRepository;

    @Test
    void findByEmailReturnsPersistedUser() {
        User user = new User();
        user.setEmail("pilot@pedaerial.com");
        user.setPasswordHash("hashed-password");
        user.setRole(Role.PILOT);

        userRepository.save(user);

        assertThat(userRepository.findByEmail("pilot@pedaerial.com"))
            .isPresent()
            .get()
            .extracting(User::getEmail, User::getRole)
            .containsExactly("pilot@pedaerial.com", Role.PILOT);
    }

    @Test
    void saveAssignsIdAndCreatedAt() {
        User user = new User();
        user.setEmail("admin@pedaerial.com");
        user.setPasswordHash("another-hash");
        user.setRole(Role.ADMIN);

        User savedUser = userRepository.save(user);

        assertThat(savedUser.getId()).isNotBlank();
        assertThat(savedUser.getCreatedAt()).isNotNull();
    }
}
