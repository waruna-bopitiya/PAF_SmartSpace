package com.smartcampus.dto;

import com.smartcampus.model.NotificationType;
import java.time.LocalDateTime;

public class NotificationDTO {
    private String id;

    private String userId;

    private String relatedEntityId;

    private String relatedEntityType;

    private NotificationType type;

    private String title;

    private String message;

    private Boolean isRead;

    private String actionUrl;

    private LocalDateTime createdAt;

    private LocalDateTime readAt;

    public NotificationDTO() {
    }

    public NotificationDTO(String id, String userId, String relatedEntityId, String relatedEntityType,
            NotificationType type, String title, String message, Boolean isRead, String actionUrl,
            LocalDateTime createdAt, LocalDateTime readAt) {
        this.id = id;
        this.userId = userId;
        this.relatedEntityId = relatedEntityId;
        this.relatedEntityType = relatedEntityType;
        this.type = type;
        this.title = title;
        this.message = message;
        this.isRead = isRead;
        this.actionUrl = actionUrl;
        this.createdAt = createdAt;
        this.readAt = readAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getRelatedEntityId() { return relatedEntityId; }
    public void setRelatedEntityId(String relatedEntityId) { this.relatedEntityId = relatedEntityId; }
    public String getRelatedEntityType() { return relatedEntityType; }
    public void setRelatedEntityType(String relatedEntityType) { this.relatedEntityType = relatedEntityType; }
    public NotificationType getType() { return type; }
    public void setType(NotificationType type) { this.type = type; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public Boolean getIsRead() { return isRead; }
    public void setIsRead(Boolean isRead) { this.isRead = isRead; }
    public String getActionUrl() { return actionUrl; }
    public void setActionUrl(String actionUrl) { this.actionUrl = actionUrl; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getReadAt() { return readAt; }
    public void setReadAt(LocalDateTime readAt) { this.readAt = readAt; }
}
