package com.smartcampus.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

public class CommentDTO {
    private String id;

    private String ticketId;

    private String bookingId;

    @NotBlank(message = "User ID is required")
    private String userId;

    @NotBlank(message = "User name is required")
    private String userName;

    @Email(message = "Invalid email format")
    private String userEmail;

    @NotBlank(message = "Content is required")
    @Size(min = 1, max = 1000, message = "Content must not exceed 1000 characters")
    private String content;

    private Boolean staffComment;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public CommentDTO() {}

    public CommentDTO(String id, String ticketId, String bookingId, String userId, String userName, String userEmail, String content, Boolean staffComment, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.ticketId = ticketId;
        this.bookingId = bookingId;
        this.userId = userId;
        this.userName = userName;
        this.userEmail = userEmail;
        this.content = content;
        this.staffComment = staffComment;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTicketId() { return ticketId; }
    public void setTicketId(String ticketId) { this.ticketId = ticketId; }
    public String getBookingId() { return bookingId; }
    public void setBookingId(String bookingId) { this.bookingId = bookingId; }
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
