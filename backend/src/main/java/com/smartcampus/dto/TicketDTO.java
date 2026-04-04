package com.smartcampus.dto;

import lombok.*;
import jakarta.validation.constraints.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketDTO {
    private String id;

    private String ticketNumber;

    @NotBlank
    private String resourceId;

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

    private String assignedToId;
}
