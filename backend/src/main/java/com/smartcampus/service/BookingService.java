package com.smartcampus.service;

import com.smartcampus.exception.BookingConflictException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.Booking;
import com.smartcampus.model.BookingStatus;
import com.smartcampus.model.Notification;
import com.smartcampus.model.NotificationType;
import com.smartcampus.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private NotificationService notificationService;

    /**
     * Get all bookings with pagination
     */
    public Page<Booking> getAllBookings(Pageable pageable) {
        return bookingRepository.findAll(pageable);
    }

    /**
     * Get booking by ID
     */
    public Booking getBookingById(String id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
    }

    /**
     * Get bookings by user ID
     */
    public List<Booking> getBookingsByUserId(String userId) {
        return bookingRepository.findByUserId(userId);
    }

    /**
     * Get bookings by resource ID
     */
    public List<Booking> getBookingsByResourceId(String resourceId) {
        return bookingRepository.findByResourceId(resourceId);
    }

    /**
     * Get bookings by resource ID and status
     */
    public List<Booking> getApprovedBookingsByResourceId(String resourceId) {
        return bookingRepository.findByResourceIdAndStatus(resourceId, BookingStatus.APPROVED);
    }

    /**
     * Check for booking conflicts
     */
    public boolean hasConflict(String resourceId, LocalDateTime startTime, LocalDateTime endTime, String excludeBookingId) {
        List<Booking> approvedBookings = bookingRepository.findByResourceIdAndStatus(resourceId, BookingStatus.APPROVED);
        List<Booking> pendingBookings = bookingRepository.findByResourceIdAndStatus(resourceId, BookingStatus.PENDING);
        
        List<Booking> activeBookings = new ArrayList<>();
        activeBookings.addAll(approvedBookings);
        activeBookings.addAll(pendingBookings);
        
        for (Booking booking : activeBookings) {
            if (excludeBookingId != null && booking.getId() != null && booking.getId().equals(excludeBookingId)) {
                continue;
            }
            // Check if times overlap (start is before other ends AND end is after other starts)
            if (startTime.isBefore(booking.getEndTime()) && endTime.isAfter(booking.getStartTime())) {
                return true;
            }
        }
        return false;
    }

    /**
     * Create new booking
     */
    public Booking createBooking(Booking booking) {
        try {
            // Validate input
            if (booking.getResourceId() == null || booking.getResourceId().trim().isEmpty()) {
                throw new IllegalArgumentException("Resource ID is required");
            }
            if (booking.getUserId() == null || booking.getUserId().trim().isEmpty()) {
                throw new IllegalArgumentException("User ID is required");
            }
            if (booking.getStartTime() == null) {
                throw new IllegalArgumentException("Start time is required");
            }
            if (booking.getEndTime() == null) {
                throw new IllegalArgumentException("End time is required");
            }
            if (booking.getEndTime().isBefore(booking.getStartTime()) || booking.getEndTime().isEqual(booking.getStartTime())) {
                throw new IllegalArgumentException("End time must be after start time");
            }
            
            // Time restrictions: booking must be within the same day
            LocalDate startDate = booking.getStartTime().toLocalDate();
            LocalDate endDate = booking.getEndTime().toLocalDate();
            if (!startDate.isEqual(endDate)) {
                throw new IllegalArgumentException("Booking must be within the same day");
            }
            
            // Time restrictions: 7:45 AM to 8:30 PM
            LocalTime startTimeLocal = booking.getStartTime().toLocalTime();
            LocalTime endTimeLocal = booking.getEndTime().toLocalTime();
            LocalTime openTime = LocalTime.of(7, 45);
            LocalTime closeTime = LocalTime.of(20, 30);
            
            if (startTimeLocal.isBefore(openTime)) {
                throw new IllegalArgumentException("Bookings cannot start before 7:45 AM");
            }
            if (endTimeLocal.isAfter(closeTime)) {
                throw new IllegalArgumentException("Bookings cannot end after 8:30 PM");
            }
            
            // Check for conflicts
            if (hasConflict(booking.getResourceId(), booking.getStartTime(), booking.getEndTime(), null)) {
                throw new BookingConflictException("Time slot is already booked for this resource");
            }
            
            // Initialize timestamps and status
            booking.onCreate();
            booking.setStatus(BookingStatus.PENDING);
            
            Booking savedBooking = bookingRepository.save(booking);
            return savedBooking;
        } catch (BookingConflictException e) {
            throw e;
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Error creating booking: " + e.getMessage(), e);
        }
    }

    /**
     * Approve booking
     */
    public Booking approveBooking(String id, String approvedBy, String reason) {
        Booking booking = getBookingById(id);
        
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalArgumentException("Only pending bookings can be approved");
        }
        
        // Check for conflicts again
        if (hasConflict(booking.getResourceId(), booking.getStartTime(), booking.getEndTime(), id)) {
            throw new BookingConflictException("Time slot is no longer available");
        }
        
        booking.setStatus(BookingStatus.APPROVED);
        booking.setApprovedBy(approvedBy);
        booking.setApprovalDate(LocalDateTime.now());
        booking.setApprovalReason(reason);
        booking.onUpdate();
        Booking savedBooking = bookingRepository.save(booking);
        
        // Send notification
        notificationService.createNotification(
                booking.getUserId(),
                booking.getId(),
                "Booking",
                NotificationType.BOOKING_APPROVED,
                "Your booking has been approved",
                "Your booking has been approved for the requested time slot"
        );
        
        return savedBooking;
    }

    /**
     * Reject booking
     */
    public Booking rejectBooking(String id, String rejectionReason) {
        Booking booking = getBookingById(id);
        
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalArgumentException("Only pending bookings can be rejected");
        }
        
        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectionReason(rejectionReason);
        booking.onUpdate();
        Booking savedBooking = bookingRepository.save(booking);
        
        // Send notification
        notificationService.createNotification(
                booking.getUserId(),
                booking.getId(),
                "Booking",
                NotificationType.BOOKING_REJECTED,
                "Your booking has been rejected",
                "Reason: " + rejectionReason
        );
        
        return savedBooking;
    }

    /**
     * Cancel booking
     */
    public Booking cancelBooking(String id, String cancellationReason) {
        Booking booking = getBookingById(id);
        
        // Allow cancelling PENDING or APPROVED bookings
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new IllegalArgumentException("Booking is already cancelled");
        }
        if (booking.getStatus() == BookingStatus.REJECTED) {
            throw new IllegalArgumentException("Cannot cancel a rejected booking");
        }
        
        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancellationReason(cancellationReason);
        booking.onUpdate();
        Booking savedBooking = bookingRepository.save(booking);
        
        // Send notification
        notificationService.createNotification(
                booking.getUserId(),
                booking.getId(),
                "Booking",
                NotificationType.BOOKING_CANCELLED,
                "Your booking has been cancelled",
                "Reason: " + cancellationReason
        );
        
        return savedBooking;
    }

    /**
     * Get pending bookings
     */
    public List<Booking> getPendingBookings() {
        return bookingRepository.findByStatus(BookingStatus.PENDING);
    }

    /**
     * Get bookings by status
     */
    public List<Booking> getBookingsByStatus(BookingStatus status) {
        return bookingRepository.findByStatus(status);
    }

    /**
     * Update booking
     */
    public Booking updateBooking(String id, Booking bookingDetails) {
        Booking booking = getBookingById(id);
        
        // Update status if provided
        if (bookingDetails.getStatus() != null) {
            BookingStatus newStatus = bookingDetails.getStatus();
            BookingStatus currentStatus = booking.getStatus();
            
            // Validate status transitions
            if (currentStatus == BookingStatus.CANCELLED || currentStatus == BookingStatus.REJECTED) {
                throw new IllegalArgumentException("Cannot update a " + currentStatus.name().toLowerCase() + " booking");
            }
            
            // Handle transitions
            switch (newStatus) {
                case APPROVED:
                    if (currentStatus != BookingStatus.PENDING) {
                        throw new IllegalArgumentException("Only PENDING bookings can be approved");
                    }
                    // Check for conflicts
                    if (hasConflict(booking.getResourceId(), booking.getStartTime(), booking.getEndTime(), id)) {
                        throw new BookingConflictException("Time slot is no longer available");
                    }
                    booking.setApprovalDate(LocalDateTime.now());
                    break;
                case REJECTED:
                    if (currentStatus != BookingStatus.PENDING) {
                        throw new IllegalArgumentException("Only PENDING bookings can be rejected");
                    }
                    break;
                case CANCELLED:
                    if (currentStatus == BookingStatus.CANCELLED) {
                        throw new IllegalArgumentException("Booking is already cancelled");
                    }
                    break;
                case PENDING:
                    // Can stay pending
                    break;
                default:
                    throw new IllegalArgumentException("Invalid status: " + newStatus);
            }
            booking.setStatus(newStatus);
        }
        
        if (bookingDetails.getPurpose() != null) booking.setPurpose(bookingDetails.getPurpose());
        if (bookingDetails.getExpectedAttendees() > 0) booking.setExpectedAttendees(bookingDetails.getExpectedAttendees());
        
        booking.onUpdate();
        return bookingRepository.save(booking);
    }
}
