package com.pedaerial.operatorflightcheck.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
public class User {

    @Id
    @Column(nullable = false, updatable = false, length = 36)
    private String id;

    @Email
    @NotBlank
    @Size(max = 255)
    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @NotBlank
    @Size(max = 255)
    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private Role role = Role.CLIENT;

    @Size(max = 100)
    @Column(name = "first_name", length = 100)
    private String firstName;

    @Size(max = 100)
    @Column(name = "last_name", length = 100)
    private String lastName;

    @Size(max = 50)
    @Column(name = "phone", length = 50)
    private String phone;

    @Size(max = 255)
    @Column(name = "company", length = 255)
    private String company;

    @Size(max = 50)
    @Column(name = "license_number", length = 50)
    private String licenseNumber;

    @Size(max = 255)
    @Column(name = "business_name")
    private String businessName;

    @Size(max = 50)
    @Column(name = "ein")
    private String ein;

    @Builder.Default
    @Column(name = "llc_verified", nullable = false)
    private Boolean llcVerified = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_terms", length = 20)
    private PaymentTerms paymentTerms;

    @Size(max = 500)
    @Column(name = "billing_address")
    private String billingAddress;

    @Size(max = 100)
    @Column(name = "billing_city")
    private String billingCity;

    @Size(max = 50)
    @Column(name = "billing_state")
    private String billingState;

    @Size(max = 20)
    @Column(name = "billing_zip")
    private String billingZip;

    @Size(max = 100)
    @Column(name = "insurance_policy_number")
    private String insurancePolicyNumber;

    @Size(max = 255)
    @Column(name = "insurance_company_name")
    private String insuranceCompanyName;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void prePersist() {
        if (id == null || id.isBlank()) {
            id = UUID.randomUUID().toString();
        }
        if (createdAt == null) {
            createdAt = Instant.now();
        }
        if (role == null) {
            role = Role.CLIENT;
        }
    }
}
