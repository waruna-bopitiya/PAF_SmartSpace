package com.smartcampus.dto;

import lombok.*;
import jakarta.validation.constraints.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResourceDTO {
    private Long id;

    @NotBlank
    private String name;

    private String description;

    @NotNull
    private String type;

    @NotNull
    @Positive
    private Integer capacity;

    @NotBlank
    private String location;

    @NotNull
    private String status;

    private String imageUrl;
}
