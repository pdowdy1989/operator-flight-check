package com.pedaerial.operatorflightcheck.service;

import com.pedaerial.operatorflightcheck.dto.JobRequestDecisionRequest;
import com.pedaerial.operatorflightcheck.dto.JobRequestResponse;
import com.pedaerial.operatorflightcheck.dto.JobRequestSubmitRequest;
import com.pedaerial.operatorflightcheck.entity.*;
import com.pedaerial.operatorflightcheck.exception.BadRequestException;
import com.pedaerial.operatorflightcheck.exception.ResourceNotFoundException;
import com.pedaerial.operatorflightcheck.exception.UnauthorizedException;
import com.pedaerial.operatorflightcheck.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class JobRequestService {

    private final JobRequestRepository jobRequestRepository;
    private final JobRequestLineItemRepository jobRequestLineItemRepository;
    private final PilotServiceRepository pilotServiceRepository;
    private final UserRepository userRepository;
    private final ClientRepository clientRepository;
    private final JobRepository jobRepository;
    private final InvoiceRepository invoiceRepository;
    private final LineItemRepository lineItemRepository;
    private final AgreementRepository agreementRepository;
    private final PdfGenerationService pdfGenerationService;
    private final ResponseMapper responseMapper;

    public JobRequestResponse submit(JobRequestSubmitRequest req, String requesterId) {
        User requester = userRepository.findById(requesterId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + requesterId));

        if (requester.getRole() == Role.PILOT || requester.getRole() == Role.ADMIN) {
            throw new BadRequestException("Pilots and admins cannot submit job requests.");
        }

        // Compute totals
        BigDecimal rateCardTotal = BigDecimal.ZERO;
        int totalQuantity = 0;

        List<PilotService> loadedServices = new ArrayList<>();
        for (var li : req.getLineItems()) {
            PilotService ps = pilotServiceRepository.findById(li.getPilotServiceId())
                .orElseThrow(() -> new BadRequestException("Service not found: " + li.getPilotServiceId()));
            if (!ps.getActive()) {
                throw new BadRequestException("Service is not active: " + ps.getDisplayName());
            }
            loadedServices.add(ps);
            totalQuantity += li.getQuantity();
            rateCardTotal = rateCardTotal.add(ps.getEffectiveUnitPrice().multiply(BigDecimal.valueOf(li.getQuantity())));
        }

        // Discount tiers by total quantity
        BigDecimal discountPercent;
        if (totalQuantity <= 1) {
            discountPercent = BigDecimal.ZERO;
        } else if (totalQuantity == 2) {
            discountPercent = new BigDecimal("5.00");
        } else if (totalQuantity == 3) {
            discountPercent = new BigDecimal("10.00");
        } else {
            discountPercent = new BigDecimal("15.00");
        }

        BigDecimal discountAmount = rateCardTotal.multiply(discountPercent)
            .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal finalAmount = rateCardTotal.subtract(discountAmount);

        // Budget override validation (only if total quantity >= 5)
        if (req.getProposedBudget() != null && totalQuantity >= 5) {
            BigDecimal diff = req.getProposedBudget().subtract(finalAmount).abs();
            BigDecimal ratio = diff.divide(finalAmount, 4, RoundingMode.HALF_UP);
            if (ratio.compareTo(new BigDecimal("0.25")) > 0) {
                throw new IllegalArgumentException(
                    "Proposed budget is more than 25% away from the calculated amount.");
            }
        }

        // Build the JobRequest
        JobRequest jobRequest = JobRequest.builder()
            .requester(requester)
            .status(JobRequestStatus.PENDING)
            .siteAddress(req.getSiteAddress())
            .siteLat(req.getSiteLat())
            .siteLon(req.getSiteLon())
            .requestedDate(req.getRequestedDate())
            .requestedTime(req.getRequestedTime())
            .isRecurring(req.getIsRecurring() != null ? req.getIsRecurring() : false)
            .recurrencePattern(req.getRecurrencePattern())
            .notes(req.getNotes())
            .rateCardTotal(rateCardTotal)
            .discountPercent(discountPercent)
            .finalAmount(finalAmount)
            .proposedBudget(req.getProposedBudget())
            .claimNumber(req.getClaimNumber())
            .policyNumber(req.getPolicyNumber())
            .insuranceCompanyName(req.getInsuranceCompanyName())
            .adjusterName(req.getAdjusterName())
            .adjusterEmail(req.getAdjusterEmail())
            .adjusterPhone(req.getAdjusterPhone())
            .lossDate(req.getLossDate())
            .lossType(req.getLossType())
            .propertyType(req.getPropertyType())
            .inspectionScope(req.getInspectionScope())
            .lineItems(new ArrayList<>())
            .build();

        JobRequest savedRequest = jobRequestRepository.save(jobRequest);

        // Build line items
        for (int i = 0; i < req.getLineItems().size(); i++) {
            var li = req.getLineItems().get(i);
            PilotService ps = loadedServices.get(i);
            BigDecimal unitPrice = ps.getEffectiveUnitPrice();
            BigDecimal amount = unitPrice.multiply(BigDecimal.valueOf(li.getQuantity()));
            JobRequestLineItem lineItem = JobRequestLineItem.builder()
                .jobRequest(savedRequest)
                .pilotService(ps)
                .serviceNameSnapshot(ps.getDisplayName())
                .unitPriceSnapshot(unitPrice)
                .pricingTypeSnapshot(ps.getPricingType().name())
                .quantity(li.getQuantity())
                .amount(amount)
                .sortOrder(i)
                .build();
            savedRequest.getLineItems().add(lineItem);
        }

        return responseMapper.toJobRequestResponse(jobRequestRepository.save(savedRequest));
    }

    public JobRequestResponse decide(UUID id, JobRequestDecisionRequest decision, String pilotId) {
        JobRequest jr = jobRequestRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Job request not found: " + id));

        if (jr.getStatus() != JobRequestStatus.PENDING) {
            throw new BadRequestException("Job request is no longer pending.");
        }

        User pilot = userRepository.findById(pilotId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + pilotId));

        jr.setReviewedByPilot(pilot);
        jr.setDecisionNotes(decision.getDecisionNotes());
        jr.setDecidedAt(Instant.now());

        if ("REJECT".equalsIgnoreCase(decision.getDecision())) {
            jr.setStatus(JobRequestStatus.REJECTED);
            return responseMapper.toJobRequestResponse(jobRequestRepository.save(jr));
        } else if ("ACCEPT".equalsIgnoreCase(decision.getDecision())) {
            return acceptRequest(jr, pilot);
        } else {
            throw new BadRequestException("Decision must be ACCEPT or REJECT.");
        }
    }

    private JobRequestResponse acceptRequest(JobRequest jr, User pilot) {
        User requester = jr.getRequester();

        // Upsert Client for requester
        Client client = clientRepository.findByEmailIgnoreCase(requester.getEmail())
            .orElseGet(() -> {
                Client newClient = Client.builder()
                    .pilot(pilot)
                    .name((requester.getFirstName() != null ? requester.getFirstName() : "") +
                        (requester.getLastName() != null ? " " + requester.getLastName() : "").trim())
                    .email(requester.getEmail())
                    .phone(requester.getPhone())
                    .company(requester.getCompany())
                    .clientType(ClientType.INDIVIDUAL)
                    .build();
                return clientRepository.save(newClient);
            });

        // Determine job type from first line item
        JobType jobType = jr.getLineItems().isEmpty() ? JobType.OTHER
            : jr.getLineItems().get(0).getPilotService().getJobType();

        // Create Job
        Job job = Job.builder()
            .pilot(pilot)
            .client(client)
            .title(jr.getSiteAddress())
            .jobType(jobType)
            .status(JobStatus.ACCEPTED)
            .siteAddress(jr.getSiteAddress())
            .siteLat(jr.getSiteLat())
            .siteLon(jr.getSiteLon())
            .scheduledDate(jr.getRequestedDate())
            .scheduledTime(jr.getRequestedTime())
            .notes(jr.getNotes())
            .claimNumber(jr.getClaimNumber())
            .policyNumber(jr.getPolicyNumber())
            .insuranceCompanyName(jr.getInsuranceCompanyName())
            .adjusterName(jr.getAdjusterName())
            .adjusterEmail(jr.getAdjusterEmail())
            .adjusterPhone(jr.getAdjusterPhone())
            .lossDate(jr.getLossDate())
            .lossType(jr.getLossType())
            .propertyType(jr.getPropertyType())
            .inspectionScope(jr.getInspectionScope())
            .build();
        Job savedJob = jobRepository.save(job);

        // Determine due date based on requester payment terms
        PaymentTerms terms = requester.getPaymentTerms();
        LocalDate dueDate;
        if (terms == PaymentTerms.PREPAY) {
            dueDate = LocalDate.now();
        } else if (terms == PaymentTerms.NET_60) {
            dueDate = LocalDate.now().plusDays(60);
        } else {
            dueDate = LocalDate.now().plusDays(30);
        }

        // Generate invoice number
        String invoiceNumber = generateInvoiceNumber();

        // Create Invoice
        Invoice invoice = Invoice.builder()
            .job(savedJob)
            .pilot(pilot)
            .invoiceNumber(invoiceNumber)
            .client(client)
            .taxAmount(BigDecimal.ZERO)
            .amount(jr.getFinalAmount())
            .totalAmount(jr.getFinalAmount())
            .status(InvoiceStatus.DRAFT)
            .dueDate(dueDate)
            .lineItems(new ArrayList<>())
            .build();
        Invoice savedInvoice = invoiceRepository.save(invoice);

        // Create LineItems from JobRequestLineItems
        int sortOrder = 0;
        for (var jrli : jr.getLineItems()) {
            LineItem li = LineItem.builder()
                .invoice(savedInvoice)
                .description(jrli.getServiceNameSnapshot())
                .quantity(BigDecimal.valueOf(jrli.getQuantity()))
                .unitPrice(jrli.getUnitPriceSnapshot())
                .amount(jrli.getAmount())
                .sortOrder(sortOrder++)
                .build();
            savedInvoice.getLineItems().add(li);
        }
        invoiceRepository.save(savedInvoice);

        // Generate agreement number
        String agreementNumber = generateAgreementNumber();

        // Create Agreement
        Agreement agreement = Agreement.builder()
            .job(savedJob)
            .agreementNumber(agreementNumber)
            .status(AgreementStatus.PENDING_SIGNATURE)
            .build();
        Agreement savedAgreement = agreementRepository.save(agreement);

        // Generate PDFs
        try {
            pdfGenerationService.generateInvoicePdf(savedInvoice);
        } catch (Exception e) {
            // PDF generation failure should not block acceptance
        }
        try {
            java.nio.file.Path agreementPdfPath = pdfGenerationService.generateAgreementPdf(savedAgreement);
            savedAgreement.setPdfPath(agreementPdfPath.toString());
            agreementRepository.save(savedAgreement);
        } catch (Exception e) {
            // PDF generation failure should not block acceptance
        }

        // Update JobRequest
        jr.setStatus(JobRequestStatus.ACCEPTED);
        jr.setCreatedJob(savedJob);

        return responseMapper.toJobRequestResponse(jobRequestRepository.save(jr));
    }

    @Transactional(readOnly = true)
    public List<JobRequestResponse> listPendingForPilot() {
        return jobRequestRepository.findByStatusOrderByCreatedAtDesc(JobRequestStatus.PENDING)
            .stream().map(responseMapper::toJobRequestResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<JobRequestResponse> listAllForPilot() {
        return jobRequestRepository.findAll().stream()
            .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
            .map(responseMapper::toJobRequestResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<JobRequestResponse> listForRequester(String requesterId) {
        return jobRequestRepository.findByRequesterIdOrderByCreatedAtDesc(requesterId)
            .stream().map(responseMapper::toJobRequestResponse).toList();
    }

    @Transactional(readOnly = true)
    public JobRequestResponse get(UUID id, String requesterId) {
        JobRequest jr = jobRequestRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Job request not found: " + id));
        User requester = userRepository.findById(requesterId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + requesterId));
        if (requester.getRole() == Role.CLIENT || requester.getRole() == Role.COMPANY) {
            if (!jr.getRequester().getId().equals(requesterId)) {
                throw new UnauthorizedException("Access denied.");
            }
        }
        return responseMapper.toJobRequestResponse(jr);
    }

    public JobRequestResponse cancel(UUID id, String requesterId) {
        JobRequest jr = jobRequestRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Job request not found: " + id));
        if (!jr.getRequester().getId().equals(requesterId)) {
            throw new UnauthorizedException("Access denied.");
        }
        if (jr.getStatus() != JobRequestStatus.PENDING) {
            throw new BadRequestException("Only pending requests can be cancelled.");
        }
        jr.setStatus(JobRequestStatus.CANCELLED);
        return responseMapper.toJobRequestResponse(jobRequestRepository.save(jr));
    }

    private String generateInvoiceNumber() {
        int year = LocalDate.now().getYear();
        String prefix = "PED-" + year + "-";
        int maxNum = invoiceRepository.findMaxInvoiceNumberForPrefix(prefix);
        return prefix + String.format("%04d", maxNum + 1);
    }

    private String generateAgreementNumber() {
        int year = LocalDate.now().getYear();
        String prefix = "AGR-" + year + "-";
        int maxNum = agreementRepository.findMaxAgreementNumberForPrefix(prefix);
        return prefix + String.format("%04d", maxNum + 1);
    }
}
