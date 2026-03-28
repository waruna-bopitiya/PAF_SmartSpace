package com.smartcampus.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "tickets")
public class Ticket {
    @Id
    private String id;

    @Indexed
    private String resourceId;

    @Indexed
    private String createdBy;

    private String title;

    private String description;

    private TicketCategory category;

    private TicketPriority priority;

    private TicketStatus status;

    private String assignedTo;

    private String location;

    private String preferredContactEmail;

    private String preferredContactPhone;

    private List<String> attachmentIds = new ArrayList<>();

    private List<String> commentIds = new ArrayList<>();

    private String resolutionNotes;

    private LocalDateTime resolvedDate;

    private String rejectionReason;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private LocalDateTime lastResponseAt;

    public Ticket() {}

    public Ticket(String id, String resourceId, String createdBy, String title, String description, TicketCategory category, TicketPriority priority, TicketStatus status, String assignedTo, String location, String preferredContactEmail, String preferredContactPhone, List<String> attachmentIds, List<String> commentIds, String resolutionNotes, LocalDateTime resolvedDate, String rejectionReason, LocalDateTime createdAt, LocalDateTime updatedAt, LocalDateTime lastResponseAt) {
        this.id = id;
        this.resourceId = resourceId;
        this.createdBy = createdBy;
        this.title = title;
        this.description = description;
        this.category = category;
        this.priority = priority;
        this.status = status;
        this.assignedTo = assignedTo;
        this.location = location;
        this.preferredContactEmail = preferredContactEmail;
        this.preferredContactPhone = preferredContactPhone;
        this.attachmentIds = attachmentIds;
        this.commentIds = commentIds;
        this.resolutionNotes = resolutionNotes;
        this.resolvedDate = resolvedDate;
        this.rejectionReason = rejectionReason;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.lastResponseAt = lastResponseAt;
    }

    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = TicketStatus.OPEN;
        }
    }

    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getResourceId() { return resourceId; }
    public void setResourceId(String resourceId) { this.resourceId = resourceId; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public TicketCategory getCategory() { return category; }
    public void setCategory(TicketCategory category) { this.category = category; }
    public TicketPriority getPriority() { return priority; }
    public void setPriority(TicketPriority priority) { this.priority = priority; }
    public TicketStatus getStatus() { return status; }
    public void setStatus(TicketStatus status) { this.status = status; }
    public String getAssignedTo() { return assignedTo; }
    public void setAssignedTo(String assignedTo) { this.assignedTo = assignedTo; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getPreferredContactEmail() { return preferredContactEmail; }
    public void setPreferredContactEmail(String preferredContactEmail) { this.preferredContactEmail = preferredContactEmail; }
    public String getPreferredContactPhone() { return preferredContactPhone; }
    public void setPreferredContactPhone(String preferredContactPhone) { this.preferredContactPhone = preferredContactPhone; }
    public List<String> getAttachmentIds() { return attachmentIds; }
    public void setAttachmentIds(List<String> attachmentIds) { this.attachmentIds = attachmentIds; }
    public List<String> getCommentIds() { return commentIds; }
    public void setCommentIds(List<String> commentIds) { this.commentIds = commentIds; }
    public String getResolutionNotes() { return resolutionNotes; }
    public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }
    public LocalDateTime getResolvedDate() { return resolvedDate; }
    public void setResolvedDate(LocalDateTime resolvedDate) { this.resolvedDate = resolvedDate; }
    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public LocalDateTime getLastResponseAt() { return lastResponseAt; }
    public void setLastResponseAt(LocalDateTime lastResponseAt) { this.lastResponseAt = lastResponseAt; }
}
