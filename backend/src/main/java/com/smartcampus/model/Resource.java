package com.smartcampus.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "resources")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resource {
    @Id
    private String id;

    private String name;

    private String description;

    private ResourceType type;

    private Integer capacity;

    private String location;

    private ResourceStatus status;

    private String imageUrl;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // Store IDs of related documents instead of relationships
    @Builder.Default
    private List<String> bookingIds = new ArrayList<>();

    @Builder.Default
    private List<String> ticketIds = new ArrayList<>();

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

