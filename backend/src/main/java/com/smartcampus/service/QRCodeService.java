package com.smartcampus.service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;

import org.springframework.stereotype.Service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.MultiFormatWriter;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.smartcampus.model.Booking;

@Service
public class QRCodeService {

    private static final int QR_CODE_SIZE = 300;

    /**
     * Generate a QR code for a booking
     * The QR code contains the booking ID which can be used to verify the booking
     */
    public String generateQRCode(String bookingId, String resourceId, String userId) {
        try {
            // Create data string with booking details
            // Format: bookingId|resourceId|userId
            String qrData = String.format("BOOKING_VERIFY|%s|%s|%s", bookingId, resourceId, userId);
            
            // Generate QR code
            BitMatrix bitMatrix = new MultiFormatWriter().encode(
                    qrData,
                    BarcodeFormat.QR_CODE,
                    QR_CODE_SIZE,
                    QR_CODE_SIZE
            );

            // Convert to PNG image in memory
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);
            byte[] imageBytes = outputStream.toByteArray();

            // Encode to Base64
            String base64Image = Base64.getEncoder().encodeToString(imageBytes);
            return "data:image/png;base64," + base64Image;
        } catch (WriterException | IOException e) {
            throw new RuntimeException("Error generating QR code: " + e.getMessage(), e);
        }
    }

    /**
     * Generate QR code from an existing booking
     */
    public String generateQRCodeFromBooking(Booking booking) {
        return generateQRCode(booking.getId(), booking.getResourceId(), booking.getUserId());
    }

    /**
     * Verify a QR code by decoding the booking information
     * Returns the booking ID if valid, null otherwise
     */
    public QRCodeData verifyQRCode(String qrCodeData) {
        try {
            // QR code data is in format: BOOKING_VERIFY|bookingId|resourceId|userId
            if (!qrCodeData.startsWith("BOOKING_VERIFY|")) {
                return null;
            }

            String[] parts = qrCodeData.split("\\|");
            if (parts.length != 4) {
                return null;
            }

            return new QRCodeData(
                    parts[1],  // bookingId
                    parts[2],  // resourceId
                    parts[3]   // userId
            );
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Data class for decoded QR code information
     */
    public static class QRCodeData {
        private final String bookingId;
        private final String resourceId;
        private final String userId;

        public QRCodeData(String bookingId, String resourceId, String userId) {
            this.bookingId = bookingId;
            this.resourceId = resourceId;
            this.userId = userId;
        }

        public String getBookingId() { return bookingId; }
        public String getResourceId() { return resourceId; }
        public String getUserId() { return userId; }
    }
}
