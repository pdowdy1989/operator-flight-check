package com.pedaerial.operatorflightcheck.service;

import com.pedaerial.operatorflightcheck.dto.DroneProfileRequest;
import com.pedaerial.operatorflightcheck.dto.DroneProfileResponse;
import com.pedaerial.operatorflightcheck.entity.DroneProfile;
import com.pedaerial.operatorflightcheck.entity.User;
import com.pedaerial.operatorflightcheck.exception.ResourceNotFoundException;
import com.pedaerial.operatorflightcheck.exception.UnauthorizedException;
import com.pedaerial.operatorflightcheck.repository.DroneProfileRepository;
import com.pedaerial.operatorflightcheck.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class DroneProfileService {

    private final DroneProfileRepository droneProfileRepository;
    private final UserRepository userRepository;
    private final ResponseMapper mapper;

    public DroneProfileService(DroneProfileRepository droneProfileRepository, UserRepository userRepository, ResponseMapper mapper) {
        this.droneProfileRepository = droneProfileRepository;
        this.userRepository = userRepository;
        this.mapper = mapper;
    }

    public DroneProfileResponse createDroneProfile(DroneProfileRequest request, String pilotId) {
        User pilot = userRepository.findById(pilotId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + pilotId));

        DroneProfile drone = DroneProfile.builder()
            .pilot(pilot)
            .name(request.name())
            .manufacturer(request.manufacturer())
            .model(request.model())
            .serialNumber(request.serialNumber())
            .faaRegistration(request.faaRegistration())
            .weightGrams(request.weightGrams())
            .maxWindMph(request.maxWindMph() != null ? request.maxWindMph() : 20)
            .maxGustMph(request.maxGustMph() != null ? request.maxGustMph() : 25)
            .notes(request.notes())
            .active(request.active() != null ? request.active() : true)
            .build();

        return mapper.toDroneProfileResponse(droneProfileRepository.save(drone));
    }

    @Transactional(readOnly = true)
    public List<DroneProfileResponse> getDronesForPilot(String pilotId) {
        return droneProfileRepository.findByPilotIdOrderByNameAsc(pilotId)
            .stream().map(mapper::toDroneProfileResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<DroneProfileResponse> getActiveDronesForPilot(String pilotId) {
        return droneProfileRepository.findByPilotIdAndActiveTrue(pilotId)
            .stream().map(mapper::toDroneProfileResponse).toList();
    }

    @Transactional(readOnly = true)
    public DroneProfileResponse getDrone(UUID droneId, String requesterId) {
        DroneProfile drone = findDroneOwned(droneId, requesterId);
        return mapper.toDroneProfileResponse(drone);
    }

    public DroneProfileResponse updateDrone(UUID droneId, DroneProfileRequest request, String requesterId) {
        DroneProfile drone = findDroneOwned(droneId, requesterId);

        drone.setName(request.name());
        drone.setManufacturer(request.manufacturer());
        drone.setModel(request.model());
        drone.setSerialNumber(request.serialNumber());
        drone.setFaaRegistration(request.faaRegistration());
        drone.setWeightGrams(request.weightGrams());
        if (request.maxWindMph() != null) drone.setMaxWindMph(request.maxWindMph());
        if (request.maxGustMph() != null) drone.setMaxGustMph(request.maxGustMph());
        drone.setNotes(request.notes());
        if (request.active() != null) drone.setActive(request.active());

        return mapper.toDroneProfileResponse(droneProfileRepository.save(drone));
    }

    public void deleteDrone(UUID droneId, String requesterId) {
        DroneProfile drone = findDroneOwned(droneId, requesterId);
        droneProfileRepository.delete(drone);
    }

    private DroneProfile findDroneOwned(UUID droneId, String requesterId) {
        DroneProfile drone = droneProfileRepository.findById(droneId)
            .orElseThrow(() -> new ResourceNotFoundException("Drone profile not found: " + droneId));
        if (!drone.getPilot().getId().equals(requesterId)) {
            throw new UnauthorizedException("Access denied.");
        }
        return drone;
    }
}
