package com.pedaerial.operatorflightcheck.controller;

import com.pedaerial.operatorflightcheck.dto.ClientRequest;
import com.pedaerial.operatorflightcheck.dto.ClientResponse;
import com.pedaerial.operatorflightcheck.service.ClientService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/clients")
public class ClientController {

    private final ClientService clientService;

    public ClientController(ClientService clientService) {
        this.clientService = clientService;
    }

    @PostMapping
    public ResponseEntity<ClientResponse> createClient(
        @RequestHeader("X-User-Id") String userId,
        @Valid @RequestBody ClientRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(clientService.createClient(userId, request));
    }

    @GetMapping
    public ResponseEntity<List<ClientResponse>> getClients(@RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(clientService.getClients(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClientResponse> getClientById(
        @RequestHeader("X-User-Id") String userId,
        @PathVariable String id
    ) {
        return ResponseEntity.ok(clientService.getClientById(userId, id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<ClientResponse>> searchClients(
        @RequestHeader("X-User-Id") String userId,
        @RequestParam("q") String query
    ) {
        return ResponseEntity.ok(clientService.searchClients(userId, query));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClientResponse> updateClient(
        @RequestHeader("X-User-Id") String userId,
        @PathVariable String id,
        @Valid @RequestBody ClientRequest request
    ) {
        return ResponseEntity.ok(clientService.updateClient(userId, id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClient(
        @RequestHeader("X-User-Id") String userId,
        @PathVariable String id
    ) {
        clientService.deleteClient(userId, id);
        return ResponseEntity.noContent().build();
    }
}
