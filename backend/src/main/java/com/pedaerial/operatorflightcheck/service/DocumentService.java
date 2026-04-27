package com.pedaerial.operatorflightcheck.service;

import com.pedaerial.operatorflightcheck.dto.DocumentResponse;
import com.pedaerial.operatorflightcheck.dto.DocumentUploadRequest;
import com.pedaerial.operatorflightcheck.entity.*;
import com.pedaerial.operatorflightcheck.exception.BadRequestException;
import com.pedaerial.operatorflightcheck.exception.ResourceNotFoundException;
import com.pedaerial.operatorflightcheck.exception.UnauthorizedException;
import com.pedaerial.operatorflightcheck.repository.DocumentRepository;
import com.pedaerial.operatorflightcheck.repository.JobRepository;
import com.pedaerial.operatorflightcheck.repository.MissionRepository;
import com.pedaerial.operatorflightcheck.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.awt.Graphics2D;
import java.awt.Image;
import java.util.*;

@Service
@Transactional
public class DocumentService {

    private static final Set<String> ALLOWED_MIME_TYPES = Set.of(
        "image/jpeg", "image/png", "image/webp",
        "video/mp4", "video/quicktime",
        "application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/tiff", "application/vnd.google-earth.kml+xml"
    );

    private final DocumentRepository documentRepository;
    private final JobRepository jobRepository;
    private final MissionRepository missionRepository;
    private final UserRepository userRepository;
    private final ResponseMapper mapper;

    @Value("${app.upload.dir:./uploads}")
    private String uploadDir;

    public DocumentService(DocumentRepository documentRepository, JobRepository jobRepository,
                           MissionRepository missionRepository, UserRepository userRepository,
                           ResponseMapper mapper) {
        this.documentRepository = documentRepository;
        this.jobRepository = jobRepository;
        this.missionRepository = missionRepository;
        this.userRepository = userRepository;
        this.mapper = mapper;
    }

    public DocumentResponse uploadDocument(MultipartFile file, DocumentUploadRequest request,
                                           String uploaderId, String baseUrl) throws IOException {
        String mimeType = file.getContentType();
        if (mimeType == null || !ALLOWED_MIME_TYPES.contains(mimeType)) {
            throw new BadRequestException("File type not allowed: " + mimeType);
        }
        if (file.getSize() > 50L * 1024 * 1024) {
            throw new BadRequestException("File exceeds 50MB limit.");
        }

        Job job = jobRepository.findById(request.jobId())
            .orElseThrow(() -> new ResourceNotFoundException("Job not found: " + request.jobId()));

        Mission mission = null;
        if (request.missionId() != null) {
            mission = missionRepository.findById(request.missionId())
                .orElseThrow(() -> new ResourceNotFoundException("Mission not found: " + request.missionId()));
        }

        User uploader = userRepository.findById(uploaderId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + uploaderId));

        String safeFileName = UUID.randomUUID() + "_" + sanitizeFileName(file.getOriginalFilename());
        Path jobDir = Paths.get(uploadDir, request.jobId().toString()).toAbsolutePath().normalize();
        Files.createDirectories(jobDir);
        Path filePath = jobDir.resolve(safeFileName);
        file.transferTo(filePath.toFile());

        String thumbnailPath = null;
        if (mimeType.startsWith("image/")) {
            thumbnailPath = generateThumbnail(filePath, jobDir, safeFileName);
        }

        DocumentType docType = resolveDocumentType(mimeType);

        Document doc = Document.builder()
            .job(job)
            .mission(mission)
            .uploadedBy(uploader)
            .fileName(file.getOriginalFilename())
            .fileType(docType)
            .filePath(filePath.toString())
            .fileSizeBytes(file.getSize())
            .thumbnailPath(thumbnailPath)
            .mimeType(mimeType)
            .description(request.description())
            .tags(request.tags())
            .category(request.category())
            .isDeliverable(request.isDeliverable() != null ? request.isDeliverable() : false)
            .build();

        return mapper.toDocumentResponse(documentRepository.save(doc), baseUrl);
    }

    @Transactional(readOnly = true)
    public List<DocumentResponse> getDocumentsForJob(UUID jobId, String baseUrl) {
        return documentRepository.findByJobIdOrderByCreatedAtDesc(jobId)
            .stream().map(d -> mapper.toDocumentResponse(d, baseUrl)).toList();
    }

    @Transactional(readOnly = true)
    public List<DocumentResponse> getDeliverablesForJob(UUID jobId, String baseUrl) {
        return documentRepository.findByJobIdAndIsDeliverableTrue(jobId)
            .stream().map(d -> mapper.toDocumentResponse(d, baseUrl)).toList();
    }

    @Transactional(readOnly = true)
    public List<DocumentResponse> getDocumentsForMission(UUID missionId, String baseUrl) {
        return documentRepository.findByMissionIdOrderByCreatedAtDesc(missionId)
            .stream().map(d -> mapper.toDocumentResponse(d, baseUrl)).toList();
    }

    public DocumentResponse markAsDeliverable(UUID documentId, boolean isDeliverable, String requesterId, String baseUrl) {
        Document doc = documentRepository.findById(documentId)
            .orElseThrow(() -> new ResourceNotFoundException("Document not found: " + documentId));
        doc.setIsDeliverable(isDeliverable);
        return mapper.toDocumentResponse(documentRepository.save(doc), baseUrl);
    }

    public void deleteDocument(UUID documentId, String requesterId) {
        Document doc = documentRepository.findById(documentId)
            .orElseThrow(() -> new ResourceNotFoundException("Document not found: " + documentId));

        User requester = userRepository.findById(requesterId).orElse(null);
        boolean isUploader = doc.getUploadedBy().getId().equals(requesterId);
        boolean isAdmin = requester != null && requester.getRole() == Role.ADMIN;

        if (!isUploader && !isAdmin) {
            throw new UnauthorizedException("Only the uploader or admin can delete documents.");
        }

        try {
            Files.deleteIfExists(Paths.get(doc.getFilePath()));
            if (doc.getThumbnailPath() != null) {
                Files.deleteIfExists(Paths.get(doc.getThumbnailPath()));
            }
        } catch (IOException ignored) {
        }

        documentRepository.delete(doc);
    }

    public Resource downloadDocument(UUID documentId) throws MalformedURLException {
        Document doc = documentRepository.findById(documentId)
            .orElseThrow(() -> new ResourceNotFoundException("Document not found: " + documentId));

        Path filePath = Paths.get(doc.getFilePath());
        Resource resource = new UrlResource(filePath.toUri());
        if (!resource.exists()) {
            throw new ResourceNotFoundException("File not found on disk.");
        }
        return resource;
    }

    public String getMimeType(UUID documentId) {
        Document doc = documentRepository.findById(documentId)
            .orElseThrow(() -> new ResourceNotFoundException("Document not found: " + documentId));
        return doc.getMimeType() != null ? doc.getMimeType() : "application/octet-stream";
    }

    public boolean shouldOpenInline(UUID documentId) {
        Document doc = documentRepository.findById(documentId)
            .orElseThrow(() -> new ResourceNotFoundException("Document not found: " + documentId));
        String mimeType = doc.getMimeType();
        return mimeType != null && (
            mimeType.equals("application/pdf") ||
            mimeType.startsWith("image/")
        );
    }

    private String generateThumbnail(Path sourcePath, Path dir, String originalName) {
        try {
            BufferedImage original = ImageIO.read(sourcePath.toFile());
            if (original == null) return null;

            int thumbWidth = 200;
            int thumbHeight = (int) ((double) original.getHeight() / original.getWidth() * thumbWidth);
            BufferedImage thumb = new BufferedImage(thumbWidth, thumbHeight, BufferedImage.TYPE_INT_RGB);
            Graphics2D g = thumb.createGraphics();
            try {
                g.drawImage(original.getScaledInstance(thumbWidth, thumbHeight, Image.SCALE_SMOOTH), 0, 0, null);
            } finally {
                g.dispose();
            }

            String thumbName = "thumb_" + originalName.replaceAll("\\.[^.]+$", ".jpg");
            Path thumbPath = dir.resolve(thumbName);
            ImageIO.write(thumb, "jpg", thumbPath.toFile());
            return thumbPath.toString();
        } catch (Exception e) {
            return null;
        }
    }

    private DocumentType resolveDocumentType(String mimeType) {
        if (mimeType == null) return DocumentType.OTHER;
        if (mimeType.startsWith("image/")) return DocumentType.PHOTO;
        if (mimeType.startsWith("video/")) return DocumentType.VIDEO;
        if (mimeType.equals("application/pdf")) return DocumentType.PDF;
        return DocumentType.OTHER;
    }

    private String sanitizeFileName(String name) {
        if (name == null) return "file";
        return name.replaceAll("[^a-zA-Z0-9._-]", "_");
    }
}
