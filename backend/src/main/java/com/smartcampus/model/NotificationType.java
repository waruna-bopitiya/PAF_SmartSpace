package com.smartcampus.model;

public enum NotificationType {
    BOOKING_APPROVED,
    BOOKING_REJECTED,
    BOOKING_CANCELLED,
    TICKET_ASSIGNED,
    TICKET_STATUS_CHANGED,
    TICKET_COMMENTED,
    NEW_COMMENT_ON_MY_TICKET,
    COMMENT_REPLIED,
    SYSTEM_ALERT;

    public static NotificationType fromString(String value) {
        try {
            return NotificationType.valueOf(value.toUpperCase().replace(" ", "_"));
        } catch (IllegalArgumentException e) {
            return SYSTEM_ALERT;
        }
    }
}
