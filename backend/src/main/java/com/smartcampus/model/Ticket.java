package com.smartcampus.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "tickets")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ticket {
    @Id
    private String id;

    @Indexed(unique = true)
    private String ticketNumber;

    @Indexed
    private String resourceId;

    @Indexed
    private String createdById;

    private String assignedToId;

    private TicketCategory category;

    private String description;

    private TicketPriority priority;

    @Indexed
    private TicketStatus status;

    private String contactNumber;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private String resolutionNotes;

    private String rejectionReason;

    // Store IDs of related attachments and comments instead of relationships
    @Builder.Default
    private List<String> attachmentIds = new ArrayList<>();

    @Builder.Default
    private List<String> commentIds = new ArrayList<>();

    public void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.updatedAt == null) {
            this.updatedAt = LocalDateTime.now();
        }
    }

    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}

