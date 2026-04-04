package com.smartcampus.service;

import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.*;
import com.smartcampus.repository.TicketCommentRepository;
import com.smartcampus.repository.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class TicketService {

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private TicketCommentRepository ticketCommentRepository;

    @Autowired
    private NotificationService notificationService;

    /**
     * Get all tickets with pagination
     */
    public Page<Ticket> getAllTickets(Pageable pageable) {
        return ticketRepository.findAll(pageable);
    }

    /**
     * Get ticket by ID
     */
    public Ticket getTicketById(String id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));
    }

    /**
     * Get tickets created by user
     */
    public List<Ticket> getTicketsByCreatedBy(String userId) {
        return ticketRepository.findByCreatedBy(userId);
    }

    /**
     * Get tickets assigned to user
     */
    public List<Ticket> getTicketsAssignedTo(String userId) {
        return ticketRepository.findByAssignedTo(userId);
    }

    /**
     * Get tickets by status
     */
    public List<Ticket> getTicketsByStatus(TicketStatus status) {
        return ticketRepository.findByStatus(status);
    }

    /**
     * Get tickets by priority
     */
    public List<Ticket> getTicketsByPriority(TicketPriority priority) {
        return ticketRepository.findByPriority(priority);
    }

    /**
     * Get open tickets
     */
    public List<Ticket> getOpenTickets() {
        return ticketRepository.findByStatus(TicketStatus.OPEN);
    }

    /**
     * Get tickets by resource ID
     */
    public List<Ticket> getTicketsByResourceId(String resourceId) {
        return ticketRepository.findByResourceId(resourceId);
    }

    /**
     * Create new ticket
     */
    public Ticket createTicket(Ticket ticket) {
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setLastResponseAt(LocalDateTime.now());
        return ticketRepository.save(ticket);
    }

    /**
     * Update ticket
     */
    public Ticket updateTicket(String id, Ticket ticketDetails) {
        Ticket ticket = getTicketById(id);
        
        if (ticketDetails.getTitle() != null) ticket.setTitle(ticketDetails.getTitle());
        if (ticketDetails.getDescription() != null) ticket.setDescription(ticketDetails.getDescription());
        if (ticketDetails.getCategory() != null) ticket.setCategory(ticketDetails.getCategory());
        if (ticketDetails.getPriority() != null) ticket.setPriority(ticketDetails.getPriority());
        if (ticketDetails.getLocation() != null) ticket.setLocation(ticketDetails.getLocation());
        
        ticket.onUpdate();
        return ticketRepository.save(ticket);
    }

    /**
     * Assign ticket to staff member
     */
    public Ticket assignTicket(String id, String technicianId) {
        Ticket ticket = getTicketById(id);
        ticket.setAssignedTo(technicianId);
        ticket.setStatus(TicketStatus.IN_PROGRESS);
        ticket.setLastResponseAt(LocalDateTime.now());
        ticket.onUpdate();
        
        Ticket savedTicket = ticketRepository.save(ticket);
        
        // Send notification to requester
        notificationService.createNotification(
                ticket.getCreatedBy(),
                ticket.getId(),
                "Ticket",
                NotificationType.TICKET_ASSIGNED,
                "Your ticket has been assigned",
                "A technician has been assigned to your ticket"
        );
        
        return savedTicket;
    }

    /**
     * Update ticket status
     */
    public Ticket updateTicketStatus(String id, TicketStatus status, String resolutionNotes) {
        Ticket ticket = getTicketById(id);
        ticket.setStatus(status);
        
        if (status == TicketStatus.RESOLVED) {
            ticket.setResolutionNotes(resolutionNotes);
            ticket.setResolvedDate(LocalDateTime.now());
        }
        
        ticket.setLastResponseAt(LocalDateTime.now());
        ticket.onUpdate();
        Ticket savedTicket = ticketRepository.save(ticket);
        
        // Send notification
        String notificationTitle = status == TicketStatus.IN_PROGRESS
            ? "Ticket moved to In Progress"
            : "Your ticket status has been updated";

        notificationService.createNotification(
            ticket.getCreatedBy(),
            ticket.getId(),
            "Ticket",
            NotificationType.TICKET_STATUS_CHANGED,
            notificationTitle,
            "Status: " + status.toString(),
            "/tickets?ticketId=" + ticket.getId()
        );
        
        return savedTicket;
    }

    /**
     * Reject ticket
     */
    public Ticket rejectTicket(String id, String rejectionReason) {
        Ticket ticket = getTicketById(id);
        ticket.setStatus(TicketStatus.REJECTED);
        ticket.setRejectionReason(rejectionReason);
        ticket.onUpdate();
        return ticketRepository.save(ticket);
    }

    /**
     * Close ticket
     */
    public Ticket closeTicket(String id) {
        Ticket ticket = getTicketById(id);
        ticket.setStatus(TicketStatus.CLOSED);
        ticket.setResolvedDate(LocalDateTime.now());
        ticket.setLastResponseAt(LocalDateTime.now());
        ticket.onUpdate();
        Ticket savedTicket = ticketRepository.save(ticket);

        // Notify ticket creator that work has been completed.
        notificationService.createNotification(
                ticket.getCreatedBy(),
                ticket.getId(),
                "Ticket",
                NotificationType.TICKET_STATUS_CHANGED,
                "Your ticket is done",
            "Ticket \"" + ticket.getTitle() + "\" has been marked as CLOSED by technician",
            "/tickets?ticketId=" + ticket.getId()
        );

        return savedTicket;
    }

    /**
     * Add comment to ticket
     */
    public TicketComment addComment(String ticketId, String userId, String userName, String userEmail, String content, Boolean staffComment) {
        Ticket ticket = getTicketById(ticketId);
        
        TicketComment comment = new TicketComment(ticketId, userId, userName, userEmail, content, staffComment);
        
        comment.onCreate();
        TicketComment savedComment = ticketCommentRepository.save(comment);
        
        // Add comment ID to ticket
        if (ticket.getCommentIds() == null) {
            ticket.setCommentIds(new java.util.ArrayList<>());
        }
        ticket.getCommentIds().add(savedComment.getId());
        ticket.setLastResponseAt(LocalDateTime.now());
        ticket.onUpdate();
        ticketRepository.save(ticket);
        
        // Send notification to other users
        if (!userId.equals(ticket.getCreatedBy())) {
            notificationService.createNotification(
                    ticket.getCreatedBy(),
                    ticket.getId(),
                    "Ticket",
                    NotificationType.NEW_COMMENT_ON_MY_TICKET,
                    "New comment on your ticket",
                    userName + " added a comment"
            );
        }
        
        return savedComment;
    }

    /**
     * Get comments for ticket
     */
    public List<TicketComment> getTicketComments(String ticketId) {
        return ticketCommentRepository.findByTicketId(ticketId);
    }

    /**
     * Delete comment from ticket
     */
    public void deleteComment(String ticketId, String commentId, String userId) {
        Ticket ticket = getTicketById(ticketId);
        TicketComment comment = ticketCommentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + commentId));
                
        if (!comment.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Only the author can delete this comment");
        }
        
        ticketCommentRepository.delete(comment);
        
        if (ticket.getCommentIds() != null) {
            ticket.getCommentIds().remove(commentId);
            ticket.onUpdate();
            ticketRepository.save(ticket);
        }
    }

    /**
     * Add attachment to ticket
     */
    public Ticket addAttachment(String ticketId, String attachmentId) {
        Ticket ticket = getTicketById(ticketId);
        
        if (ticket.getAttachmentIds() == null) {
            ticket.setAttachmentIds(new java.util.ArrayList<>());
        }
        ticket.getAttachmentIds().add(attachmentId);
        ticket.setLastResponseAt(LocalDateTime.now());
        ticket.onUpdate();
        
        return ticketRepository.save(ticket);
    }

    /**
     * Remove attachment from ticket
     */
    public Ticket removeAttachment(String ticketId, String attachmentId) {
        Ticket ticket = getTicketById(ticketId);
        
        if (ticket.getAttachmentIds() != null) {
            ticket.getAttachmentIds().remove(attachmentId);
            ticket.setLastResponseAt(LocalDateTime.now());
            ticket.onUpdate();
        }
        
        return ticketRepository.save(ticket);
    }

    /**
     * Delete ticket
     */
    public void deleteTicket(String id) {
        if (!ticketRepository.existsById(id)) {
            throw new ResourceNotFoundException("Ticket not found with id: " + id);
        }
        ticketRepository.deleteById(id);
    }
}
