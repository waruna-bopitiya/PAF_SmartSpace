package com.smartcampus.dto;

import lombok.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingDTO {
    private String id;

    @NotBlank
    private String resourceId;

    @NotNull
    private LocalDateTime startTime;

    @NotNull
    private LocalDateTime endTime;

    @NotBlank
    private String purpose;

    @NotNull
    @Positive
    private Integer expectedAttendees;

    private String status;

    private String rejectionReason;

    private String approvalNotes;
}
