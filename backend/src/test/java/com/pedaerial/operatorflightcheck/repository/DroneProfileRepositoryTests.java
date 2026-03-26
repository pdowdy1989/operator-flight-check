package com.pedaerial.operatorflightcheck.repository;

import static org.assertj.core.api.Assertions.assertThat;

import com.pedaerial.operatorflightcheck.entity.DroneProfile;
import com.pedaerial.operatorflightcheck.entity.Role;
import com.pedaerial.operatorflightcheck.entity.User;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

@DataJpaTest
class DroneProfileRepositoryTests {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DroneProfileRepository droneProfileRepository;

    @Test
    void findByUserIdReturnsProfilesOwnedByUser() {
        User owner = createUser("owner@pedaerial.com");
        User otherUser = createUser("other@pedaerial.com");

        droneProfileRepository.save(createDroneProfile(owner, "DJI Air 3", "Prosumer"));
        droneProfileRepository.save(createDroneProfile(owner, "Mini 4 Pro", "Micro"));
        droneProfileRepository.save(createDroneProfile(otherUser, "Matrice 350", "Heavy"));

        List<DroneProfile> profiles = droneProfileRepository.findByUserId(owner.getId());

        assertThat(profiles)
            .hasSize(2)
            .extracting(DroneProfile::getName)
            .containsExactlyInAnyOrder("DJI Air 3", "Mini 4 Pro");
    }

    @Test
    void saveAssignsIdAndCreatedAt() {
        User owner = createUser("profile-owner@pedaerial.com");

        DroneProfile savedProfile = droneProfileRepository.save(createDroneProfile(owner, "Avata 2", "FPV"));

        assertThat(savedProfile.getId()).isNotBlank();
        assertThat(savedProfile.getCreatedAt()).isNotNull();
        assertThat(savedProfile.getUser().getId()).isEqualTo(owner.getId());
    }

    private User createUser(String email) {
        User user = new User();
        user.setEmail(email);
        user.setPasswordHash("hashed-password");
        user.setRole(Role.USER);
        return userRepository.save(user);
    }

    private DroneProfile createDroneProfile(User user, String name, String type) {
        DroneProfile profile = new DroneProfile();
        profile.setUser(user);
        profile.setName(name);
        profile.setType(type);
        profile.setWindGreenMph(12);
        profile.setWindYellowMph(18);
        profile.setGustGreenMph(16);
        profile.setGustYellowMph(24);
        profile.setPrecipGreenPct(10);
        profile.setPrecipYellowPct(30);
        return profile;
    }
}
