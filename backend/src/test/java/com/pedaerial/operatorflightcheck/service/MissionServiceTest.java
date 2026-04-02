package com.pedaerial.operatorflightcheck.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.pedaerial.operatorflightcheck.dto.MissionRequest;
import com.pedaerial.operatorflightcheck.dto.MissionResponse;
import com.pedaerial.operatorflightcheck.entity.Client;
import com.pedaerial.operatorflightcheck.entity.Mission;
import com.pedaerial.operatorflightcheck.repository.MissionRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

@ExtendWith(MockitoExtension.class)
class MissionServiceTest {

    @Mock
    private MissionRepository missionRepository;

    @Mock
    private ClientService clientService;

    @Mock
    private DroneProfileService droneProfileService;

    @InjectMocks
    private MissionService missionService;

    @Test
    void testCreateMission_success() {
        MissionRequest request = MissionRequest.builder().title("Mission").missionDate(LocalDate.now()).clientId("client-1").build();
        when(clientService.getOwnedClient("user-1", "client-1")).thenReturn(Client.builder().id("client-1").name("Summit").build());
        Mission saved = Mission.builder().id("mission-1").title("Mission").missionDate(request.getMissionDate()).clientId("client-1").build();
        when(missionRepository.save(org.mockito.ArgumentMatchers.any(Mission.class))).thenReturn(saved);

        MissionResponse response = missionService.createMission("user-1", request);

        assertThat(response.getId()).isEqualTo("mission-1");
        assertThat(response.getTitle()).isEqualTo("Mission");
    }

    @Test
    void testGetMissions_pagination() {
        Page<Mission> page = new PageImpl<>(List.of(Mission.builder().id("mission-1").title("Mission").missionDate(LocalDate.now()).build()));
        when(missionRepository.findByUserIdOrderByMissionDateDesc("user-1", PageRequest.of(0, 10))).thenReturn(page);

        Page<MissionResponse> response = missionService.getMissions("user-1", PageRequest.of(0, 10));

        assertThat(response.getContent()).hasSize(1);
    }

    @Test
    void testGetMissionsByClient() {
        when(clientService.getClientById("user-1", "client-1")).thenReturn(new com.pedaerial.operatorflightcheck.dto.ClientResponse());
        when(missionRepository.findByUserIdAndClientId("user-1", "client-1")).thenReturn(List.of(
            Mission.builder().id("mission-1").clientId("client-1").title("Mission").missionDate(LocalDate.now()).build()
        ));

        List<MissionResponse> response = missionService.getMissionsByClient("user-1", "client-1");

        assertThat(response).hasSize(1);
        assertThat(response.get(0).getClientId()).isEqualTo("client-1");
    }

    @Test
    void testUpdateMission_success() {
        Mission mission = Mission.builder().id("mission-1").userId("user-1").title("Old").missionDate(LocalDate.now()).build();
        MissionRequest request = MissionRequest.builder().title("New").missionDate(LocalDate.now().plusDays(1)).build();
        when(missionRepository.findByIdAndUserId("mission-1", "user-1")).thenReturn(Optional.of(mission));
        when(missionRepository.save(mission)).thenReturn(mission);

        MissionResponse response = missionService.updateMission("user-1", "mission-1", request);

        assertThat(response.getTitle()).isEqualTo("New");
    }

    @Test
    void testDeleteMission_success() {
        Mission mission = Mission.builder().id("mission-1").userId("user-1").title("Delete").missionDate(LocalDate.now()).build();
        when(missionRepository.findByIdAndUserId("mission-1", "user-1")).thenReturn(Optional.of(mission));

        missionService.deleteMission("user-1", "mission-1");

        verify(missionRepository).delete(mission);
    }
}
