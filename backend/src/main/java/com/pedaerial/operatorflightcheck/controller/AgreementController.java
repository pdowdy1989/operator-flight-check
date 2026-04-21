package com.pedaerial.operatorflightcheck.controller;

import com.pedaerial.operatorflightcheck.dto.AgreementResponse;
import com.pedaerial.operatorflightcheck.security.AppUserPrincipal;
import com.pedaerial.operatorflightcheck.service.AgreementService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/agreements")
@RequiredArgsConstructor
public class AgreementController {

    private final AgreementService agreementService;

    @GetMapping("/{id}")
    public ResponseEntity<AgreementResponse> get(@PathVariable UUID id,
                                                  @AuthenticationPrincipal AppUserPrincipal principal) {
        return ResponseEntity.ok(agreementService.get(id, principal.getId()));
    }

    @GetMapping("/by-job/{jobId}")
    public ResponseEntity<AgreementResponse> getByJob(@PathVariable UUID jobId,
                                                       @AuthenticationPrincipal AppUserPrincipal principal) {
        return ResponseEntity.ok(agreementService.getByJob(jobId, principal.getId()));
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<Resource> downloadPdf(@PathVariable UUID id,
                                                 @AuthenticationPrincipal AppUserPrincipal principal) {
        Resource resource = agreementService.downloadPdf(id, principal.getId());
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"agreement-" + id + ".pdf\"")
            .contentType(MediaType.APPLICATION_PDF)
            .body(resource);
    }
}
