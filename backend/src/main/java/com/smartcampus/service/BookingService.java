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

    public BookingDTO createBooking(BookingDTO bookingDTO, String userId) {
        // Verify resource exists
        String resourceId = bookingDTO.getResourceId();
        if (!resourceRepository.existsById(resourceId)) {
            throw new ResourceNotFoundException("Resource not found");
        }

        // Verify user exists
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found");
        }

        // Check for conflicts
        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                resourceId,
                bookingDTO.getStartTime(),
                bookingDTO.getEndTime()
        );

        if (!conflicts.isEmpty()) {
            throw new BookingConflictException("Resource is already booked for the requested time slot");
        }

        Booking booking = Booking.builder()
                .resourceId(resourceId)
                .userId(userId)
                .startTime(bookingDTO.getStartTime())
                .endTime(bookingDTO.getEndTime())
                .purpose(bookingDTO.getPurpose())
                .expectedAttendees(bookingDTO.getExpectedAttendees())
                .status(BookingStatus.PENDING)
                .build();
        
        booking.onCreate();

        Booking saved = bookingRepository.save(booking);
        return convertToDTO(saved);
    }

    public BookingDTO getBookingById(String id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + id));
        return convertToDTO(booking);
    }

    public List<BookingDTO> getUserBookings(String userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found");
        }
        return bookingRepository.findByUserId(userId).stream()
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

    public BookingDTO approveBooking(String id, String approvalNotes) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        booking.setStatus(BookingStatus.APPROVED);
        booking.setApprovalNotes(approvalNotes);
        booking.onUpdate();
        Booking updated = bookingRepository.save(booking);

        // Send notification
        Resource resource = resourceRepository.findById(booking.getResourceId()).orElse(null);
        String resourceName = resource != null ? resource.getName() : "Resource";
        notificationService.createNotification(
                booking.getUserId(),
                NotificationType.BOOKING_APPROVED,
                "Booking Approved",
                "Your booking for " + resourceName + " has been approved"
        );

        return convertToDTO(updated);
    }

    public BookingDTO rejectBooking(String id, String rejectionReason) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectionReason(rejectionReason);
        booking.onUpdate();
        Booking updated = bookingRepository.save(booking);

        // Send notification
        notificationService.createNotification(
                booking.getUserId(),
                NotificationType.BOOKING_REJECTED,
                "Booking Rejected",
                "Your booking has been rejected. Reason: " + rejectionReason
        );

        return convertToDTO(updated);
    }

    public BookingDTO cancelBooking(String id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        booking.setStatus(BookingStatus.CANCELLED);
        booking.onUpdate();
        Booking updated = bookingRepository.save(booking);

        // Send notification
        Resource resource = resourceRepository.findById(booking.getResourceId()).orElse(null);
        String resourceName = resource != null ? resource.getName() : "Resource";
        notificationService.createNotification(
                booking.getUserId(),
                NotificationType.BOOKING_CANCELLED,
                "Booking Cancelled",
                "Your booking for " + resourceName + " has been cancelled"
        );

        return convertToDTO(updated);
    }

    private BookingDTO convertToDTO(Booking booking) {
        return BookingDTO.builder()
                .id(booking.getId())
                .resourceId(booking.getResourceId())
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

