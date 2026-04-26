package com.smartcampus.controller;

import com.smartcampus.dto.BookingDTO;
import com.smartcampus.exception.BookingConflictException;
import com.smartcampus.model.Booking;
import com.smartcampus.model.BookingStatus;
import com.smartcampus.service.BookingService;
import jakarta.validation.Valid;  
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/bookings")
@CrossOrigin(origins = "http://localhost:3000")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private ModelMapper modelMapper;

    /**
     * Get all bookings with pagination
     * GET /bookings?page=0&size=10
     */
    @GetMapping
    public ResponseEntity<?> getAllBookings(@RequestParam(defaultValue = "0") int page,
                                           @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Booking> bookings = bookingService.getAllBookings(pageable);
            Page<BookingDTO> dtos = bookings.map(b -> modelMapper.map(b, BookingDTO.class));
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching bookings: " + e.getMessage());
        }
    }

    /**
     * Get booking by ID
     * GET /bookings/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getBookingById(@PathVariable String id) {
        try {
            Booking booking = bookingService.getBookingById(id);
            BookingDTO dto = modelMapper.map(booking, BookingDTO.class);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Booking not found: " + e.getMessage());
        }
    }

    /**
     * Get user's bookings
     * GET /bookings/user/{userId}
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserBookings(@PathVariable String userId) {
        try {
            List<Booking> bookings = bookingService.getBookingsByUserId(userId);
            List<BookingDTO> dtos = bookings.stream()
                    .map(b -> modelMapper.map(b, BookingDTO.class))
                    .collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching user bookings: " + e.getMessage());
        }
    }

    /**
     * Get pending bookings (for admin)
     * GET /bookings/pending
     */
    @GetMapping("/status/pending")
    public ResponseEntity<?> getPendingBookings() {
        try {
            List<Booking> bookings = bookingService.getPendingBookings();
            List<BookingDTO> dtos = bookings.stream()
                    .map(b -> modelMapper.map(b, BookingDTO.class))
                    .collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching pending bookings: " + e.getMessage());
        }
    }

    /**
     * Check for booking conflicts
     * GET /bookings/resource/{resourceId}/conflict?startTime=2026-04-18T10:00&endTime=2026-04-18T11:00
     */
    @GetMapping("/resource/{resourceId}/conflict")
    public ResponseEntity<?> checkBookingConflict(@PathVariable String resourceId,
                                                 @RequestParam LocalDateTime startTime,
                                                 @RequestParam LocalDateTime endTime) {
        try {
            boolean hasConflict = bookingService.hasConflict(resourceId, startTime, endTime, null);
            return ResponseEntity.ok(java.util.Map.of("hasConflict", hasConflict));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of("error", "Error checking conflict: " + e.getMessage()));
        }
    }

    /**
     * Create a new booking
     * POST /bookings
     */
    @PostMapping
    public ResponseEntity<?> createBooking(@Valid @RequestBody BookingDTO bookingDTO) {
        try {
            if (bookingDTO.getEndTime().isBefore(bookingDTO.getStartTime())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(java.util.Map.of("error", "End time cannot be before start time"));
            }

            Booking booking = modelMapper.map(bookingDTO, Booking.class);
            
            // Validate that all required fields are mapped
            if (booking.getResourceId() == null || booking.getResourceId().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(java.util.Map.of("error", "Resource ID is required"));
            }
            if (booking.getUserId() == null || booking.getUserId().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(java.util.Map.of("error", "User ID is required"));
            }
            
            Booking savedBooking = bookingService.createBooking(booking);
            BookingDTO responseDTO = modelMapper.map(savedBooking, BookingDTO.class);
            return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);
            
        } catch (BookingConflictException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(java.util.Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(java.util.Map.of("error", e.getMessage()));
        } catch (Exception e) {
            System.err.println("Error creating booking: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of("error", "Failed to create booking: " + e.getMessage()));
        }
    }

    /**
     * Approve booking
     * PUT /bookings/{id}/approve?approvedBy={userId}&reason={reason}
     ****/
    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveBooking(@PathVariable String id,
                                           @RequestParam String approvedBy,
                                           @RequestParam(required = false) String reason) {
        try {
            Booking approvedBooking = bookingService.approveBooking(id, approvedBy, reason);
            BookingDTO responseDTO = modelMapper.map(approvedBooking, BookingDTO.class);
            return ResponseEntity.ok(responseDTO);
        } catch (BookingConflictException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Cannot approve booking: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error approving booking: " + e.getMessage());
        }
    }

    /**
     * Reject booking
     * PUT /bookings/{id}/reject?reason={reason}
     */
    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectBooking(@PathVariable String id,
                                          @RequestParam String reason) {
        try {
            Booking rejectedBooking = bookingService.rejectBooking(id, reason);
            BookingDTO responseDTO = modelMapper.map(rejectedBooking, BookingDTO.class);
            return ResponseEntity.ok(responseDTO);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error rejecting booking: " + e.getMessage());
        }
    }

    /**
     * Cancel booking
     * PUT /bookings/{id}/cancel?reason={reason}
     */
    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelBooking(@PathVariable String id,
                                          @RequestParam(required = false) String reason) {
        try {
            String cancelReason = reason != null ? reason : "User cancelled the booking";
            Booking cancelledBooking = bookingService.cancelBooking(id, cancelReason);
            BookingDTO responseDTO = modelMapper.map(cancelledBooking, BookingDTO.class);
            return ResponseEntity.ok(responseDTO);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(java.util.Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of("error", "Error cancelling booking: " + e.getMessage()));
        }
    }

    /**
     * Update booking
     * PATCH /bookings/{id}
     */
    @PatchMapping("/{id}")
    public ResponseEntity<?> updateBooking(@PathVariable String id,
                                          @Valid @RequestBody BookingDTO bookingDTO) {
        try {
            Booking bookingDetails = modelMapper.map(bookingDTO, Booking.class);
            Booking updatedBooking = bookingService.updateBooking(id, bookingDetails);
            BookingDTO responseDTO = modelMapper.map(updatedBooking, BookingDTO.class);
            return ResponseEntity.ok(responseDTO);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Error updating booking: " + e.getMessage());
        }
    }

    /**
     * Get bookings by resource ID
     * GET /bookings/resource/{resourceId}
     */
    @GetMapping("/resource/{resourceId}")
    public ResponseEntity<?> getResourceBookings(@PathVariable String resourceId) {
        try {
            List<Booking> bookings = bookingService.getApprovedBookingsByResourceId(resourceId);
            List<BookingDTO> dtos = bookings.stream()
                    .map(b -> modelMapper.map(b, BookingDTO.class))
                    .collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching resource bookings: " + e.getMessage());
        }
    }
}
