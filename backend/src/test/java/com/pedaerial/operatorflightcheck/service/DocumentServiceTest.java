package com.pedaerial.operatorflightcheck.service;

import com.pedaerial.operatorflightcheck.dto.DocumentResponse;
import com.pedaerial.operatorflightcheck.dto.DocumentUploadRequest;
import com.pedaerial.operatorflightcheck.entity.*;
import com.pedaerial.operatorflightcheck.exception.BadRequestException;
import com.pedaerial.operatorflightcheck.exception.UnauthorizedException;
import com.pedaerial.operatorflightcheck.repository.DocumentRepository;
import com.pedaerial.operatorflightcheck.repository.JobRepository;
import com.pedaerial.operatorflightcheck.repository.MissionRepository;
import com.pedaerial.operatorflightcheck.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DocumentServiceTest {

    @Mock DocumentRepository documentRepository;
    @Mock JobRepository jobRepository;
    @Mock MissionRepository missionRepository;
    @Mock UserRepository userRepository;
    @Mock ResponseMapper mapper;

    @InjectMocks DocumentService documentService;

    private User pilot;
    private Job job;

    @BeforeEach
    void setUp() {
        pilot = new User();
        pilot.setId(UUID.randomUUID().toString());
        pilot.setEmail("pilot@test.com");
        pilot.setRole(Role.PILOT);

        Client client = Client.builder()
            .id(UUID.randomUUID())
            .pilot(pilot)
            .name("Test Client")
            .clientType(ClientType.INDIVIDUAL)
            .build();

        job = Job.builder()
            .id(UUID.randomUUID())
            .pilot(pilot)
            .client(client)
            .title("Test Job")
            .status(JobStatus.IN_PROGRESS)
            .jobType(JobType.ROOF_SURVEY)
            .siteAddress("123 Main St")
            .build();
    }

    @Test
    void uploadDocument_disallowedMimeType_throws() {
        MockMultipartFile file = new MockMultipartFile(
            "file", "test.exe", "application/x-msdownload", new byte[]{1, 2, 3}
        );
        DocumentUploadRequest request = new DocumentUploadRequest(
            job.getId(), null, DocumentCategory.OTHER, null, null, false
        );

        assertThatThrownBy(() -> documentService.uploadDocument(file, request, pilot.getId(), "http://localhost:8080"))
            .isInstanceOf(BadRequestException.class)
            .hasMessageContaining("File type not allowed");
    }

    @Test
    void uploadDocument_exceeds50MB_throws() {
        byte[] largeContent = new byte[51 * 1024 * 1024];
        MockMultipartFile file = new MockMultipartFile(
            "file", "big.pdf", "application/pdf", largeContent
        );
        DocumentUploadRequest request = new DocumentUploadRequest(
            job.getId(), null, DocumentCategory.INSPECTION_REPORT, null, null, false
        );

        assertThatThrownBy(() -> documentService.uploadDocument(file, request, pilot.getId(), "http://localhost:8080"))
            .isInstanceOf(BadRequestException.class)
            .hasMessageContaining("50MB");
    }

    @Test
    void deleteDocument_byNonUploaderNonAdmin_throws() {
        User other = new User();
        other.setId(UUID.randomUUID().toString());
        other.setRole(Role.CLIENT);

        Document doc = Document.builder()
            .id(UUID.randomUUID())
            .uploadedBy(pilot)
            .job(job)
            .fileName("photo.jpg")
            .fileType(DocumentType.PHOTO)
            .filePath("./uploads/test/photo.jpg")
            .category(DocumentCategory.AERIAL_PHOTO)
            .isDeliverable(false)
            .build();

        when(documentRepository.findById(doc.getId())).thenReturn(Optional.of(doc));
        when(userRepository.findById(other.getId())).thenReturn(Optional.of(other));

        assertThatThrownBy(() -> documentService.deleteDocument(doc.getId(), other.getId()))
            .isInstanceOf(UnauthorizedException.class);
    }

    @Test
    void markAsDeliverable_setsFlag() {
        Document doc = Document.builder()
            .id(UUID.randomUUID())
            .uploadedBy(pilot)
            .job(job)
            .fileName("photo.jpg")
            .fileType(DocumentType.PHOTO)
            .filePath("./uploads/test/photo.jpg")
            .category(DocumentCategory.AERIAL_PHOTO)
            .isDeliverable(false)
            .build();

        when(documentRepository.findById(doc.getId())).thenReturn(Optional.of(doc));
        when(documentRepository.save(any())).thenReturn(doc);
        when(mapper.toDocumentResponse(any(), any())).thenReturn(mock(DocumentResponse.class));

        documentService.markAsDeliverable(doc.getId(), true, pilot.getId(), "http://localhost:8080");

        assertThat(doc.getIsDeliverable()).isTrue();
    }
}
