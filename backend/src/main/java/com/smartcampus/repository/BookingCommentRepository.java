package com.smartcampus.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.smartcampus.model.BookingComment;

@Repository
public interface BookingCommentRepository extends MongoRepository<BookingComment, String> {
    List<BookingComment> findByBookingId(String bookingId);
    List<BookingComment> findByUserId(String userId);
}
