package com.pedaerial.operatorflightcheck.controller;

import com.pedaerial.operatorflightcheck.dto.clientportal.ClientPortalResponse;
import com.pedaerial.operatorflightcheck.dto.clientportal.DeliverableResponse;
import com.pedaerial.operatorflightcheck.dto.clientportal.PaymentPublicRequest;
import com.pedaerial.operatorflightcheck.service.ClientPortalService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/client-portal")
public class ClientPortalController {

    private final ClientPortalService clientPortalService;

    public ClientPortalController(ClientPortalService clientPortalService) {
        this.clientPortalService = clientPortalService;
    }

    @GetMapping("/{token}")
    public ResponseEntity<ClientPortalResponse> getPortal(@PathVariable String token) {
        return ResponseEntity.ok(clientPortalService.getPortal(token));
    }

    @GetMapping("/{token}/status")
    public ResponseEntity<Map<String, Object>> getStatus(@PathVariable String token) {
        return ResponseEntity.ok(clientPortalService.getStatus(token));
    }

    @GetMapping("/{token}/deliverables")
    public ResponseEntity<List<DeliverableResponse>> getDeliverables(@PathVariable String token) {
        return ResponseEntity.ok(clientPortalService.getDeliverables(token));
    }

    @PostMapping("/{token}/pay")
    public ResponseEntity<ClientPortalResponse> processPayment(
        @PathVariable String token,
        @Valid @RequestBody PaymentPublicRequest request
    ) {
        return ResponseEntity.ok(clientPortalService.processPayment(token, request));
    }
}
