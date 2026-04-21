package com.pedaerial.operatorflightcheck.service;

import com.pedaerial.operatorflightcheck.dto.AgreementResponse;
import com.pedaerial.operatorflightcheck.entity.Agreement;
import com.pedaerial.operatorflightcheck.entity.Role;
import com.pedaerial.operatorflightcheck.entity.User;
import com.pedaerial.operatorflightcheck.exception.ResourceNotFoundException;
import com.pedaerial.operatorflightcheck.exception.UnauthorizedException;
import com.pedaerial.operatorflightcheck.repository.AgreementRepository;
import com.pedaerial.operatorflightcheck.repository.JobRepository;
import com.pedaerial.operatorflightcheck.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.PathResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class AgreementService {

    private final AgreementRepository agreementRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final ResponseMapper responseMapper;
    private final PdfGenerationService pdfGenerationService;

    public AgreementResponse get(UUID id, String requesterId) {
        Agreement agreement = agreementRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Agreement not found: " + id));
        checkAccess(agreement, requesterId);
        return responseMapper.toAgreementResponse(agreement);
    }

    public AgreementResponse getByJob(UUID jobId, String requesterId) {
        Agreement agreement = agreementRepository.findByJobId(jobId)
            .orElseThrow(() -> new ResourceNotFoundException("Agreement not found for job: " + jobId));
        checkAccess(agreement, requesterId);
        return responseMapper.toAgreementResponse(agreement);
    }

    @Transactional
    public Resource downloadPdf(UUID id, String requesterId) {
        Agreement agreement = agreementRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Agreement not found: " + id));
        checkAccess(agreement, requesterId);

        // Generate PDF if it doesn't exist yet
        if (agreement.getPdfPath() == null || agreement.getPdfPath().isBlank()) {
            Path pdfPath = pdfGenerationService.generateAgreementPdf(agreement);
            agreement.setPdfPath(pdfPath.toString());
            agreementRepository.save(agreement);
            return new PathResource(pdfPath);
        }

        Path pdfPath = Paths.get(agreement.getPdfPath());
        return new PathResource(pdfPath);
    }

    private void checkAccess(Agreement agreement, String requesterId) {
        User requester = userRepository.findById(requesterId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + requesterId));

        if (requester.getRole() == Role.ADMIN) return;
        if (requester.getRole() == Role.PILOT) return;

        // Client/Company: check if their email matches the job's client
        if (agreement.getJob() != null && agreement.getJob().getClient() != null) {
            String clientEmail = agreement.getJob().getClient().getEmail();
            if (clientEmail != null && clientEmail.equalsIgnoreCase(requester.getEmail())) {
                return;
            }
        }

        throw new UnauthorizedException("Access denied.");
    }
}
