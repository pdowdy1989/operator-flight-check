package com.pedaerial.operatorflightcheck.service;

import com.pedaerial.operatorflightcheck.dto.MissionRequest;
import com.pedaerial.operatorflightcheck.dto.MissionResponse;
import com.pedaerial.operatorflightcheck.entity.Client;
import com.pedaerial.operatorflightcheck.entity.DroneProfile;
import com.pedaerial.operatorflightcheck.entity.Mission;
import com.pedaerial.operatorflightcheck.entity.MissionStatus;
import com.pedaerial.operatorflightcheck.exception.BadRequestException;
import com.pedaerial.operatorflightcheck.exception.ResourceNotFoundException;
import com.pedaerial.operatorflightcheck.repository.MissionRepository;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MissionService {

    private final MissionRepository missionRepository;
    private final ClientService clientService;
    private final DroneProfileService droneProfileService;

    public MissionService(
        MissionRepository missionRepository,
        ClientService clientService,
        DroneProfileService droneProfileService
    ) {
        this.missionRepository = missionRepository;
        this.clientService = clientService;
        this.droneProfileService = droneProfileService;
    }

    @Transactional
    public MissionResponse createMission(String userId, MissionRequest req) {
        validateOwnership(userId, req.getClientId(), req.getDroneProfileId());
        Mission mission = Mission.builder()
            .userId(userId)
            .clientId(blankToNull(req.getClientId()))
            .droneProfileId(blankToNull(req.getDroneProfileId()))
            .title(req.getTitle())
            .description(req.getDescription())
            .locationLabel(req.getLocationLabel())
            .locationAddress(req.getLocationAddress())
            .locationLat(req.getLocationLat())
            .locationLon(req.getLocationLon())
            .missionDate(req.getMissionDate())
            .status(resolveMissionStatus(req.getStatus()))
            .flyScore(req.getFlyScore())
            .weatherSummary(req.getWeatherSummary())
            .durationHours(req.getDurationHours())
            .notes(req.getNotes())
            .build();
        return ResponseMapper.toMissionResponse(missionRepository.save(mission));
    }

    @Transactional(readOnly = true)
    public Page<MissionResponse> getMissions(String userId, Pageable pageable) {
        return missionRepository.findByUserIdOrderByMissionDateDesc(userId, pageable)
            .map(ResponseMapper::toMissionResponse);
    }

    @Transactional(readOnly = true)
    public MissionResponse getMissionById(String userId, String missionId) {
        return ResponseMapper.toMissionResponse(getOwnedMission(userId, missionId));
    }

    @Transactional(readOnly = true)
    public List<MissionResponse> getMissionsByClient(String userId, String clientId) {
        clientService.getClientById(userId, clientId);
        return missionRepository.findByUserIdAndClientId(userId, clientId).stream()
            .map(ResponseMapper::toMissionResponse)
            .toList();
    }

    @Transactional
    public MissionResponse updateMission(String userId, String missionId, MissionRequest req) {
        validateOwnership(userId, req.getClientId(), req.getDroneProfileId());
        Mission mission = getOwnedMission(userId, missionId);
        mission.setClientId(blankToNull(req.getClientId()));
        mission.setDroneProfileId(blankToNull(req.getDroneProfileId()));
        mission.setTitle(req.getTitle());
        mission.setDescription(req.getDescription());
        mission.setLocationLabel(req.getLocationLabel());
        mission.setLocationAddress(req.getLocationAddress());
        mission.setLocationLat(req.getLocationLat());
        mission.setLocationLon(req.getLocationLon());
        mission.setMissionDate(req.getMissionDate());
        mission.setStatus(resolveMissionStatus(req.getStatus()));
        mission.setFlyScore(req.getFlyScore());
        mission.setWeatherSummary(req.getWeatherSummary());
        mission.setDurationHours(req.getDurationHours());
        mission.setNotes(req.getNotes());
        return ResponseMapper.toMissionResponse(missionRepository.save(mission));
    }

    @Transactional
    public void deleteMission(String userId, String missionId) {
        missionRepository.delete(getOwnedMission(userId, missionId));
    }

    @Transactional(readOnly = true)
    protected Mission getOwnedMission(String userId, String missionId) {
        return missionRepository.findByIdAndUserId(missionId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Mission not found: " + missionId));
    }

    private void validateOwnership(String userId, String clientId, String droneProfileId) {
        if (clientId != null && !clientId.isBlank()) {
            Client ignored = clientService.getOwnedClient(userId, clientId);
        }
        if (droneProfileId != null && !droneProfileId.isBlank()) {
            DroneProfile ignored = droneProfileService.getOwnedProfile(userId, droneProfileId);
        }
    }

    private String resolveMissionStatus(String status) {
        if (status == null || status.isBlank()) {
            return MissionStatus.PLANNED.name();
        }
        try {
            return MissionStatus.valueOf(status.trim().toUpperCase()).name();
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid mission status: " + status);
        }
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }
}
