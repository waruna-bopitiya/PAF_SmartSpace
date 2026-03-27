package com.smartcampus.dto;

import lombok.*;
import jakarta.validation.constraints.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketDTO {
    private Long id;

    private String ticketNumber;

    @NotNull
    @Positive
    private Long resourceId;

    @NotNull
    private String category;

    @NotBlank
    private String description;

    @NotNull
    private String priority;

    private String status;

    private String contactNumber;

    private String resolutionNotes;

    private String rejectionReason;

    private Long assignedToId;
}
