package com.pedaerial.operatorflightcheck.config;

import com.pedaerial.operatorflightcheck.entity.*;
import com.pedaerial.operatorflightcheck.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Configuration
@Profile("demo")
public class DemoDataConfig {

    @Bean
    CommandLineRunner seedDemoData(
        UserRepository userRepository,
        ClientRepository clientRepository,
        DroneProfileRepository droneProfileRepository,
        JobRepository jobRepository,
        InsuranceDetailsRepository insuranceDetailsRepository,
        MissionRepository missionRepository,
        InspectionReportRepository reportRepository,
        InvoiceRepository invoiceRepository,
        PaymentRepository paymentRepository,
        DocumentRepository documentRepository,
        PasswordEncoder passwordEncoder
    ) {
        return args -> {
            User pilot = upsertUser(
                userRepository,
                passwordEncoder,
                "pilot@pedaerial.com",
                "Password123",
                Role.PILOT,
                "Marcus",
                "Reed",
                "Reed Aerial Solutions",
                "LIC-OH-2197"
            );
            User clientUser = upsertUser(
                userRepository,
                passwordEncoder,
                "client@pedaerial.com",
                "Password123",
                Role.CLIENT,
                "Sarah",
                "Johnson",
                "Johnson Real Estate Group",
                null
            );
            User insuranceUser = upsertUser(
                userRepository,
                passwordEncoder,
                "insurance@pedaerial.com",
                "Password123",
                Role.COMPANY,
                "David",
                "Carter",
                "Apex Claims & Adjusting",
                null
            );

            if (!invoiceRepository.findByPilotIdOrderByCreatedAtDesc(pilot.getId()).isEmpty()) {
                return;
            }

            DroneProfile mavic = droneProfileRepository.save(
                DroneProfile.builder()
                    .pilot(pilot)
                    .name("DJI Mavic 3 Pro")
                    .manufacturer("DJI")
                    .model("Mavic 3 Pro")
                    .serialNumber("MARCUS-M3P-001")
                    .faaRegistration("FAA-MARCUS-3001")
                    .weightGrams(958)
                    .maxWindMph(28)
                    .maxGustMph(34)
                    .notes("Primary camera platform for premium photo and mapping work.")
                    .active(true)
                    .build()
            );
            DroneProfile air2s = droneProfileRepository.save(
                DroneProfile.builder()
                    .pilot(pilot)
                    .name("DJI Air 2S")
                    .manufacturer("DJI")
                    .model("Air 2S")
                    .serialNumber("MARCUS-A2S-002")
                    .faaRegistration("FAA-MARCUS-2002")
                    .weightGrams(595)
                    .maxWindMph(23)
                    .maxGustMph(29)
                    .notes("Lightweight aircraft for quick property flights and urban jobs.")
                    .active(true)
                    .build()
            );

            Client sarahClient = clientRepository.save(
                Client.builder()
                    .pilot(pilot)
                    .name("Sarah Johnson")
                    .email(clientUser.getEmail())
                    .phone("614-555-0110")
                    .company("Johnson Real Estate Group")
                    .clientType(ClientType.BUSINESS)
                    .address("Columbus, OH")
                    .notes("Primary real estate client for listing media and development updates.")
                    .build()
            );
            Client roofClient = clientRepository.save(
                Client.builder()
                    .pilot(pilot)
                    .name("Olivia Bennett")
                    .email("olivia.bennett@example.com")
                    .phone("614-555-0132")
                    .company("Bennett Property Holdings")
                    .clientType(ClientType.INDIVIDUAL)
                    .address("Dublin, OH")
                    .notes("Residential roof inspection customer.")
                    .build()
            );
            Client insuranceClient = clientRepository.save(
                Client.builder()
                    .pilot(pilot)
                    .name("David Carter")
                    .email(insuranceUser.getEmail())
                    .phone("800-555-0198")
                    .company("Apex Claims & Adjusting")
                    .clientType(ClientType.COMPANY)
                    .address("Ohio Region")
                    .notes("Regional insurance partner for storm and flood claims.")
                    .build()
            );

            Job realEstateJob = jobRepository.save(
                Job.builder()
                    .pilot(pilot)
                    .client(sarahClient)
                    .title("Real Estate Shoot - Broad Street Listing")
                    .description("Luxury listing media package for a downtown Columbus property.")
                    .jobType(JobType.REAL_ESTATE)
                    .status(JobStatus.DELIVERED)
                    .priority(JobPriority.NORMAL)
                    .siteAddress("1280 E Broad St, Columbus, OH 43205")
                    .siteLat(new BigDecimal("39.965260"))
                    .siteLon(new BigDecimal("-82.965744"))
                    .scheduledDate(LocalDate.now().minusDays(12))
                    .scheduledTime(LocalTime.of(9, 30))
                    .estimatedDuration(120)
                    .actualDuration(95)
                    .notes("Final gallery and short teaser video delivered to client.")
                    .build()
            );
            Job roofInspectionJob = jobRepository.save(
                Job.builder()
                    .pilot(pilot)
                    .client(roofClient)
                    .title("Roof Inspection - Bennett Residence")
                    .description("Progressive roof inspection after a spring wind event.")
                    .jobType(JobType.ROOF_SURVEY)
                    .status(JobStatus.IN_PROGRESS)
                    .priority(JobPriority.HIGH)
                    .siteAddress("6120 Ballantrae Place, Dublin, OH 43016")
                    .siteLat(new BigDecimal("40.113450"))
                    .siteLon(new BigDecimal("-83.156920"))
                    .scheduledDate(LocalDate.now())
                    .scheduledTime(LocalTime.of(14, 0))
                    .estimatedDuration(90)
                    .notes("Awaiting follow-up thermal pass and shingle closeups.")
                    .build()
            );
            Job constructionJob = jobRepository.save(
                Job.builder()
                    .pilot(pilot)
                    .client(sarahClient)
                    .title("Construction Site Mapping - Franklinton Lofts")
                    .description("Orthomosaic capture and progress mapping for investor updates.")
                    .jobType(JobType.MAPPING)
                    .status(JobStatus.SCHEDULED)
                    .priority(JobPriority.NORMAL)
                    .siteAddress("90 McDowell St, Columbus, OH 43215")
                    .siteLat(new BigDecimal("39.958860"))
                    .siteLon(new BigDecimal("-83.021570"))
                    .scheduledDate(LocalDate.now().plusDays(4))
                    .scheduledTime(LocalTime.of(8, 0))
                    .estimatedDuration(150)
                    .notes("Pending airspace confirmation before launch.")
                    .build()
            );
            Job stormClaimJob = jobRepository.save(
                Job.builder()
                    .pilot(pilot)
                    .client(insuranceClient)
                    .title("Storm Damage Roof Inspection - Hilliard Claim")
                    .description("Carrier-requested roof and exterior storm damage inspection.")
                    .jobType(JobType.INSURANCE_INSPECTION)
                    .status(JobStatus.IN_PROGRESS)
                    .priority(JobPriority.URGENT)
                    .siteAddress("4110 Main St, Hilliard, OH 43026")
                    .siteLat(new BigDecimal("40.033957"))
                    .siteLon(new BigDecimal("-83.158249"))
                    .scheduledDate(LocalDate.now().plusDays(1))
                    .scheduledTime(LocalTime.of(10, 15))
                    .estimatedDuration(105)
                    .notes("Open claim awaiting report submission.")
                    .build()
            );
            Job floodClaimJob = jobRepository.save(
                Job.builder()
                    .pilot(pilot)
                    .client(insuranceClient)
                    .title("Flood Property Assessment - Newark Claim")
                    .description("Completed flood documentation package for regional adjuster review.")
                    .jobType(JobType.INSURANCE_INSPECTION)
                    .status(JobStatus.DELIVERED)
                    .priority(JobPriority.HIGH)
                    .siteAddress("85 Walnut St, Newark, OH 43055")
                    .siteLat(new BigDecimal("40.058120"))
                    .siteLon(new BigDecimal("-82.403670"))
                    .scheduledDate(LocalDate.now().minusDays(6))
                    .scheduledTime(LocalTime.of(11, 0))
                    .estimatedDuration(135)
                    .actualDuration(122)
                    .notes("Closed claim package delivered with PDF report and imagery.")
                    .build()
            );

            insuranceDetailsRepository.save(
                InsuranceDetails.builder()
                    .job(stormClaimJob)
                    .claimNumber("APX-CLM-24081")
                    .policyNumber("APX-POL-11824")
                    .insuranceCompany("Apex Claims & Adjusting")
                    .adjusterName("David Carter")
                    .adjusterEmail(insuranceUser.getEmail())
                    .adjusterPhone("800-555-0198")
                    .lossDate(LocalDate.now().minusDays(3))
                    .lossType(LossType.STORM)
                    .propertyType(PropertyType.RESIDENTIAL)
                    .inspectionScope("Roof, gutters, siding, detached garage, and west elevation storm exposure.")
                    .build()
            );
            insuranceDetailsRepository.save(
                InsuranceDetails.builder()
                    .job(floodClaimJob)
                    .claimNumber("APX-CLM-24042")
                    .policyNumber("APX-POL-10512")
                    .insuranceCompany("Apex Claims & Adjusting")
                    .adjusterName("David Carter")
                    .adjusterEmail(insuranceUser.getEmail())
                    .adjusterPhone("800-555-0198")
                    .lossDate(LocalDate.now().minusDays(10))
                    .lossType(LossType.WATER)
                    .propertyType(PropertyType.COMMERCIAL)
                    .inspectionScope("Exterior flood line verification, roof overview, and drainage assessment.")
                    .build()
            );

            Mission realEstateMission = missionRepository.save(
                Mission.builder()
                    .job(realEstateJob)
                    .pilot(pilot)
                    .droneProfile(mavic)
                    .flightDate(LocalDate.now().minusDays(12))
                    .flightTime(LocalTime.of(9, 45))
                    .durationMinutes(95)
                    .weatherTempF(72.0)
                    .weatherWindMph(8.0)
                    .weatherGustMph(12.0)
                    .weatherConditions("Clear")
                    .weatherVisibility("10 miles")
                    .flyScore(94)
                    .status(MissionStatus.COMPLETED)
                    .notes("Completed listing media flight with sunrise exterior sequence.")
                    .build()
            );
            Mission roofMission = missionRepository.save(
                Mission.builder()
                    .job(roofInspectionJob)
                    .pilot(pilot)
                    .droneProfile(air2s)
                    .flightDate(LocalDate.now())
                    .flightTime(LocalTime.of(14, 15))
                    .durationMinutes(48)
                    .weatherTempF(64.0)
                    .weatherWindMph(11.0)
                    .weatherGustMph(18.0)
                    .weatherConditions("Partly Cloudy")
                    .weatherVisibility("8 miles")
                    .flyScore(78)
                    .status(MissionStatus.IN_PROGRESS)
                    .notes("Initial roof sweep completed, secondary capture still pending.")
                    .build()
            );
            Mission constructionMission = missionRepository.save(
                Mission.builder()
                    .job(constructionJob)
                    .pilot(pilot)
                    .droneProfile(mavic)
                    .flightDate(LocalDate.now().plusDays(4))
                    .flightTime(LocalTime.of(8, 0))
                    .durationMinutes(120)
                    .weatherConditions("Forecast pending")
                    .status(MissionStatus.PENDING)
                    .notes("Pending launch authorization and site superintendent confirmation.")
                    .build()
            );
            Mission stormMission = missionRepository.save(
                Mission.builder()
                    .job(stormClaimJob)
                    .pilot(pilot)
                    .droneProfile(air2s)
                    .flightDate(LocalDate.now().plusDays(1))
                    .flightTime(LocalTime.of(10, 30))
                    .durationMinutes(85)
                    .weatherConditions("Overcast")
                    .weatherWindMph(10.0)
                    .weatherGustMph(16.0)
                    .flyScore(81)
                    .status(MissionStatus.IN_PROGRESS)
                    .notes("Claim documentation underway for open storm damage review.")
                    .build()
            );
            Mission floodMission = missionRepository.save(
                Mission.builder()
                    .job(floodClaimJob)
                    .pilot(pilot)
                    .droneProfile(mavic)
                    .flightDate(LocalDate.now().minusDays(6))
                    .flightTime(LocalTime.of(11, 10))
                    .durationMinutes(122)
                    .weatherTempF(61.0)
                    .weatherWindMph(9.0)
                    .weatherGustMph(13.0)
                    .weatherConditions("Cloudy")
                    .weatherVisibility("9 miles")
                    .flyScore(89)
                    .status(MissionStatus.COMPLETED)
                    .notes("Flood assessment flight completed and delivered.")
                    .build()
            );

            InspectionReport stormReport = reportRepository.save(
                InspectionReport.builder()
                    .job(stormClaimJob)
                    .pilot(pilot)
                    .reportDate(LocalDate.now())
                    .propertyCondition(PropertyCondition.FAIR)
                    .damageFound(true)
                    .damageSummary("Wind uplift and ridge cap loss visible across south slope.")
                    .roofCondition(ConditionRating.MODERATE)
                    .exteriorCondition(ConditionRating.MINOR)
                    .additionalFindings("Detached downspout noted on rear elevation.")
                    .recommendations("Recommend carrier review for partial roof replacement and gutter repair.")
                    .pilotSignature("Marcus Reed")
                    .status(ReportStatus.SUBMITTED)
                    .build()
            );
            InspectionReport floodReport = reportRepository.save(
                InspectionReport.builder()
                    .job(floodClaimJob)
                    .pilot(pilot)
                    .reportDate(LocalDate.now().minusDays(4))
                    .propertyCondition(PropertyCondition.POOR)
                    .damageFound(true)
                    .damageSummary("Flood line verified on north and east walls with HVAC platform compromise.")
                    .roofCondition(ConditionRating.NO_DAMAGE)
                    .exteriorCondition(ConditionRating.SEVERE)
                    .additionalFindings("Debris accumulation and water intrusion at loading bay.")
                    .recommendations("Approve remediation scope and structural follow-up.")
                    .pilotSignature("Marcus Reed")
                    .status(ReportStatus.APPROVED)
                    .reviewerNotes("Approved for final carrier package.")
                    .reviewedBy(insuranceUser)
                    .reviewedAt(java.time.Instant.now().minusSeconds(86400))
                    .build()
            );

            Invoice realEstateInvoice = buildInvoice(
                pilot,
                sarahClient,
                realEstateJob,
                invoiceNumberFor(1),
                new BigDecimal("350.00"),
                InvoiceStatus.PAID,
                LocalDate.now().minusDays(10),
                LocalDate.now().minusDays(2),
                "Listing media package for Broad Street property.",
                List.of(
                    lineItem("Aerial listing photography", BigDecimal.ONE, new BigDecimal("250.00"), 0),
                    lineItem("Edited marketing video clip", BigDecimal.ONE, new BigDecimal("100.00"), 1)
                )
            );
            Invoice constructionInvoice = buildInvoice(
                pilot,
                sarahClient,
                constructionJob,
                invoiceNumberFor(2),
                new BigDecimal("1200.00"),
                InvoiceStatus.SENT,
                LocalDate.now().minusDays(1),
                LocalDate.now().plusDays(14),
                "Monthly progress mapping subscription and deliverables.",
                List.of(
                    lineItem("Orthomosaic capture and export", BigDecimal.ONE, new BigDecimal("700.00"), 0),
                    lineItem("Stakeholder progress visuals", BigDecimal.ONE, new BigDecimal("500.00"), 1)
                )
            );
            invoiceRepository.saveAll(List.of(realEstateInvoice, constructionInvoice));

            paymentRepository.saveAll(List.of(
                Payment.builder()
                    .invoice(realEstateInvoice)
                    .amount(new BigDecimal("350.00"))
                    .paymentDate(LocalDate.now().minusDays(2))
                    .method(PaymentMethod.BANK_TRANSFER)
                    .referenceNote("Completed payment from Johnson Real Estate Group.")
                    .build(),
                Payment.builder()
                    .invoice(constructionInvoice)
                    .amount(new BigDecimal("1200.00"))
                    .paymentDate(LocalDate.now().plusDays(7))
                    .method(PaymentMethod.ACH)
                    .referenceNote("Pending ACH payment scheduled by client.")
                    .build()
            ));

            seedDocument(documentRepository, realEstateJob, realEstateMission, pilot,
                "broad-street-gallery.zip", "application/octet-stream",
                "Bundled image delivery placeholder for client download.",
                DocumentType.OTHER, DocumentCategory.CLIENT_DOCUMENT, true, "deliverables");
            seedDocument(documentRepository, realEstateJob, realEstateMission, pilot,
                "broad-street-teaser.mp4", "video/mp4",
                "Marketing teaser placeholder video.",
                DocumentType.VIDEO, DocumentCategory.AERIAL_VIDEO, true, "deliverables");
            seedDocument(documentRepository, constructionJob, constructionMission, pilot,
                "franklinton-progress-map.pdf", "application/pdf",
                "Construction mapping export placeholder.",
                DocumentType.PDF, DocumentCategory.ORTHOMOSAIC, true, "deliverables");
            seedDocument(documentRepository, stormClaimJob, stormMission, pilot,
                "storm-damage-roof-report.pdf", "application/pdf",
                "Submitted roof inspection report placeholder.",
                DocumentType.PDF, DocumentCategory.INSPECTION_REPORT, true, "insurance");
            seedDocument(documentRepository, floodClaimJob, floodMission, pilot,
                "flood-property-assessment.pdf", "application/pdf",
                "Approved flood assessment report placeholder.",
                DocumentType.PDF, DocumentCategory.INSPECTION_REPORT, true, "insurance");
        };
    }

    private User upsertUser(
        UserRepository userRepository,
        PasswordEncoder passwordEncoder,
        String email,
        String password,
        Role role,
        String firstName,
        String lastName,
        String company,
        String licenseNumber
    ) {
        User user = userRepository.findByEmail(email).orElseGet(User::new);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setRole(role);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setCompany(company);
        user.setLicenseNumber(licenseNumber);
        return userRepository.save(user);
    }

    private Invoice buildInvoice(
        User pilot,
        Client client,
        Job job,
        String invoiceNumber,
        BigDecimal totalAmount,
        InvoiceStatus status,
        LocalDate createdDate,
        LocalDate paidOrDueDate,
        String notes,
        List<LineItem> templateItems
    ) {
        Invoice invoice = Invoice.builder()
            .job(job)
            .pilot(pilot)
            .invoiceNumber(invoiceNumber)
            .client(client)
            .amount(totalAmount)
            .taxAmount(BigDecimal.ZERO)
            .totalAmount(totalAmount)
            .status(status)
            .dueDate(status == InvoiceStatus.PAID ? createdDate.plusDays(10) : paidOrDueDate)
            .paidDate(status == InvoiceStatus.PAID ? paidOrDueDate : null)
            .notes(notes)
            .lineItems(new ArrayList<>())
            .build();

        for (LineItem item : templateItems) {
            item.setInvoice(invoice);
            invoice.getLineItems().add(item);
        }
        return invoice;
    }

    private LineItem lineItem(String description, BigDecimal quantity, BigDecimal unitPrice, int sortOrder) {
        return LineItem.builder()
            .description(description)
            .quantity(quantity)
            .unitPrice(unitPrice)
            .amount(quantity.multiply(unitPrice))
            .sortOrder(sortOrder)
            .build();
    }

    private String invoiceNumberFor(int sequence) {
        return "PED-" + LocalDate.now().getYear() + "-" + String.format("%04d", 1000 + sequence);
    }

    private void seedDocument(
        DocumentRepository documentRepository,
        Job job,
        Mission mission,
        User uploadedBy,
        String fileName,
        String mimeType,
        String description,
        DocumentType fileType,
        DocumentCategory category,
        boolean isDeliverable,
        String folder
    ) throws Exception {
        Path dir = Paths.get(FileUploadConfig.UPLOAD_DIR, "demo", folder, job.getId().toString());
        Files.createDirectories(dir);
        Path file = dir.resolve(fileName);
        if (!Files.exists(file)) {
            Files.writeString(
                file,
                "Demo placeholder for " + fileName + System.lineSeparator() + description,
                StandardCharsets.UTF_8
            );
        }

        documentRepository.save(
            Document.builder()
                .job(job)
                .mission(mission)
                .uploadedBy(uploadedBy)
                .fileName(fileName)
                .fileType(fileType)
                .filePath(file.toString())
                .fileSizeBytes(Files.size(file))
                .mimeType(mimeType)
                .description(description)
                .tags("demo,placeholder")
                .category(category)
                .isDeliverable(isDeliverable)
                .build()
        );
    }
}
