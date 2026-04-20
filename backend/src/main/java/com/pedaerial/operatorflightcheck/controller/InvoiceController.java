package com.pedaerial.operatorflightcheck.controller;

import com.pedaerial.operatorflightcheck.dto.InvoiceRequest;
import com.pedaerial.operatorflightcheck.dto.InvoiceResponse;
import com.pedaerial.operatorflightcheck.dto.InvoiceStatusUpdateRequest;
import com.pedaerial.operatorflightcheck.entity.Role;
import com.pedaerial.operatorflightcheck.security.AppUserPrincipal;
import com.pedaerial.operatorflightcheck.service.InvoiceService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {

    private final InvoiceService invoiceService;

    public InvoiceController(InvoiceService invoiceService) {
        this.invoiceService = invoiceService;
    }

    @PostMapping
    public ResponseEntity<InvoiceResponse> createInvoice(@Valid @RequestBody InvoiceRequest request,
                                                          @AuthenticationPrincipal AppUserPrincipal principal) {
        return ResponseEntity.ok(invoiceService.createInvoice(request, principal.getId()));
    }

    @GetMapping
    public ResponseEntity<List<InvoiceResponse>> listInvoices(@AuthenticationPrincipal AppUserPrincipal principal) {
        List<InvoiceResponse> invoices = principal.getRole() == Role.CLIENT
            ? invoiceService.getInvoicesForClientUser(principal.getId())
            : invoiceService.getInvoicesForPilot(principal.getId());
        return ResponseEntity.ok(invoices);
    }

    @GetMapping("/{id}")
    public ResponseEntity<InvoiceResponse> getInvoice(@PathVariable UUID id,
                                                       @AuthenticationPrincipal AppUserPrincipal principal) {
        return ResponseEntity.ok(invoiceService.getInvoice(id, principal.getId()));
    }

    @GetMapping("/by-job/{jobId}")
    public ResponseEntity<InvoiceResponse> getInvoiceByJob(@PathVariable UUID jobId,
                                                            @AuthenticationPrincipal AppUserPrincipal principal) {
        return ResponseEntity.ok(invoiceService.getInvoiceByJob(jobId));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<InvoiceResponse> updateStatus(@PathVariable UUID id,
                                                         @Valid @RequestBody InvoiceStatusUpdateRequest request,
                                                         @AuthenticationPrincipal AppUserPrincipal principal) {
        return ResponseEntity.ok(invoiceService.updateInvoiceStatus(id, request.status(), principal.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInvoice(@PathVariable UUID id,
                                               @AuthenticationPrincipal AppUserPrincipal principal) {
        invoiceService.deleteInvoice(id, principal.getId());
        return ResponseEntity.noContent().build();
    }
}
