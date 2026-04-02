package com.pedaerial.operatorflightcheck.service;

import com.pedaerial.operatorflightcheck.dto.ClientRequest;
import com.pedaerial.operatorflightcheck.dto.ClientResponse;
import com.pedaerial.operatorflightcheck.entity.Client;
import com.pedaerial.operatorflightcheck.exception.ResourceNotFoundException;
import com.pedaerial.operatorflightcheck.repository.ClientRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ClientService {

    private final ClientRepository clientRepository;

    public ClientService(ClientRepository clientRepository) {
        this.clientRepository = clientRepository;
    }

    @Transactional
    public ClientResponse createClient(String userId, ClientRequest req) {
        Client client = Client.builder()
            .userId(userId)
            .name(req.getName())
            .email(req.getEmail())
            .company(req.getCompany())
            .phone(req.getPhone())
            .billingAddress(req.getBillingAddress())
            .notes(req.getNotes())
            .build();
        return ResponseMapper.toClientResponse(clientRepository.save(client));
    }

    @Transactional(readOnly = true)
    public List<ClientResponse> getClients(String userId) {
        return clientRepository.findByUserIdOrderByNameAsc(userId).stream()
            .map(ResponseMapper::toClientResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public ClientResponse getClientById(String userId, String clientId) {
        return ResponseMapper.toClientResponse(getOwnedClient(userId, clientId));
    }

    @Transactional(readOnly = true)
    public List<ClientResponse> searchClients(String userId, String query) {
        return clientRepository.searchByUserIdAndQuery(userId, query == null ? "" : query.trim()).stream()
            .map(ResponseMapper::toClientResponse)
            .toList();
    }

    @Transactional
    public ClientResponse updateClient(String userId, String clientId, ClientRequest req) {
        Client client = getOwnedClient(userId, clientId);
        client.setName(req.getName());
        client.setEmail(req.getEmail());
        client.setCompany(req.getCompany());
        client.setPhone(req.getPhone());
        client.setBillingAddress(req.getBillingAddress());
        client.setNotes(req.getNotes());
        return ResponseMapper.toClientResponse(clientRepository.save(client));
    }

    @Transactional
    public void deleteClient(String userId, String clientId) {
        clientRepository.delete(getOwnedClient(userId, clientId));
    }

    @Transactional(readOnly = true)
    protected Client getOwnedClient(String userId, String clientId) {
        return clientRepository.findByIdAndUserId(clientId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Client not found: " + clientId));
    }
}
