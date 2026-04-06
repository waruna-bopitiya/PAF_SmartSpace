package com.smartcampus.model;

// Enum representing the status of a resource 
public enum ResourceStatus {
    ACTIVE,
    OUT_OF_SERVICE,
    MAINTENANCE,
    RETIRED;
    
    // Utility method to convert string to enum, defaults to ACTIVE if invalid
    public static ResourceStatus fromString(String value) {
        try {
            return ResourceStatus.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ACTIVE;
        }
    }
}
