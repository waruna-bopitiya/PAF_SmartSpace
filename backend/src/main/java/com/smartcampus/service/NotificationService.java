package com.smartcampus.service;

import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.Notification;
import com.smartcampus.model.NotificationType;
import com.smartcampus.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    /**
     * Get all notifications for user
     */
    public List<Notification> getUserNotifications(String userId) {
        return notificationRepository.findByUserId(userId);
    }

    /**
     * Get unread notifications for user
     */
    public List<Notification> getUnreadNotifications(String userId) {
        return notificationRepository.findByUserIdAndIsReadFalse(userId);
    }

    /**
     * Get notification by ID
     */
    public Notification getNotificationById(String id) {
        return notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + id));
    }

    /**
     * Create notification
     */
    public Notification createNotification(String userId, String relatedEntityId, String relatedEntityType,
                                          NotificationType type, String title, String message) {
        Notification notification = new Notification(userId, relatedEntityId, relatedEntityType, type, title, message, false);
        
        notification.onCreate();
        return notificationRepository.save(notification);
    }

    /**
     * Create notification with action URL
     */
    public Notification createNotification(String userId, String relatedEntityId, String relatedEntityType,
                                          NotificationType type, String title, String message, String actionUrl) {
        Notification notification = new Notification(userId, relatedEntityId, relatedEntityType, type, title, message, false);
        notification.setActionUrl(actionUrl);

        notification.onCreate();
        return notificationRepository.save(notification);
    }

    /**
     * Mark notification as read
     */
    public Notification markAsRead(String id) {
        Notification notification = getNotificationById(id);
        notification.setIsRead(true);
        notification.setReadAt(LocalDateTime.now());
        return notificationRepository.save(notification);
    }

    /**
     * Mark all notifications as read
     */
    public void markAllAsRead(String userId) {
        List<Notification> unreadNotifications = getUnreadNotifications(userId);
        for (Notification notification : unreadNotifications) {
            notification.setIsRead(true);
            notification.setReadAt(LocalDateTime.now());
            notificationRepository.save(notification);
        }
    }

    /**
     * Delete notification
     */
    public void deleteNotification(String id) {
        if (!notificationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Notification not found with id: " + id);
        }
        notificationRepository.deleteById(id);
    }

    /**
     * Delete all notifications for user
     */
    public void deleteAllUserNotifications(String userId) {
        List<Notification> notifications = getUserNotifications(userId);
        notificationRepository.deleteAll(notifications);
    }

    /**
     * Get notification count for user
     */
    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    /**
     * Broadcast notification to multiple users
     */
    public void broadcastNotification(List<String> userIds, String relatedEntityId, String relatedEntityType,
                                     NotificationType type, String title, String message) {
        for (String userId : userIds) {
            createNotification(userId, relatedEntityId, relatedEntityType, type, title, message);
        }
    }
}
