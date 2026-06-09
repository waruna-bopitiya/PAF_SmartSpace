package com.smartcampus.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
  
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.smartcampus.dto.BookingDTO;
import com.smartcampus.exception.BookingConflictException;
import com.smartcampus.model.Booking;
import com.smartcampus.service.BookingService;
import com.smartcampus.service.QRCodeService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/bookings")
@CrossOrigin(origins = "http://localhost:3000")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private QRCodeService qrCodeService;

    /**
     * Get all bookings with pagination
     * GET /bookings?page=0&size=10
     */
    @GetMapping
    public ResponseEntity<?> getAllBookings(@RequestParam(defaultValue = "0") int page,
                                           @RequestParam(defaultValue = "100") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size, org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "id"));
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
     * Delete booking
     * DELETE /bookings/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBooking(@PathVariable String id) {
        try {
            bookingService.deleteBooking(id);
            return ResponseEntity.ok(java.util.Map.of("message", "Booking deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of("error", "Error deleting booking: " + e.getMessage()));
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

    /**
     * Get QR code for a booking
     * GET /bookings/{id}/qr-code
     */
    @GetMapping("/{id}/qr-code")
    public ResponseEntity<?> getQRCode(@PathVariable String id) {
        try {
            System.out.println("[QR Code API] Received request for booking ID: " + id);
            
            Booking booking = bookingService.getBookingById(id);
            System.out.println("[QR Code API] Booking found: " + booking.getId());
            
            if (booking.getQrCode() == null) {
                System.out.println("[QR Code API] QR code not present, generating...");
                // Generate QR code if not already generated
                String qrCode = qrCodeService.generateQRCodeFromBooking(booking);
                booking.setQrCode(qrCode);
                booking.onUpdate();
                bookingService.updateBooking(id, booking);
                System.out.println("[QR Code API] QR code generated successfully");
            } else {
                System.out.println("[QR Code API] QR code already exists, returning cached version");
            }
            
            System.out.println("[QR Code API] Returning QR code response");
            return ResponseEntity.ok(java.util.Map.of("qrCode", booking.getQrCode()));
        } catch (Exception e) {
            System.err.println("[QR Code API] Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(java.util.Map.of("error", "Error retrieving QR code: " + e.getMessage()));
        }
    }

    /**
     * Verify booking using QR code data
     * POST /bookings/verify-qr
     * Request body: { "qrData": "BOOKING_VERIFY|bookingId|resourceId|userId" }
     */
    @PostMapping("/verify-qr")
    public ResponseEntity<?> verifyQRCode(@RequestBody java.util.Map<String, String> requestBody) {
        try {
            String qrData = requestBody.get("qrData");
            if (qrData == null || qrData.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(java.util.Map.of("error", "QR data is required"));
            }

            // Verify the QR code
            QRCodeService.QRCodeData qrCodeData = qrCodeService.verifyQRCode(qrData);
            if (qrCodeData == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(java.util.Map.of("error", "Invalid QR code format"));
            }

            // Get the booking
            Booking booking = bookingService.getBookingById(qrCodeData.getBookingId());
            
            // Verify the booking details match
            if (!booking.getResourceId().equals(qrCodeData.getResourceId()) || 
                !booking.getUserId().equals(qrCodeData.getUserId())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(java.util.Map.of("error", "QR code does not match booking details"));
            }

            // Mark as verified (only if not already verified)
            if (!booking.isQrCodeVerified()) {
                booking.setQrCodeVerified(true);
                booking.setQrCodeVerificationTime(LocalDateTime.now());
                booking.onUpdate();
                bookingService.updateBooking(booking.getId(), booking);
            }

            BookingDTO responseDTO = modelMapper.map(booking, BookingDTO.class);
            return ResponseEntity.ok(java.util.Map.of(
                    "message", "Booking verified successfully",
                    "booking", responseDTO,
                    "verified", true,
                    "verificationTime", booking.getQrCodeVerificationTime()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of("error", "Error verifying QR code: " + e.getMessage()));
        }
    }

    /**
     * Get verification status of a booking
     * GET /bookings/{id}/verification-status
     */
    @GetMapping("/{id}/verification-status")
    public ResponseEntity<?> getVerificationStatus(@PathVariable String id) {
        try {
            Booking booking = bookingService.getBookingById(id);
            return ResponseEntity.ok(java.util.Map.of(
                    "bookingId", booking.getId(),
                    "verified", booking.isQrCodeVerified(),
                    "verificationTime", booking.getQrCodeVerificationTime(),
                    "status", booking.getStatus()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(java.util.Map.of("error", "Booking not found: " + e.getMessage()));
        }
    }
}
