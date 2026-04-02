package com.smartcampus.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDTO {
    private Long id;

    private String type;

    private String title;

    private String message;

    private Boolean isRead;

    private LocalDateTime createdAt;

    private Long relatedResourceId;

    private String relatedResourceType;
}
