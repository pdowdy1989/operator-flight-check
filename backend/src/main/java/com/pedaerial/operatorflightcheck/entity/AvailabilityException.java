package com.pedaerial.operatorflightcheck.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "availability_exceptions")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AvailabilityException {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pilot_id", nullable = false, columnDefinition = "CHAR(36)")
    private User pilot;

    @NotNull
    @Column(name = "exception_date", nullable = false)
    private LocalDate exceptionDate;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "exception_type", nullable = false, length = 10)
    private ExceptionType exceptionType;

    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "end_time")
    private LocalTime endTime;

    @Size(max = 500)
    @Column(length = 500)
    private String reason;
}
