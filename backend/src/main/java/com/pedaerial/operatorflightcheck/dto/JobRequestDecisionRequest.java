package com.pedaerial.operatorflightcheck.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobRequestDecisionRequest {

    @NotBlank
    private String decision;

    @Size(max = 1000)
    private String decisionNotes;
}
