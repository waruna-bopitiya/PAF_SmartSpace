package com.smartcampus.repository;

import com.smartcampus.model.Notification;
import com.smartcampus.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
@SuppressWarnings("unused")
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUser(User user);

    List<Notification> findByUserAndIsReadFalse(User user);

    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId ORDER BY n.createdAt DESC")
    List<Notification> findByUserIdOrderByCreatedAtDesc(@Param("userId") Long userId);

    long countByUserAndIsReadFalse(User user);
}
