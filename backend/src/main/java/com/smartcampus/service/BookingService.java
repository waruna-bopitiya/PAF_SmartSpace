package com.smartcampus.service;

import com.smartcampus.dto.BookingDTO;
import com.smartcampus.model.*;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.exception.BookingConflictException;
import com.smartcampus.repository.BookingRepository;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
@Transactional
public class BookingService {
    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public BookingDTO createBooking(BookingDTO bookingDTO, Long userId) {
        Resource resource = resourceRepository.findById(bookingDTO.getResourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Check for conflicts
        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                bookingDTO.getResourceId(),
                bookingDTO.getStartTime(),
                bookingDTO.getEndTime()
        );

        if (!conflicts.isEmpty()) {
            throw new BookingConflictException("Resource is already booked for the requested time slot");
        }

        Booking booking = Booking.builder()
                .resource(resource)
                .user(user)
                .startTime(bookingDTO.getStartTime())
                .endTime(bookingDTO.getEndTime())
                .purpose(bookingDTO.getPurpose())
                .expectedAttendees(bookingDTO.getExpectedAttendees())
                .status(BookingStatus.PENDING)
                .build();

        Booking saved = bookingRepository.save(booking);
        return convertToDTO(saved);
    }

    public BookingDTO getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + id));
        return convertToDTO(booking);
    }

    public List<BookingDTO> getUserBookings(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return bookingRepository.findByUser(user).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<BookingDTO> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<BookingDTO> getPendingBookings() {
        return bookingRepository.findPendingBookings().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public BookingDTO approveBooking(Long id, String approvalNotes) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        booking.setStatus(BookingStatus.APPROVED);
        booking.setApprovalNotes(approvalNotes);
        Booking updated = bookingRepository.save(booking);

        // Send notification
        notificationService.createNotification(
                booking.getUser().getId(),
                NotificationType.BOOKING_APPROVED,
                "Booking Approved",
                "Your booking for " + booking.getResource().getName() + " has been approved"
        );

        return convertToDTO(updated);
    }

    public BookingDTO rejectBooking(Long id, String rejectionReason) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectionReason(rejectionReason);
        Booking updated = bookingRepository.save(booking);

        // Send notification
        notificationService.createNotification(
                booking.getUser().getId(),
                NotificationType.BOOKING_REJECTED,
                "Booking Rejected",
                "Your booking has been rejected. Reason: " + rejectionReason
        );

        return convertToDTO(updated);
    }

    public BookingDTO cancelBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        booking.setStatus(BookingStatus.CANCELLED);
        Booking updated = bookingRepository.save(booking);

        // Send notification
        notificationService.createNotification(
                booking.getUser().getId(),
                NotificationType.BOOKING_CANCELLED,
                "Booking Cancelled",
                "Your booking for " + booking.getResource().getName() + " has been cancelled"
        );

        return convertToDTO(updated);
    }

    private BookingDTO convertToDTO(Booking booking) {
        return BookingDTO.builder()
                .id(booking.getId())
                .resourceId(booking.getResource().getId())
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .purpose(booking.getPurpose())
                .expectedAttendees(booking.getExpectedAttendees())
                .status(booking.getStatus().toString())
                .rejectionReason(booking.getRejectionReason())
                .approvalNotes(booking.getApprovalNotes())
                .build();
    }
}
