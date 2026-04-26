package com.smartcampus.model;

public enum TicketPriority {
    LOW,
    MEDIUM,
    HIGH,
    CRITICAL;

    public static TicketPriority fromString(String value) {
        try {
            return TicketPriority.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            return MEDIUM;
        }
    }
}
