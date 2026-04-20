package com.pedaerial.operatorflightcheck.dto;

import com.pedaerial.operatorflightcheck.entity.ClientType;

import java.time.Instant;
import java.util.UUID;

public record ClientResponse(
    UUID id,
    String pilotId,
    String name,
    String email,
    String phone,
    String company,
    ClientType clientType,
    String address,
    String notes,
    Instant createdAt
) {}
