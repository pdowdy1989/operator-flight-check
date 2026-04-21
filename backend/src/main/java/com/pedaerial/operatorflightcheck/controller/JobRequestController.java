package com.pedaerial.operatorflightcheck.controller;

import com.pedaerial.operatorflightcheck.dto.JobRequestDecisionRequest;
import com.pedaerial.operatorflightcheck.dto.JobRequestResponse;
import com.pedaerial.operatorflightcheck.dto.JobRequestSubmitRequest;
import com.pedaerial.operatorflightcheck.entity.Role;
import com.pedaerial.operatorflightcheck.security.AppUserPrincipal;
import com.pedaerial.operatorflightcheck.service.JobRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/job-requests")
@RequiredArgsConstructor
public class JobRequestController {

    private final JobRequestService jobRequestService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public JobRequestResponse submit(@RequestBody @Valid JobRequestSubmitRequest req,
                                     @AuthenticationPrincipal AppUserPrincipal principal) {
        return jobRequestService.submit(req, principal.getId());
    }

    @GetMapping
    public List<JobRequestResponse> list(@AuthenticationPrincipal AppUserPrincipal principal) {
        Role role = principal.getRole();
        if (role == Role.PILOT) {
            return jobRequestService.listPendingForPilot();
        } else if (role == Role.ADMIN) {
            return jobRequestService.listAllForPilot();
        } else {
            return jobRequestService.listForRequester(principal.getId());
        }
    }

    @GetMapping("/all")
    public List<JobRequestResponse> listAll(@AuthenticationPrincipal AppUserPrincipal principal) {
        Role role = principal.getRole();
        if (role != Role.PILOT && role != Role.ADMIN) {
            throw new AccessDeniedException("Pilots and admins only");
        }
        return jobRequestService.listAllForPilot();
    }

    @GetMapping("/{id}")
    public JobRequestResponse get(@PathVariable UUID id,
                                  @AuthenticationPrincipal AppUserPrincipal principal) {
        return jobRequestService.get(id, principal.getId());
    }

    @PostMapping("/{id}/decide")
    public JobRequestResponse decide(@PathVariable UUID id,
                                     @RequestBody @Valid JobRequestDecisionRequest decision,
                                     @AuthenticationPrincipal AppUserPrincipal principal) {
        Role role = principal.getRole();
        if (role != Role.PILOT && role != Role.ADMIN) {
            throw new AccessDeniedException("Pilots and admins only");
        }
        return jobRequestService.decide(id, decision, principal.getId());
    }

    @PostMapping("/{id}/cancel")
    public JobRequestResponse cancel(@PathVariable UUID id,
                                     @AuthenticationPrincipal AppUserPrincipal principal) {
        return jobRequestService.cancel(id, principal.getId());
    }
}
