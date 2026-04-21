package com.pedaerial.operatorflightcheck.service;

import com.pedaerial.operatorflightcheck.dto.*;
import com.pedaerial.operatorflightcheck.entity.*;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ResponseMapper {

    public ClientResponse toClientResponse(Client client) {
        return new ClientResponse(
            client.getId(),
            client.getPilot().getId(),
            client.getName(),
            client.getEmail(),
            client.getPhone(),
            client.getCompany(),
            client.getClientType(),
            client.getAddress(),
            client.getNotes(),
            client.getCreatedAt()
        );
    }

    public DroneProfileResponse toDroneProfileResponse(DroneProfile drone) {
        return new DroneProfileResponse(
            drone.getId(),
            drone.getPilot().getId(),
            drone.getName(),
            drone.getManufacturer(),
            drone.getModel(),
            drone.getSerialNumber(),
            drone.getFaaRegistration(),
            drone.getWeightGrams(),
            drone.getMaxWindMph(),
            drone.getMaxGustMph(),
            drone.getNotes(),
            drone.getActive(),
            drone.getCreatedAt()
        );
    }

    public JobResponse toJobResponse(Job job, long documentCount) {
        String pilotId = job.getPilot() != null ? job.getPilot().getId() : null;
        String pilotName = job.getPilot() != null
            ? fullName(job.getPilot().getFirstName(), job.getPilot().getLastName())
            : null;
        return new JobResponse(
            job.getId(),
            pilotId,
            pilotName,
            job.getClient().getId(),
            job.getClient().getName(),
            job.getClient().getClientType().name(),
            job.getTitle(),
            job.getDescription(),
            job.getJobType(),
            job.getStatus(),
            job.getPriority(),
            job.getSiteAddress(),
            job.getSiteLat(),
            job.getSiteLon(),
            job.getScheduledDate(),
            job.getScheduledTime(),
            job.getEstimatedDuration(),
            job.getActualDuration(),
            job.getNotes(),
            documentCount,
            job.getClaimNumber(),
            job.getPolicyNumber(),
            job.getInsuranceCompanyName(),
            job.getAdjusterName(),
            job.getAdjusterEmail(),
            job.getAdjusterPhone(),
            job.getLossDate(),
            job.getLossType(),
            job.getPropertyType(),
            job.getInspectionScope(),
            job.getCreatedAt(),
            job.getUpdatedAt()
        );
    }

    public MissionResponse toMissionResponse(Mission mission) {
        String droneName = mission.getDroneProfile() != null ? mission.getDroneProfile().getName() : null;
        UUID droneId = mission.getDroneProfile() != null ? mission.getDroneProfile().getId() : null;
        return new MissionResponse(
            mission.getId(),
            mission.getJob().getId(),
            mission.getJob().getTitle(),
            mission.getPilot().getId(),
            droneId,
            droneName,
            mission.getFlightDate(),
            mission.getFlightTime(),
            mission.getDurationMinutes(),
            mission.getWeatherTempF(),
            mission.getWeatherWindMph(),
            mission.getWeatherGustMph(),
            mission.getWeatherConditions(),
            mission.getWeatherVisibility(),
            mission.getFlyScore(),
            mission.getStatus(),
            mission.getNotes(),
            mission.getCreatedAt()
        );
    }

    public DocumentResponse toDocumentResponse(Document doc, String baseUrl) {
        String uploaderName = fullName(doc.getUploadedBy().getFirstName(), doc.getUploadedBy().getLastName());
        UUID missionId = doc.getMission() != null ? doc.getMission().getId() : null;
        String downloadUrl = baseUrl + "/api/documents/" + doc.getId() + "/download";
        return new DocumentResponse(
            doc.getId(),
            doc.getJob().getId(),
            missionId,
            doc.getUploadedBy().getId(),
            uploaderName,
            doc.getFileName(),
            doc.getFileType(),
            doc.getFilePath(),
            doc.getFileSizeBytes(),
            doc.getThumbnailPath(),
            doc.getMimeType(),
            doc.getDescription(),
            doc.getTags(),
            doc.getCategory(),
            doc.getIsDeliverable(),
            downloadUrl,
            doc.getCreatedAt()
        );
    }

    public InspectionReportResponse toInspectionReportResponse(InspectionReport report) {
        String reviewedById = report.getReviewedBy() != null ? report.getReviewedBy().getId() : null;
        return new InspectionReportResponse(
            report.getId(),
            report.getJob().getId(),
            report.getPilot().getId(),
            fullName(report.getPilot().getFirstName(), report.getPilot().getLastName()),
            report.getReportDate(),
            report.getPropertyCondition(),
            report.getDamageFound(),
            report.getDamageSummary(),
            report.getRoofCondition(),
            report.getExteriorCondition(),
            report.getAdditionalFindings(),
            report.getRecommendations(),
            report.getPilotSignature(),
            report.getStatus(),
            report.getReviewerNotes(),
            reviewedById,
            report.getReviewedAt(),
            report.getCreatedAt(),
            report.getUpdatedAt()
        );
    }

    public LineItemResponse toLineItemResponse(LineItem item) {
        return new LineItemResponse(
            item.getId(),
            item.getDescription(),
            item.getQuantity(),
            item.getUnitPrice(),
            item.getAmount(),
            item.getSortOrder()
        );
    }

    public InvoiceResponse toInvoiceResponse(Invoice invoice) {
        var lineItems = invoice.getLineItems().stream()
            .map(this::toLineItemResponse)
            .collect(Collectors.toList());
        return new InvoiceResponse(
            invoice.getId(),
            invoice.getJob().getId(),
            invoice.getJob().getTitle(),
            invoice.getPilot().getId(),
            invoice.getInvoiceNumber(),
            invoice.getClient().getId(),
            invoice.getClient().getName(),
            invoice.getAmount(),
            invoice.getTaxAmount(),
            invoice.getTotalAmount(),
            invoice.getStatus(),
            invoice.getDueDate(),
            invoice.getPaidDate(),
            invoice.getNotes(),
            lineItems,
            invoice.getCreatedAt(),
            invoice.getUpdatedAt()
        );
    }

    private String fullName(String firstName, String lastName) {
        if (firstName == null && lastName == null) return null;
        if (firstName == null) return lastName;
        if (lastName == null) return firstName;
        return firstName + " " + lastName;
    }
}
