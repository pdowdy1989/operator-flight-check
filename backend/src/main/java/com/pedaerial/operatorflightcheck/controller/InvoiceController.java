package com.pedaerial.operatorflightcheck.controller;

import com.pedaerial.operatorflightcheck.dto.InvoiceRequest;
import com.pedaerial.operatorflightcheck.dto.InvoiceResponse;
import com.pedaerial.operatorflightcheck.dto.InvoiceStatusUpdateRequest;
import com.pedaerial.operatorflightcheck.entity.Role;
import com.pedaerial.operatorflightcheck.security.AppUserPrincipal;
import com.pedaerial.operatorflightcheck.service.InvoiceService;
import com.pedaerial.operatorflightcheck.service.PdfGenerationService;
import jakarta.validation.Valid;
import org.springframework.core.io.PathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {

    private final InvoiceService invoiceService;
    private final PdfGenerationService pdfGenerationService;

    public InvoiceController(InvoiceService invoiceService, PdfGenerationService pdfGenerationService) {
        this.invoiceService = invoiceService;
        this.pdfGenerationService = pdfGenerationService;
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

    @GetMapping("/{id}/pdf")
    public ResponseEntity<Resource> downloadPdf(@PathVariable UUID id,
                                                 @AuthenticationPrincipal AppUserPrincipal principal) {
        // Ownership/access check via getInvoice — throws Unauthorized if denied
        invoiceService.getInvoice(id, principal.getId());
        // Retrieve the raw invoice entity for PDF generation
        var invoice = invoiceService.getInvoiceEntity(id);
        java.nio.file.Path pdfPath = pdfGenerationService.generateInvoicePdf(invoice);
        Resource resource = new PathResource(pdfPath);
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"invoice-" + id + ".pdf\"")
            .contentType(MediaType.APPLICATION_PDF)
            .body(resource);
    }
}
