package com.pedaerial.operatorflightcheck.dto.clientportal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeliverableResponse {
    private String id;
    private String fileUrl;
    private String fileName;
    private String fileType;
}
