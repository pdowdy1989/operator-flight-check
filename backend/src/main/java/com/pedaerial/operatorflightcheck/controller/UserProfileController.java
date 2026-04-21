package com.pedaerial.operatorflightcheck.controller;

import com.pedaerial.operatorflightcheck.dto.UserProfileResponse;
import com.pedaerial.operatorflightcheck.dto.UserProfileUpdateRequest;
import com.pedaerial.operatorflightcheck.security.AppUserPrincipal;
import com.pedaerial.operatorflightcheck.service.UserProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserProfileService userProfileService;

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getProfile(@AuthenticationPrincipal AppUserPrincipal principal) {
        return ResponseEntity.ok(userProfileService.getProfile(principal.getId()));
    }

    @PutMapping("/me")
    public ResponseEntity<UserProfileResponse> updateProfile(
            @RequestBody @Valid UserProfileUpdateRequest req,
            @AuthenticationPrincipal AppUserPrincipal principal) {
        return ResponseEntity.ok(userProfileService.updateProfile(principal.getId(), req));
    }
}
