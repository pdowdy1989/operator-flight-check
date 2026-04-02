package com.pedaerial.operatorflightcheck.controller;

import com.pedaerial.operatorflightcheck.dto.InvoiceRequest;
import com.pedaerial.operatorflightcheck.dto.InvoiceResponse;
import com.pedaerial.operatorflightcheck.dto.InvoiceStatusUpdateRequest;
import com.pedaerial.operatorflightcheck.service.InvoiceService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {

    private final InvoiceService invoiceService;

    public InvoiceController(InvoiceService invoiceService) {
        this.invoiceService = invoiceService;
    }

    @PostMapping
    public ResponseEntity<InvoiceResponse> createInvoice(
        @RequestHeader("X-User-Id") String userId,
        @Valid @RequestBody InvoiceRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(invoiceService.createInvoice(userId, request));
    }

    @GetMapping
    public ResponseEntity<Page<InvoiceResponse>> getInvoices(
        @RequestHeader("X-User-Id") String userId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(invoiceService.getInvoices(userId, PageRequest.of(page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<InvoiceResponse> getInvoiceById(
        @RequestHeader("X-User-Id") String userId,
        @PathVariable String id
    ) {
        return ResponseEntity.ok(invoiceService.getInvoiceById(userId, id));
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<InvoiceResponse>> getInvoicesByClient(
        @RequestHeader("X-User-Id") String userId,
        @PathVariable String clientId
    ) {
        return ResponseEntity.ok(invoiceService.getInvoicesByClient(userId, clientId));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<InvoiceResponse>> getInvoicesByStatus(
        @RequestHeader("X-User-Id") String userId,
        @PathVariable String status
    ) {
        return ResponseEntity.ok(invoiceService.getInvoicesByStatus(userId, status));
    }

    @PutMapping("/{id}")
    public ResponseEntity<InvoiceResponse> updateInvoice(
        @RequestHeader("X-User-Id") String userId,
        @PathVariable String id,
        @Valid @RequestBody InvoiceRequest request
    ) {
        return ResponseEntity.ok(invoiceService.updateInvoice(userId, id, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<InvoiceResponse> updateInvoiceStatus(
        @RequestHeader("X-User-Id") String userId,
        @PathVariable String id,
        @Valid @RequestBody InvoiceStatusUpdateRequest request
    ) {
        return ResponseEntity.ok(invoiceService.updateInvoiceStatus(userId, id, request.getStatus()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInvoice(
        @RequestHeader("X-User-Id") String userId,
        @PathVariable String id
    ) {
        invoiceService.deleteInvoice(userId, id);
        return ResponseEntity.noContent().build();
    }
}
