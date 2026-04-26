package com.smartcampus.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.smartcampus.model.TicketCategory;
import com.smartcampus.model.TicketPriority;
import com.smartcampus.model.TicketStatus;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class TicketDTO {
    private String id;

    @NotBlank(message = "Resource ID is required")
    private String resourceId;

    @NotBlank(message = "User ID is required")
    private String createdBy;

    @NotBlank(message = "Title is required")
    @Size(min = 5, max = 150, message = "Title must be between 5 and 150 characters")
    private String title;

    @NotBlank(message = "Description is required")
    @Size(min = 10, max = 1000, message = "Description must be between 10 and 1000 characters")
    private String description;

    @NotNull(message = "Category is required")
    private TicketCategory category;

    @NotNull(message = "Priority is required")
    private TicketPriority priority;

    private TicketStatus status;

    private String assignedTo;

    private String location;

    @Email(message = "Invalid email format")
    private String preferredContactEmail;

    @Pattern(regexp = "^[+]?[0-9]{10,}$|^$", message = "Invalid phone number")
    private String preferredContactPhone;

    private List<String> attachmentIds;

    private List<String> commentIds;

    private String resolutionNotes;

    private LocalDateTime resolvedDate;

    private String rejectionReason;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private LocalDateTime lastResponseAt;

    public TicketDTO() {}

    public TicketDTO(String id, String resourceId, String createdBy, String title, String description,
            TicketCategory category, TicketPriority priority, TicketStatus status, String assignedTo,
            String location, String preferredContactEmail, String preferredContactPhone,
            List<String> attachmentIds, List<String> commentIds, String resolutionNotes,
            LocalDateTime resolvedDate, String rejectionReason, LocalDateTime createdAt,
            LocalDateTime updatedAt, LocalDateTime lastResponseAt) {
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
