package com.smartcampus.controller;

import com.smartcampus.dto.NotificationDTO;
import com.smartcampus.model.Notification;
import com.smartcampus.service.NotificationService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/notifications")
@CrossOrigin(origins = "http://localhost:3000")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private ModelMapper modelMapper;

    /**
     * Get all notifications for user
     * GET /notifications/user/{userId}
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserNotifications(@PathVariable String userId) {
        try {
            List<Notification> notifications = notificationService.getUserNotifications(userId);
            List<NotificationDTO> dtos = notifications.stream()
                    .map(n -> modelMapper.map(n, NotificationDTO.class))
                    .collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching notifications: " + e.getMessage());
        }
    }

    /**
     * Get unread notifications for user
     * GET /notifications/user/{userId}/unread
     */
    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<?> getUnreadNotifications(@PathVariable String userId) {
        try {
            List<Notification> notifications = notificationService.getUnreadNotifications(userId);
            List<NotificationDTO> dtos = notifications.stream()
                    .map(n -> modelMapper.map(n, NotificationDTO.class))
                    .collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching unread notifications: " + e.getMessage());
        }
    }

    /**
     * Get unread notification count for user
     * GET /notifications/user/{userId}/unread-count
     */
    @GetMapping("/user/{userId}/unread-count")
    public ResponseEntity<?> getUnreadCount(@PathVariable String userId) {
        try {
            long count = notificationService.getUnreadCount(userId);
            return ResponseEntity.ok("{ \"unreadCount\": " + count + " }");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching unread count: " + e.getMessage());
        }
    }

    /**
     * Get notification by ID
     * GET /notifications/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getNotificationById(@PathVariable String id) {
        try {
            Notification notification = notificationService.getNotificationById(id);
            NotificationDTO dto = modelMapper.map(notification, NotificationDTO.class);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Notification not found: " + e.getMessage());
        }
    }

    /**
     * Mark notification as read
     * PUT /notifications/{id}/read
     */
    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable String id) {
        try {
            Notification notification = notificationService.markAsRead(id);
            NotificationDTO dto = modelMapper.map(notification, NotificationDTO.class);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Error marking notification as read: " + e.getMessage());
        }
    }

    /**
     * Mark all notifications as read for user
     * PUT /notifications/user/{userId}/read-all
     */
    @PutMapping("/user/{userId}/read-all")
    public ResponseEntity<?> markAllAsRead(@PathVariable String userId) {
        try {
            notificationService.markAllAsRead(userId);
            return ResponseEntity.ok("All notifications marked as read");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error marking all as read: " + e.getMessage());
        }
    }

    /**
     * Delete notification
     * DELETE /notifications/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotification(@PathVariable String id) {
        try {
            notificationService.deleteNotification(id);
            return ResponseEntity.ok("Notification deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Error deleting notification: " + e.getMessage());
        }
    }

    /**
     * Delete all notifications for user
     * DELETE /notifications/user/{userId}/all
     */
    @DeleteMapping("/user/{userId}/all")
    public ResponseEntity<?> deleteAllUserNotifications(@PathVariable String userId) {
        try {
            notificationService.deleteAllUserNotifications(userId);
            return ResponseEntity.ok("All notifications deleted for user");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error deleting notifications: " + e.getMessage());
        }
    }
}
