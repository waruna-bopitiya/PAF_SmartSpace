package com.smartcampus.service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.logging.Logger;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.smartcampus.config.FileUploadConfig;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.TicketAttachment;
import com.smartcampus.repository.TicketAttachmentRepository;

@Service
public class FileUploadService {

  private static final Logger log = Logger.getLogger(FileUploadService.class.getName());

  @Autowired
  private TicketAttachmentRepository attachmentRepository;

  @Autowired
  private FileUploadConfig fileUploadConfig;

  private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private static final String[] ALLOWED_EXTENSIONS = { "jpg", "jpeg", "png", "gif", "pdf" };
  private static final String UPLOAD_DIR = "uploads/ticket-attachments";

  /**
   * Upload a file and save attachment metadata
   */
  public TicketAttachment uploadFile(MultipartFile file, String ticketId, String uploadedBy)
      throws IOException {

    validateFile(file);

    // Create attachment metadata
    TicketAttachment attachment = new TicketAttachment();
    attachment.setTicketId(ticketId);
    attachment.setFileName(file.getOriginalFilename());
    attachment.setFileType(file.getContentType());
    attachment.setFileSize(file.getSize());
    attachment.setUploadedBy(uploadedBy);
    attachment.setUploadedAt(LocalDateTime.now());
    attachment.setFileData(file.getBytes());

    return attachmentRepository.save(attachment);
  }

  /**
   * Delete a file and remove attachment metadata
   */
  public void deleteFile(String attachmentId) throws IOException {
    TicketAttachment attachment = attachmentRepository.findById(attachmentId)
        .orElseThrow(() -> new ResourceNotFoundException("Attachment not found"));

    // Delete metadata
    attachmentRepository.deleteById(attachmentId);
  }

  /**
   * Validate file before upload
   */
  private void validateFile(MultipartFile file) {
    if (file == null || file.isEmpty()) {
      throw new IllegalArgumentException("File is empty");
    }

    if (file.getSize() > MAX_FILE_SIZE) {
      throw new IllegalArgumentException("File size exceeds maximum allowed size of 5MB");
    }

    String fileExtension = getFileExtension(file.getOriginalFilename());
    boolean isAllowed = false;
    for (String ext : ALLOWED_EXTENSIONS) {
      if (ext.equalsIgnoreCase(fileExtension)) {
        isAllowed = true;
        break;
      }
    }

    if (!isAllowed) {
      throw new IllegalArgumentException("File type not allowed. Allowed types: " + String.join(", ", ALLOWED_EXTENSIONS));
    }
  }

  /**
   * Extract file extension
   */
  private String getFileExtension(String filename) {
    if (filename == null || !filename.contains(".")) {
      return "";
    }
    return filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
  }

  /**
   * Get file size in human-readable format
   */
  public static String formatFileSize(long size) {
    if (size <= 0)
      return "0 B";
    final String[] units = new String[] { "B", "KB", "MB", "GB", "TB" };
    int digitGroups = (int) (Math.log10(size) / Math.log10(1024));
    return String.format("%.1f %s", size / Math.pow(1024, digitGroups), units[digitGroups]);
  }
}
