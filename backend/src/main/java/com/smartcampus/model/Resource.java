package com.smartcampus.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "resources")
public class Resource {
    @Id
    private String id;

    @Indexed
    private String name;

    private String description;

    private ResourceType type;

    private int capacity;

    private String location;

    private ResourceStatus status;

    private String imageUrl;

    private LocalDateTime weekdayOpenTime;

    private LocalDateTime weekdayCloseTime;

    private LocalDateTime weekendOpenTime;

    private LocalDateTime weekendCloseTime;

    private String contactPerson;

    private String phoneNumber;

    private String email;

    private List<String> tags = new ArrayList<>();

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private String createdBy;

    public Resource() {
    }

    public Resource(String id, String name, String description, ResourceType type, int capacity, String location, ResourceStatus status, String imageUrl, LocalDateTime weekdayOpenTime, LocalDateTime weekdayCloseTime, LocalDateTime weekendOpenTime, LocalDateTime weekendCloseTime, String contactPerson, String phoneNumber, String email, List<String> tags, LocalDateTime createdAt, LocalDateTime updatedAt, String createdBy) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.type = type;
        this.capacity = capacity;
        this.location = location;
        this.status = status;
        this.imageUrl = imageUrl;
        this.weekdayOpenTime = weekdayOpenTime;
        this.weekdayCloseTime = weekdayCloseTime;
        this.weekendOpenTime = weekendOpenTime;
        this.weekendCloseTime = weekendCloseTime;
        this.contactPerson = contactPerson;
        this.phoneNumber = phoneNumber;
        this.email = email;
        this.tags = tags;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.createdBy = createdBy;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public ResourceType getType() { return type; }
    public void setType(ResourceType type) { this.type = type; }
    public int getCapacity() { return capacity; }
    public void setCapacity(int capacity) { this.capacity = capacity; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public ResourceStatus getStatus() { return status; }
    public void setStatus(ResourceStatus status) { this.status = status; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public LocalDateTime getWeekdayOpenTime() { return weekdayOpenTime; }
    public void setWeekdayOpenTime(LocalDateTime weekdayOpenTime) { this.weekdayOpenTime = weekdayOpenTime; }
    public LocalDateTime getWeekdayCloseTime() { return weekdayCloseTime; }
    public void setWeekdayCloseTime(LocalDateTime weekdayCloseTime) { this.weekdayCloseTime = weekdayCloseTime; }
    public LocalDateTime getWeekendOpenTime() { return weekendOpenTime; }
    public void setWeekendOpenTime(LocalDateTime weekendOpenTime) { this.weekendOpenTime = weekendOpenTime; }
    public LocalDateTime getWeekendCloseTime() { return weekendCloseTime; }
    public void setWeekendCloseTime(LocalDateTime weekendCloseTime) { this.weekendCloseTime = weekendCloseTime; }
    public String getContactPerson() { return contactPerson; }
    public void setContactPerson(String contactPerson) { this.contactPerson = contactPerson; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    // Lifecycle callbacks
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = ResourceStatus.ACTIVE;
        }
    }

    // Update the updatedAt timestamp on updates
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
