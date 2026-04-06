package com.smartcampus.model;

// enum representing the type of a resource
public enum ResourceType {
    LECTURE_HALL,
    LAB,
    MEETING_ROOM,
    EQUIPMENT,
    OUTDOOR_SPACE,
    PARKING,
    OTHER;

    public static ResourceType fromString(String value) {
        try {
            return ResourceType.valueOf(value.toUpperCase().replace(" ", "_"));
        } catch (IllegalArgumentException e) {
            return OTHER;
        }
    }
}
