package com.smartcampus.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import java.time.LocalDateTime;

@Document(collection = "ticket_comments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketComment {
    @Id
    private String id;

    @Indexed
    private String ticketId;

    @Indexed
    private String userId;

    private String content;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

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
