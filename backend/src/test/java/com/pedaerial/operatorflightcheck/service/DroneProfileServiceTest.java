package com.pedaerial.operatorflightcheck.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.pedaerial.operatorflightcheck.dto.DroneProfileRequest;
import com.pedaerial.operatorflightcheck.dto.DroneProfileResponse;
import com.pedaerial.operatorflightcheck.entity.DroneProfile;
import com.pedaerial.operatorflightcheck.entity.User;
import com.pedaerial.operatorflightcheck.repository.DroneProfileRepository;
import com.pedaerial.operatorflightcheck.repository.UserRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class DroneProfileServiceTest {

    @Mock
    private DroneProfileRepository droneProfileRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private DroneProfileService droneProfileService;

    @Test
    void testCreateProfile_success() {
        User user = User.builder().id("user-1").build();
        DroneProfileRequest request = DroneProfileRequest.builder()
            .name("Mini 3")
            .type("MICRO")
            .windYellowMph(18)
            .gustYellowMph(24)
            .precipYellowPct(20)
            .build();
        DroneProfile saved = DroneProfile.builder().id("profile-1").user(user).name("Mini 3").type("MICRO").windYellowMph(18).gustYellowMph(24).precipYellowPct(20).build();
        when(userRepository.findById("user-1")).thenReturn(Optional.of(user));
        when(droneProfileRepository.save(org.mockito.ArgumentMatchers.any(DroneProfile.class))).thenReturn(saved);

        DroneProfileResponse response = droneProfileService.createProfile("user-1", request);

        assertThat(response.id()).isEqualTo("profile-1");
        assertThat(response.type()).isEqualTo("MICRO");
    }

    @Test
    void testGetProfiles_returnsOnlyOwned() {
        User user = User.builder().id("user-1").build();
        when(droneProfileRepository.findByUserId("user-1")).thenReturn(List.of(
            DroneProfile.builder().id("profile-1").user(user).name("Mini 3").type("MICRO").build()
        ));

        List<DroneProfileResponse> response = droneProfileService.getProfilesForUser("user-1");

        assertThat(response).hasSize(1);
        assertThat(response.get(0).name()).isEqualTo("Mini 3");
    }

    @Test
    void testUpdateProfile_success() {
        User user = User.builder().id("user-1").build();
        DroneProfile profile = DroneProfile.builder().id("profile-1").user(user).name("Old").type("MICRO").build();
        DroneProfileRequest request = DroneProfileRequest.builder()
            .name("New")
            .type("PROSUMER")
            .windYellowMph(20)
            .gustYellowMph(28)
            .precipYellowPct(15)
            .build();
        when(droneProfileRepository.findByIdAndUserId("profile-1", "user-1")).thenReturn(Optional.of(profile));
        when(droneProfileRepository.save(profile)).thenReturn(profile);

        DroneProfileResponse response = droneProfileService.updateProfile("user-1", "profile-1", request);

        assertThat(response.name()).isEqualTo("New");
        assertThat(profile.getPrecipYellowPct()).isEqualTo(15);
    }

    @Test
    void testDeleteProfile_success() {
        User user = User.builder().id("user-1").build();
        DroneProfile profile = DroneProfile.builder().id("profile-1").user(user).name("Mini").build();
        when(droneProfileRepository.findByIdAndUserId("profile-1", "user-1")).thenReturn(Optional.of(profile));

        droneProfileService.deleteProfile("user-1", "profile-1");

        verify(droneProfileRepository).delete(profile);
    }
}
