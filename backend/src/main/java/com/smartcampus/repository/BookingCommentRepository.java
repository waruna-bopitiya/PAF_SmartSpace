package com.smartcampus.repository;

import com.smartcampus.model.BookingComment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BookingCommentRepository extends MongoRepository<BookingComment, String> {
    List<BookingComment> findByBookingId(String bookingId);
    List<BookingComment> findByUserId(String userId);
}
