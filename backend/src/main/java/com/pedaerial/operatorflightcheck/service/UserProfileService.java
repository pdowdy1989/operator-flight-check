package com.pedaerial.operatorflightcheck.service;

import com.pedaerial.operatorflightcheck.dto.UserProfileResponse;
import com.pedaerial.operatorflightcheck.dto.UserProfileUpdateRequest;
import com.pedaerial.operatorflightcheck.entity.PaymentTerms;
import com.pedaerial.operatorflightcheck.entity.Role;
import com.pedaerial.operatorflightcheck.entity.User;
import com.pedaerial.operatorflightcheck.exception.BadRequestException;
import com.pedaerial.operatorflightcheck.exception.ResourceNotFoundException;
import com.pedaerial.operatorflightcheck.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class UserProfileService {

    private final UserRepository userRepository;
    private final ResponseMapper responseMapper;

    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(String userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        return responseMapper.toUserProfileResponse(user);
    }

    public UserProfileResponse updateProfile(String userId, UserProfileUpdateRequest req) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        if (req.getFirstName() != null) user.setFirstName(req.getFirstName());
        if (req.getLastName() != null) user.setLastName(req.getLastName());
        if (req.getPhone() != null) user.setPhone(req.getPhone());
        if (req.getCompany() != null) user.setCompany(req.getCompany());
        if (req.getLicenseNumber() != null) user.setLicenseNumber(req.getLicenseNumber());
        if (req.getBusinessName() != null) user.setBusinessName(req.getBusinessName());
        if (req.getEin() != null) user.setEin(req.getEin());
        // llcVerified is read-only — ignore user input
        if (req.getBillingAddress() != null) user.setBillingAddress(req.getBillingAddress());
        if (req.getBillingCity() != null) user.setBillingCity(req.getBillingCity());
        if (req.getBillingState() != null) user.setBillingState(req.getBillingState());
        if (req.getBillingZip() != null) user.setBillingZip(req.getBillingZip());
        if (req.getInsurancePolicyNumber() != null) user.setInsurancePolicyNumber(req.getInsurancePolicyNumber());
        if (req.getInsuranceCompanyName() != null) user.setInsuranceCompanyName(req.getInsuranceCompanyName());

        // Payment terms rules
        if (req.getPaymentTerms() != null) {
            if (user.getRole() == Role.CLIENT) {
                // CLIENT forced to PREPAY
                user.setPaymentTerms(PaymentTerms.PREPAY);
            } else if (user.getRole() == Role.COMPANY) {
                // COMPANY: only NET_30 or NET_60
                if (req.getPaymentTerms() != PaymentTerms.NET_30 && req.getPaymentTerms() != PaymentTerms.NET_60) {
                    throw new BadRequestException("Company accounts may only use NET_30 or NET_60 payment terms.");
                }
                user.setPaymentTerms(req.getPaymentTerms());
            } else {
                user.setPaymentTerms(req.getPaymentTerms());
            }
        }

        return responseMapper.toUserProfileResponse(userRepository.save(user));
    }
}
