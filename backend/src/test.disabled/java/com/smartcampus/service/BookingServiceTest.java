package com.smartcampus.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.smartcampus.model.Booking;
import com.smartcampus.model.BookingStatus;
import com.smartcampus.repository.BookingRepository;

@ExtendWith(MockitoExtension.class)
@DisplayName("Booking Service Tests")
class BookingServiceTest {

  @Mock
  private BookingRepository bookingRepository;

  @InjectMocks
  private BookingService bookingService;

  private Booking testBooking;
  private String resourceId = "resource123";
  private String userId = "user123";

  @BeforeEach
  void setUp() {
    testBooking = new Booking();
    testBooking.setId(new org.bson.types.ObjectId().toString());
    testBooking.setResourceId(resourceId);
    testBooking.setUserId(userId);
    testBooking.setStartTime(LocalDateTime.of(2026, 4, 20, 10, 0));
    testBooking.setEndTime(LocalDateTime.of(2026, 4, 20, 11, 0));
    testBooking.setStatus(BookingStatus.PENDING);
    testBooking.setPurpose("Lab class");
    testBooking.setExpectedAttendees(25);
  }

  @Test
  @DisplayName("Should detect booking conflict")
  void testHasConflict_WithOverlappingTime() {
    // Arrange
    LocalDateTime newStart = LocalDateTime.of(2026, 4, 20, 10, 30);
    LocalDateTime newEnd = LocalDateTime.of(2026, 4, 20, 11, 30);

    when(bookingRepository.findByResourceIdAndStatusIn(
        resourceId,
        Arrays.asList(BookingStatus.APPROVED, BookingStatus.PENDING)
    )).thenReturn(Arrays.asList(testBooking));

    // Act
    boolean hasConflict = bookingService.hasConflict(resourceId, newStart, newEnd);

    // Assert
    assertTrue(hasConflict);
  }

  @Test
  @DisplayName("Should not detect conflict for non-overlapping times")
  void testHasConflict_NoOverlap() {
    // Arrange
    LocalDateTime newStart = LocalDateTime.of(2026, 4, 20, 12, 0);
    LocalDateTime newEnd = LocalDateTime.of(2026, 4, 20, 13, 0);

    when(bookingRepository.findByResourceIdAndStatusIn(
        resourceId,
        Arrays.asList(BookingStatus.APPROVED, BookingStatus.PENDING)
    )).thenReturn(Arrays.asList(testBooking));

    // Act
    boolean hasConflict = bookingService.hasConflict(resourceId, newStart, newEnd);

    // Assert
    assertFalse(hasConflict);
  }

  @Test
  @DisplayName("Should create booking")
  void testCreateBooking() {
    // Arrange
    when(bookingRepository.save(any(Booking.class))).thenReturn(testBooking);

    // Act
    Booking result = bookingService.createBooking(testBooking);

    // Assert
    assertNotNull(result);
    assertEquals(BookingStatus.PENDING, result.getStatus());
    assertEquals("Lab class", result.getPurpose());
    verify(bookingRepository, times(1)).save(any(Booking.class));
  }

  @Test
  @DisplayName("Should approve booking")
  void testApproveBooking() {
    // Arrange
    String adminId = "admin123";
    String approvalReason = "Approved for semester use";

    when(bookingRepository.findById(testBooking.getId())).thenReturn(Optional.of(testBooking));
    when(bookingRepository.save(any(Booking.class))).thenReturn(testBooking);

    // Act
    testBooking.setStatus(BookingStatus.APPROVED);
    testBooking.setApprovedBy(adminId);
    testBooking.setApprovalReason(approvalReason);

    Booking result = bookingService.updateBooking(testBooking.getId(), testBooking);

    // Assert
    assertEquals(BookingStatus.APPROVED, result.getStatus());
    assertEquals(adminId, result.getApprovedBy());
  }

  @Test
  @DisplayName("Should reject booking")
  void testRejectBooking() {
    // Arrange
    String rejectReason = "Resource not available";

    when(bookingRepository.findById(testBooking.getId())).thenReturn(Optional.of(testBooking));
    when(bookingRepository.save(any(Booking.class))).thenReturn(testBooking);

    // Act
    testBooking.setStatus(BookingStatus.REJECTED);
    testBooking.setApprovalReason(rejectReason);

    Booking result = bookingService.updateBooking(testBooking.getId(), testBooking);

    // Assert
    assertEquals(BookingStatus.REJECTED, result.getStatus());
    assertEquals(rejectReason, result.getApprovalReason());
  }

  @Test
  @DisplayName("Should cancel booking")
  void testCancelBooking() {
    // Arrange
    when(bookingRepository.findById(testBooking.getId())).thenReturn(Optional.of(testBooking));
    when(bookingRepository.save(any(Booking.class))).thenReturn(testBooking);

    // Act
    testBooking.setStatus(BookingStatus.CANCELLED);
    Booking result = bookingService.updateBooking(testBooking.getId(), testBooking);

    // Assert
    assertEquals(BookingStatus.CANCELLED, result.getStatus());
  }

  @Test
  @DisplayName("Should get user bookings")
  void testGetUserBookings() {
    // Arrange
    when(bookingRepository.findByUserId(userId)).thenReturn(Arrays.asList(testBooking));

    // Act
    List<Booking> result = bookingService.getBookingsByUser(userId);

    // Assert
    assertEquals(1, result.size());
    assertEquals(userId, result.get(0).getUserId());
    verify(bookingRepository, times(1)).findByUserId(userId);
  }

  @Test
  @DisplayName("Should get pending bookings")
  void testGetPendingBookings() {
    // Arrange
    when(bookingRepository.findByStatus(BookingStatus.PENDING)).thenReturn(Arrays.asList(testBooking));

    // Act
    List<Booking> result = bookingService.getPendingBookings();

    // Assert
    assertEquals(1, result.size());
    assertEquals(BookingStatus.PENDING, result.get(0).getStatus());
    verify(bookingRepository, times(1)).findByStatus(BookingStatus.PENDING);
  }
}
