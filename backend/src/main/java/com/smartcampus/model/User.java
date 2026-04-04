package com.smartcampus.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    private String id;

    @Indexed(unique = true)
    private String email;

    private String fullName;

    private String googleId;

    private String profilePictureUrl;

    private UserRole role;

    private Boolean active = true;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private String department;

    private String phoneNumber;

    // Store IDs of related documents instead of relationships
    @Builder.Default
    private List<String> bookingIds = new ArrayList<>();

    @Builder.Default
    private List<String> createdTicketIds = new ArrayList<>();

    @Builder.Default
    private List<String> assignedTicketIds = new ArrayList<>();

    @Builder.Default
    private List<String> notificationIds = new ArrayList<>();

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

    public String getName() {
        return this.fullName;
    }
}
