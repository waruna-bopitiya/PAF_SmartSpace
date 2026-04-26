package com.smartcampus.model;

public enum UserRole {
	ADMIN,
	TECHNICIAN,
	USER;

	public static UserRole fromString(String value) {
		for (UserRole role : UserRole.values()) {
			if (role.name().equalsIgnoreCase(value)) {
				return role;
			}
		}
		throw new IllegalArgumentException("No enum constant for value: " + value);
	}
}
