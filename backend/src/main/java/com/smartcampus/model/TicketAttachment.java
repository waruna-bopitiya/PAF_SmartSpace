package com.smartcampus.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "ticket_attachments")
public class TicketAttachment {
    @Id
    private String id;

    private String ticketId;

    private String fileName;

    private String fileType;

    private long fileSize;

    private String uploadedBy;

    private LocalDateTime uploadedAt;

    private String fileUrl;

    private byte[] fileData;

    public TicketAttachment() {
    }

    public TicketAttachment(String id, String ticketId, String fileName, String fileType,
            long fileSize, String uploadedBy, LocalDateTime uploadedAt, byte[] fileData) {
        this.id = id;
        this.ticketId = ticketId;
        this.fileName = fileName;
        this.fileType = fileType;
        this.fileSize = fileSize;
        this.uploadedBy = uploadedBy;
        this.uploadedAt = uploadedAt;
        this.fileData = fileData;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTicketId() {
        return ticketId;
    }

    public void setTicketId(String ticketId) {
        this.ticketId = ticketId;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }



    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public long getFileSize() {
        return fileSize;
    }

    public void setFileSize(long fileSize) {
        this.fileSize = fileSize;
    }

    public String getUploadedBy() {
        return uploadedBy;
    }

    public void setUploadedBy(String uploadedBy) {
        this.uploadedBy = uploadedBy;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }

    public byte[] getFileData() {
        return fileData;
    }

    public void setFileData(byte[] fileData) {
        this.fileData = fileData;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }

    public void onCreate() {
        this.uploadedAt = LocalDateTime.now();
    }
}
