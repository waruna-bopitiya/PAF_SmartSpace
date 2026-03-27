package com.smartcampus.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications", indexes = {
    @Index(name = "idx_user_id", columnList = "user_id"),
    @Index(name = "idx_is_read", columnList = "is_read"),
    @Index(name = "idx_created_at", columnList = "created_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Column(length = 1000, nullable = false)
    private String title;

    @Column(length = 2000)
    private String message;

    @Column(nullable = false)
    private Boolean isRead = false;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime readAt;

    @Column
    private Long relatedResourceId;

    @Column
    private String relatedResourceType;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}

enum NotificationType {
    BOOKING_APPROVED, BOOKING_REJECTED, BOOKING_CANCELLED,
    TICKET_STATUS_CHANGED, TICKET_ASSIGNED, TICKET_COMMENTED,
    COMMENT_ON_YOUR_TICKET, COMMENT_ON_YOUR_BOOKING,
    SYSTEM_ALERT
}
