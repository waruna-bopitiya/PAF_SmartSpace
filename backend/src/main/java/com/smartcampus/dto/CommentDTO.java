package com.smartcampus.dto;

import lombok.*;
import jakarta.validation.constraints.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentDTO {
    private Long id;

    @NotBlank
    private String content;

    private Long userId;

    private String userName;
}
