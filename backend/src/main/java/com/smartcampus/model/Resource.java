package com.smartcampus.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "resources")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resource {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ResourceType type;

    @Column(nullable = false)
    private Integer capacity;

    @Column(nullable = false)
    private String location;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ResourceStatus status;

    @Column(length = 500)
    private String imageUrl;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "resource", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Booking> bookings = new HashSet<>();

    @OneToMany(mappedBy = "resource", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Ticket> tickets = new HashSet<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

enum ResourceType {
    LECTURE_HALL, LAB, MEETING_ROOM, EQUIPMENT
}

enum ResourceStatus {
    ACTIVE, OUT_OF_SERVICE, MAINTENANCE
}
