package com.smartcampus.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "ticket_comments")
public class TicketComment {
    @Id
    private String id;

    private String ticketId;

    private String userId;

    private String userName;

    private String userEmail;

    private String content;

    private Boolean staffComment;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public TicketComment() {}

    public TicketComment(String id, String ticketId, String userId, String userName, String userEmail, String content, Boolean staffComment, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.ticketId = ticketId;
        this.userId = userId;
        this.userName = userName;
        this.userEmail = userEmail;
        this.content = content;
        this.staffComment = staffComment;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public TicketComment(String ticketId, String userId, String userName, String userEmail, String content, Boolean staffComment) {
        this.ticketId = ticketId;
        this.userId = userId;
        this.userName = userName;
        this.userEmail = userEmail;
        this.content = content;
        this.staffComment = staffComment;
    }

    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTicketId() { return ticketId; }
    public void setTicketId(String ticketId) { this.ticketId = ticketId; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public Boolean getStaffComment() { return staffComment; }
    public void setStaffComment(Boolean staffComment) { this.staffComment = staffComment; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
