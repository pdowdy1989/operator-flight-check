package com.pedaerial.operatorflightcheck.service;

import com.pedaerial.operatorflightcheck.dto.MissionCompletionRequest;
import com.pedaerial.operatorflightcheck.dto.MissionRequest;
import com.pedaerial.operatorflightcheck.dto.MissionResponse;
import com.pedaerial.operatorflightcheck.entity.DroneProfile;
import com.pedaerial.operatorflightcheck.entity.Job;
import com.pedaerial.operatorflightcheck.entity.Mission;
import com.pedaerial.operatorflightcheck.entity.MissionStatus;
import com.pedaerial.operatorflightcheck.entity.User;
import com.pedaerial.operatorflightcheck.exception.BadRequestException;
import com.pedaerial.operatorflightcheck.exception.ResourceNotFoundException;
import com.pedaerial.operatorflightcheck.exception.UnauthorizedException;
import com.pedaerial.operatorflightcheck.repository.DroneProfileRepository;
import com.pedaerial.operatorflightcheck.repository.JobRepository;
import com.pedaerial.operatorflightcheck.repository.MissionRepository;
import com.pedaerial.operatorflightcheck.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class MissionService {

    private final MissionRepository missionRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final DroneProfileRepository droneProfileRepository;
    private final ResponseMapper mapper;

    public MissionService(MissionRepository missionRepository, JobRepository jobRepository,
                          UserRepository userRepository, DroneProfileRepository droneProfileRepository,
                          ResponseMapper mapper) {
        this.missionRepository = missionRepository;
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
        this.droneProfileRepository = droneProfileRepository;
        this.mapper = mapper;
    }

    public MissionResponse createMission(MissionRequest request, String pilotId) {
        Job job = jobRepository.findById(request.jobId())
            .orElseThrow(() -> new ResourceNotFoundException("Job not found: " + request.jobId()));

        User pilot = userRepository.findById(pilotId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + pilotId));

        DroneProfile drone = null;
        if (request.droneProfileId() != null) {
            drone = droneProfileRepository.findById(request.droneProfileId())
                .orElseThrow(() -> new ResourceNotFoundException("Drone not found: " + request.droneProfileId()));
        }

        Mission mission = Mission.builder()
            .job(job)
            .pilot(pilot)
            .droneProfile(drone)
            .flightDate(request.flightDate())
            .flightTime(request.flightTime())
            .status(MissionStatus.PLANNED)
            .notes(request.notes())
            .build();

        return mapper.toMissionResponse(missionRepository.save(mission));
    }

    public MissionResponse completeMission(UUID missionId, MissionCompletionRequest request, String pilotId) {
        Mission mission = findMissionOwned(missionId, pilotId);

        if (mission.getStatus() == MissionStatus.COMPLETED) {
            throw new BadRequestException("Mission is already completed.");
        }

        mission.setDurationMinutes(request.durationMinutes());
        mission.setWeatherTempF(request.weatherTempF());
        mission.setWeatherWindMph(request.weatherWindMph());
        mission.setWeatherGustMph(request.weatherGustMph());
        mission.setWeatherConditions(request.weatherConditions());
        mission.setWeatherVisibility(request.weatherVisibility());
        mission.setFlyScore(request.flyScore());
        mission.setStatus(MissionStatus.COMPLETED);
        if (request.notes() != null) mission.setNotes(request.notes());

        return mapper.toMissionResponse(missionRepository.save(mission));
    }

    @Transactional(readOnly = true)
    public List<MissionResponse> getMissionsForJob(UUID jobId) {
        return missionRepository.findByJobIdOrderByFlightDateDesc(jobId)
            .stream().map(mapper::toMissionResponse).toList();
    }

    @Transactional(readOnly = true)
    public MissionResponse getMission(UUID missionId) {
        Mission mission = missionRepository.findById(missionId)
            .orElseThrow(() -> new ResourceNotFoundException("Mission not found: " + missionId));
        return mapper.toMissionResponse(mission);
    }

    public void deleteMission(UUID missionId, String pilotId) {
        Mission mission = findMissionOwned(missionId, pilotId);
        missionRepository.delete(mission);
    }

    private Mission findMissionOwned(UUID missionId, String pilotId) {
        Mission mission = missionRepository.findById(missionId)
            .orElseThrow(() -> new ResourceNotFoundException("Mission not found: " + missionId));
        if (!mission.getPilot().getId().equals(pilotId)) {
            throw new UnauthorizedException("Access denied.");
        }
        return mission;
    }
}
