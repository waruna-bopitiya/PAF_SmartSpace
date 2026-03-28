package com.smartcampus.dto;

import com.smartcampus.model.UserRole;
import jakarta.validation.constraints.*;

public class UserDTO {
    private String id;

    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    private String fullName;

    private String googleId;

    private String profilePictureUrl;

    private String role;  // Changed from UserRole enum to String

    private Boolean active;

    private String department;

    @Pattern(regexp = "^[+]?[0-9]{10,}$|^$", message = "Invalid phone number")
    private String phoneNumber;

    public UserDTO() {}

    public UserDTO(String id, String email, String fullName, String googleId, String profilePictureUrl, String role, Boolean active, String department, String phoneNumber) {
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.googleId = googleId;
        this.profilePictureUrl = profilePictureUrl;
        this.role = role;
        this.active = active;
        this.department = department;
        this.phoneNumber = phoneNumber;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getGoogleId() { return googleId; }
    public void setGoogleId(String googleId) { this.googleId = googleId; }
    public String getProfilePictureUrl() { return profilePictureUrl; }
    public void setProfilePictureUrl(String profilePictureUrl) { this.profilePictureUrl = profilePictureUrl; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
}
