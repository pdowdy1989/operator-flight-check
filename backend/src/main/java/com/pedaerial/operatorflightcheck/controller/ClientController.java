package com.pedaerial.operatorflightcheck.controller;

import com.pedaerial.operatorflightcheck.dto.ClientRequest;
import com.pedaerial.operatorflightcheck.dto.ClientResponse;
import com.pedaerial.operatorflightcheck.security.AppUserPrincipal;
import com.pedaerial.operatorflightcheck.service.ClientService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/clients")
public class ClientController {

    private final ClientService clientService;

    public ClientController(ClientService clientService) {
        this.clientService = clientService;
    }

    @PostMapping
    public ResponseEntity<ClientResponse> createClient(@Valid @RequestBody ClientRequest request,
                                                        @AuthenticationPrincipal AppUserPrincipal principal) {
        return ResponseEntity.ok(clientService.createClient(request, principal.getId()));
    }

    @GetMapping
    public ResponseEntity<List<ClientResponse>> listClients(@AuthenticationPrincipal AppUserPrincipal principal) {
        return ResponseEntity.ok(clientService.getClientsForPilot(principal.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClientResponse> getClient(@PathVariable UUID id,
                                                     @AuthenticationPrincipal AppUserPrincipal principal) {
        return ResponseEntity.ok(clientService.getClient(id, principal.getId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClientResponse> updateClient(@PathVariable UUID id,
                                                        @Valid @RequestBody ClientRequest request,
                                                        @AuthenticationPrincipal AppUserPrincipal principal) {
        return ResponseEntity.ok(clientService.updateClient(id, request, principal.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClient(@PathVariable UUID id,
                                              @AuthenticationPrincipal AppUserPrincipal principal) {
        clientService.deleteClient(id, principal.getId());
        return ResponseEntity.noContent().build();
    }
}
