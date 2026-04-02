package com.pedaerial.operatorflightcheck.dto;

import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClientResponse {
    private String id;
    private String name;
    private String email;
    private String company;
    private String phone;
    private String billingAddress;
    private String notes;
    private Instant createdAt;
    private Instant updatedAt;
    private int missionCount;
    private int invoiceCount;
}
