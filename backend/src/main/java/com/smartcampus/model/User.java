package com.smartcampus.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "users")
public class User {
    @Id
    private String id;

    @Indexed(unique = true)
    private String email;

    private String password;

    private String fullName;

    private String googleId;

    private String profilePictureUrl;

    private UserRole role;

    private Boolean active = true;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private String department;

    private String phoneNumber;

    private List<String> bookingIds = new ArrayList<>();

    private List<String> createdTicketIds = new ArrayList<>();

    private List<String> assignedTicketIds = new ArrayList<>();

    private List<String> notificationIds = new ArrayList<>();

    public User() {
    }

    public User(String id, String email, String fullName, String googleId, String profilePictureUrl, UserRole role, Boolean active, LocalDateTime createdAt, LocalDateTime updatedAt, String department, String phoneNumber, List<String> bookingIds, List<String> createdTicketIds, List<String> assignedTicketIds, List<String> notificationIds) {
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.googleId = googleId;
        this.profilePictureUrl = profilePictureUrl;
        this.role = role;
        this.active = active;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.department = department;
        this.phoneNumber = phoneNumber;
        this.bookingIds = bookingIds;
        this.createdTicketIds = createdTicketIds;
        this.assignedTicketIds = assignedTicketIds;
        this.notificationIds = notificationIds;
    }

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

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getGoogleId() { return googleId; }
    public void setGoogleId(String googleId) { this.googleId = googleId; }
    public String getProfilePictureUrl() { return profilePictureUrl; }
    public void setProfilePictureUrl(String profilePictureUrl) { this.profilePictureUrl = profilePictureUrl; }
    public UserRole getRole() { return role; }
    public void setRole(UserRole role) { this.role = role; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public List<String> getBookingIds() { return bookingIds; }
    public void setBookingIds(List<String> bookingIds) { this.bookingIds = bookingIds; }
    public List<String> getCreatedTicketIds() { return createdTicketIds; }
    public void setCreatedTicketIds(List<String> createdTicketIds) { this.createdTicketIds = createdTicketIds; }
    public List<String> getAssignedTicketIds() { return assignedTicketIds; }
    public void setAssignedTicketIds(List<String> assignedTicketIds) { this.assignedTicketIds = assignedTicketIds; }
    public List<String> getNotificationIds() { return notificationIds; }
    public void setNotificationIds(List<String> notificationIds) { this.notificationIds = notificationIds; }
}
