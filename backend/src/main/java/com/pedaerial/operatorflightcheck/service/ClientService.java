package com.pedaerial.operatorflightcheck.service;

import com.pedaerial.operatorflightcheck.dto.ClientRequest;
import com.pedaerial.operatorflightcheck.dto.ClientResponse;
import com.pedaerial.operatorflightcheck.entity.Client;
import com.pedaerial.operatorflightcheck.entity.User;
import com.pedaerial.operatorflightcheck.exception.ResourceNotFoundException;
import com.pedaerial.operatorflightcheck.exception.UnauthorizedException;
import com.pedaerial.operatorflightcheck.repository.ClientRepository;
import com.pedaerial.operatorflightcheck.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class ClientService {

    private final ClientRepository clientRepository;
    private final UserRepository userRepository;
    private final ResponseMapper mapper;

    public ClientService(ClientRepository clientRepository, UserRepository userRepository, ResponseMapper mapper) {
        this.clientRepository = clientRepository;
        this.userRepository = userRepository;
        this.mapper = mapper;
    }

    public ClientResponse createClient(ClientRequest request, String pilotId) {
        User pilot = userRepository.findById(pilotId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + pilotId));

        Client client = Client.builder()
            .pilot(pilot)
            .name(request.name())
            .email(request.email())
            .phone(request.phone())
            .company(request.company())
            .clientType(request.clientType())
            .address(request.address())
            .notes(request.notes())
            .build();

        return mapper.toClientResponse(clientRepository.save(client));
    }

    @Transactional(readOnly = true)
    public List<ClientResponse> getClientsForPilot(String pilotId) {
        return clientRepository.findByPilotIdOrderByNameAsc(pilotId)
            .stream().map(mapper::toClientResponse).toList();
    }

    @Transactional(readOnly = true)
    public ClientResponse getClient(UUID clientId, String requesterId) {
        Client client = findClientOwned(clientId, requesterId);
        return mapper.toClientResponse(client);
    }

    public ClientResponse updateClient(UUID clientId, ClientRequest request, String requesterId) {
        Client client = findClientOwned(clientId, requesterId);

        client.setName(request.name());
        client.setEmail(request.email());
        client.setPhone(request.phone());
        client.setCompany(request.company());
        client.setClientType(request.clientType());
        client.setAddress(request.address());
        client.setNotes(request.notes());

        return mapper.toClientResponse(clientRepository.save(client));
    }

    public void deleteClient(UUID clientId, String requesterId) {
        Client client = findClientOwned(clientId, requesterId);
        clientRepository.delete(client);
    }

    private Client findClientOwned(UUID clientId, String requesterId) {
        Client client = clientRepository.findById(clientId)
            .orElseThrow(() -> new ResourceNotFoundException("Client not found: " + clientId));
        if (!client.getPilot().getId().equals(requesterId)) {
            throw new UnauthorizedException("Access denied.");
        }
        return client;
    }
}
