package com.pedaerial.operatorflightcheck.repository;

import com.pedaerial.operatorflightcheck.entity.Client;
import com.pedaerial.operatorflightcheck.entity.ClientType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ClientRepository extends JpaRepository<Client, UUID> {
    List<Client> findByPilotIdOrderByNameAsc(String pilotId);
    List<Client> findByPilotIdAndClientType(String pilotId, ClientType clientType);
    Optional<Client> findByEmailIgnoreCase(String email);
}
