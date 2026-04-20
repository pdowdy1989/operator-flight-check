package com.pedaerial.operatorflightcheck.controller;

import com.pedaerial.operatorflightcheck.dto.DeliverableToggleRequest;
import com.pedaerial.operatorflightcheck.dto.DocumentResponse;
import com.pedaerial.operatorflightcheck.dto.DocumentUploadRequest;
import com.pedaerial.operatorflightcheck.entity.DocumentCategory;
import com.pedaerial.operatorflightcheck.security.AppUserPrincipal;
import com.pedaerial.operatorflightcheck.service.DocumentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @PostMapping("/upload")
    public ResponseEntity<DocumentResponse> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam("jobId") UUID jobId,
            @RequestParam(value = "missionId", required = false) UUID missionId,
            @RequestParam("category") DocumentCategory category,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "tags", required = false) String tags,
            @RequestParam(value = "isDeliverable", defaultValue = "false") Boolean isDeliverable,
            @AuthenticationPrincipal AppUserPrincipal principal,
            HttpServletRequest httpRequest) throws IOException {

        DocumentUploadRequest request = new DocumentUploadRequest(jobId, missionId, category, description, tags, isDeliverable);
        String baseUrl = httpRequest.getScheme() + "://" + httpRequest.getServerName() + ":" + httpRequest.getServerPort();
        DocumentResponse response = documentService.uploadDocument(file, request, principal.getId(), baseUrl);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/job/{jobId}")
    public ResponseEntity<List<DocumentResponse>> getJobDocuments(@PathVariable UUID jobId,
                                                                    HttpServletRequest httpRequest) {
        String baseUrl = httpRequest.getScheme() + "://" + httpRequest.getServerName() + ":" + httpRequest.getServerPort();
        return ResponseEntity.ok(documentService.getDocumentsForJob(jobId, baseUrl));
    }

    @GetMapping("/job/{jobId}/deliverables")
    public ResponseEntity<List<DocumentResponse>> getDeliverables(@PathVariable UUID jobId,
                                                                    HttpServletRequest httpRequest) {
        String baseUrl = httpRequest.getScheme() + "://" + httpRequest.getServerName() + ":" + httpRequest.getServerPort();
        return ResponseEntity.ok(documentService.getDeliverablesForJob(jobId, baseUrl));
    }

    @GetMapping("/mission/{missionId}")
    public ResponseEntity<List<DocumentResponse>> getMissionDocuments(@PathVariable UUID missionId,
                                                                       HttpServletRequest httpRequest) {
        String baseUrl = httpRequest.getScheme() + "://" + httpRequest.getServerName() + ":" + httpRequest.getServerPort();
        return ResponseEntity.ok(documentService.getDocumentsForMission(missionId, baseUrl));
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> download(@PathVariable UUID id) throws IOException {
        Resource resource = documentService.downloadDocument(id);
        String mimeType = documentService.getMimeType(id);
        String disposition = documentService.shouldOpenInline(id) ? "inline" : "attachment";
        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(mimeType))
            .header(HttpHeaders.CONTENT_DISPOSITION, disposition + "; filename=\"" + resource.getFilename() + "\"")
            .body(resource);
    }

    @PatchMapping("/{id}/deliverable")
    public ResponseEntity<DocumentResponse> toggleDeliverable(@PathVariable UUID id,
                                                               @Valid @RequestBody DeliverableToggleRequest request,
                                                               @AuthenticationPrincipal AppUserPrincipal principal,
                                                               HttpServletRequest httpRequest) {
        String baseUrl = httpRequest.getScheme() + "://" + httpRequest.getServerName() + ":" + httpRequest.getServerPort();
        return ResponseEntity.ok(documentService.markAsDeliverable(id, request.isDeliverable(), principal.getId(), baseUrl));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocument(@PathVariable UUID id,
                                                @AuthenticationPrincipal AppUserPrincipal principal) {
        documentService.deleteDocument(id, principal.getId());
        return ResponseEntity.noContent().build();
    }
}
