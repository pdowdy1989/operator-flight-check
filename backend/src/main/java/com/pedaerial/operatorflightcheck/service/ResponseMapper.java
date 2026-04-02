package com.pedaerial.operatorflightcheck.service;

import com.pedaerial.operatorflightcheck.dto.ClientResponse;
import com.pedaerial.operatorflightcheck.dto.DroneProfileResponse;
import com.pedaerial.operatorflightcheck.dto.InvoiceResponse;
import com.pedaerial.operatorflightcheck.dto.LineItemResponse;
import com.pedaerial.operatorflightcheck.dto.MissionResponse;
import com.pedaerial.operatorflightcheck.dto.PaymentResponse;
import com.pedaerial.operatorflightcheck.entity.Client;
import com.pedaerial.operatorflightcheck.entity.DroneProfile;
import com.pedaerial.operatorflightcheck.entity.Invoice;
import com.pedaerial.operatorflightcheck.entity.LineItem;
import com.pedaerial.operatorflightcheck.entity.Mission;
import com.pedaerial.operatorflightcheck.entity.Payment;
import java.util.List;

final class ResponseMapper {

    private ResponseMapper() {
    }

    static ClientResponse toClientResponse(Client client) {
        return ClientResponse.builder()
            .id(client.getId())
            .name(client.getName())
            .email(client.getEmail())
            .company(client.getCompany())
            .phone(client.getPhone())
            .billingAddress(client.getBillingAddress())
            .notes(client.getNotes())
            .createdAt(client.getCreatedAt())
            .updatedAt(client.getUpdatedAt())
            .missionCount(client.getMissions() == null ? 0 : client.getMissions().size())
            .invoiceCount(client.getInvoices() == null ? 0 : client.getInvoices().size())
            .build();
    }

    static DroneProfileResponse toDroneProfileResponse(DroneProfile profile) {
        return new DroneProfileResponse(
            profile.getId(),
            profile.getUser().getId(),
            profile.getName(),
            profile.getType(),
            profile.getWindGreenMph(),
            profile.getWindYellowMph(),
            profile.getGustGreenMph(),
            profile.getGustYellowMph(),
            profile.getPrecipGreenPct(),
            profile.getPrecipYellowPct(),
            profile.getCreatedAt()
        );
    }

    static MissionResponse toMissionResponse(Mission mission) {
        return MissionResponse.builder()
            .id(mission.getId())
            .clientId(mission.getClientId())
            .clientName(mission.getClient() != null ? mission.getClient().getName() : null)
            .droneProfileId(mission.getDroneProfileId())
            .droneProfileName(mission.getDroneProfile() != null ? mission.getDroneProfile().getName() : null)
            .title(mission.getTitle())
            .description(mission.getDescription())
            .locationLabel(mission.getLocationLabel())
            .locationAddress(mission.getLocationAddress())
            .locationLat(mission.getLocationLat())
            .locationLon(mission.getLocationLon())
            .missionDate(mission.getMissionDate())
            .status(mission.getStatus())
            .flyScore(mission.getFlyScore())
            .weatherSummary(mission.getWeatherSummary())
            .durationHours(mission.getDurationHours())
            .notes(mission.getNotes())
            .createdAt(mission.getCreatedAt())
            .updatedAt(mission.getUpdatedAt())
            .build();
    }

    static LineItemResponse toLineItemResponse(LineItem lineItem) {
        return LineItemResponse.builder()
            .id(lineItem.getId())
            .missionId(lineItem.getMissionId())
            .missionTitle(lineItem.getMission() != null ? lineItem.getMission().getTitle() : null)
            .description(lineItem.getDescription())
            .quantity(lineItem.getQuantity())
            .unitPrice(lineItem.getUnitPrice())
            .amount(lineItem.getAmount())
            .sortOrder(lineItem.getSortOrder())
            .build();
    }

    static PaymentResponse toPaymentResponse(Payment payment) {
        return PaymentResponse.builder()
            .id(payment.getId())
            .invoiceId(payment.getInvoiceId())
            .amount(payment.getAmount())
            .paymentDate(payment.getPaymentDate())
            .method(payment.getMethod())
            .referenceNote(payment.getReferenceNote())
            .createdAt(payment.getCreatedAt())
            .build();
    }

    static InvoiceResponse toInvoiceResponse(Invoice invoice, List<LineItem> lineItems, List<Payment> payments) {
        return InvoiceResponse.builder()
            .id(invoice.getId())
            .clientId(invoice.getClientId())
            .clientName(invoice.getClient() != null ? invoice.getClient().getName() : null)
            .invoiceNumber(invoice.getInvoiceNumber())
            .status(invoice.getStatus())
            .issueDate(invoice.getIssueDate())
            .dueDate(invoice.getDueDate())
            .notes(invoice.getNotes())
            .lineItems(lineItems.stream().map(ResponseMapper::toLineItemResponse).toList())
            .payments(payments.stream().map(ResponseMapper::toPaymentResponse).toList())
            .totalAmount(invoice.getTotalAmount())
            .amountPaid(invoice.getAmountPaid())
            .balanceDue(invoice.getBalanceDue())
            .createdAt(invoice.getCreatedAt())
            .updatedAt(invoice.getUpdatedAt())
            .build();
    }
}
