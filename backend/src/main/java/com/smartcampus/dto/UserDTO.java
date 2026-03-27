package com.smartcampus.dto;

import lombok.*;
import jakarta.validation.constraints.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDTO {
    private Long id;

    @Email
    private String email;

    @NotBlank
    private String fullName;

    private String profilePictureUrl;

    @NotNull
    private String role;

    private Boolean active;

    private String department;

    private String phoneNumber;
}
