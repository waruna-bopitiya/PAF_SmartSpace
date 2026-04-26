package com.smartcampus.model;

public enum TicketCategory {
    DAMAGE,
    MALFUNCTION,
    LOST_AND_FOUND,
    MAINTENANCE_REQUEST,
    CLEANING,
    ACCESS_ISSUE,
    OTHER;

    public static TicketCategory fromString(String value) {
        try {
            return TicketCategory.valueOf(value.toUpperCase().replace(" ", "_"));
        } catch (IllegalArgumentException e) {
            return OTHER;
        }
    }
}
