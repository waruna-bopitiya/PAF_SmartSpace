package com.smartcampus.repository;

import com.smartcampus.model.BookingComment;
import com.smartcampus.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BookingCommentRepository extends JpaRepository<BookingComment, Long> {
    List<BookingComment> findByBooking(Booking booking);
}
