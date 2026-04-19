package com.smartcampus.model;
// Enum representing the status of a booking, used for tracking and managing booking states
public enum BookingStatus {
    PENDING,
    APPROVED,
    REJECTED,
    CANCELLED;

    public static BookingStatus fromString(String value) {
        try {
            return BookingStatus.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            return PENDING;
        }
    }
}
