package com.smartcampus.repository;

import com.smartcampus.model.Booking;
import com.smartcampus.model.BookingStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {
    List<Booking> findByUserId(String userId);

    List<Booking> findByStatus(BookingStatus status);

    List<Booking> findByResourceId(String resourceId);

    @Query("{ 'resourceId': ?0, 'status': { $ne: 'CANCELLED' }, $or: [ { 'startTime': { $lt: ?2 }, 'endTime': { $gt: ?1 } } ] }")
    List<Booking> findConflictingBookings(String resourceId, LocalDateTime startTime, LocalDateTime endTime);

    @Query("{ 'userId': ?0, 'status': { $in: ['PENDING', 'APPROVED'] } }")
    List<Booking> findActiveBookingsByUser(String userId);

    @Query("{ 'status': 'PENDING' } ")
    List<Booking> findPendingBookings();
}
