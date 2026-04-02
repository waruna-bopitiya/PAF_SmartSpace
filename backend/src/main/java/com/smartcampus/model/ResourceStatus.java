package com.smartcampus.model;

public enum ResourceStatus {
    ACTIVE,
    OUT_OF_SERVICE,
    MAINTENANCE,
    RETIRED;

    public static ResourceStatus fromString(String value) {
        try {
            return ResourceStatus.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ACTIVE;
        }
    }
}
