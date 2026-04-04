package com.smartcampus.service;

import com.smartcampus.dto.TicketDTO;
import com.smartcampus.model.*;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.repository.*;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
@Transactional
public class TicketService {
    private final TicketRepository ticketRepository;
    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;
    private final TicketCommentRepository ticketCommentRepository;
    private final TicketAttachmentRepository ticketAttachmentRepository;
    private final NotificationService notificationService;

    public TicketDTO createTicket(TicketDTO ticketDTO, String userId) {
        String resourceId = ticketDTO.getResourceId();
        
        // Verify resource exists
        if (!resourceRepository.existsById(resourceId)) {
            throw new ResourceNotFoundException("Resource not found");
        }

        // Verify user exists
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found");
        }

        String ticketNumber = "TKT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Ticket ticket = Ticket.builder()
                .ticketNumber(ticketNumber)
                .resourceId(resourceId)
                .createdById(userId)
                .category(TicketCategory.valueOf(ticketDTO.getCategory()))
                .description(ticketDTO.getDescription())
                .priority(TicketPriority.valueOf(ticketDTO.getPriority()))
                .status(TicketStatus.OPEN)
                .contactNumber(ticketDTO.getContactNumber())
                .build();
        
        ticket.onCreate();

        Ticket saved = ticketRepository.save(ticket);
        return convertToDTO(saved);
    }

    public TicketDTO getTicketById(String id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
        return convertToDTO(ticket);
    }

    public List<TicketDTO> getAllTickets() {
        return ticketRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<TicketDTO> getOpenTickets() {
        return ticketRepository.findOpenTickets().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public TicketDTO assignTicket(String id, String technicianId) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        if (!userRepository.existsById(technicianId)) {
            throw new ResourceNotFoundException("Technician not found");
        }

        ticket.setAssignedToId(technicianId);
        ticket.setStatus(TicketStatus.IN_PROGRESS);
        ticket.onUpdate();
        Ticket updated = ticketRepository.save(ticket);

        // Send notification
        notificationService.createNotification(
                technicianId,
                NotificationType.TICKET_ASSIGNED,
                "Ticket Assigned",
                "Ticket " + ticket.getTicketNumber() + " has been assigned to you"
        );

        return convertToDTO(updated);
    }

    public TicketDTO updateTicketStatus(String id, String status, String resolutionNotes) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        ticket.setStatus(TicketStatus.valueOf(status));
        if (resolutionNotes != null) {
            ticket.setResolutionNotes(resolutionNotes);
        }
        ticket.onUpdate();

        Ticket updated = ticketRepository.save(ticket);

        // Send notification
        notificationService.createNotification(
                ticket.getCreatedById(),
                NotificationType.TICKET_STATUS_CHANGED,
                "Ticket Status Updated",
                "Your ticket " + ticket.getTicketNumber() + " status has been updated to " + status
        );

        return convertToDTO(updated);
    }

    public TicketDTO rejectTicket(String id, String rejectionReason) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        ticket.setStatus(TicketStatus.REJECTED);
        ticket.setRejectionReason(rejectionReason);
        ticket.onUpdate();
        Ticket updated = ticketRepository.save(ticket);

        // Send notification
        notificationService.createNotification(
                ticket.getCreatedById(),
                NotificationType.TICKET_STATUS_CHANGED,
                "Ticket Rejected",
                "Your ticket has been rejected. Reason: " + rejectionReason
        );

        return convertToDTO(updated);
    }

    public TicketDTO addComment(String ticketId, String userId, String content) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found");
        }

        TicketComment comment = TicketComment.builder()
                .ticketId(ticketId)
                .userId(userId)
                .content(content)
                .build();
        
        comment.onCreate();

        TicketComment savedComment = ticketCommentRepository.save(comment);
        ticket.getCommentIds().add(savedComment.getId());
        ticketRepository.save(ticket);

        // Send notification to ticket creator if comment is from someone else
        if (!ticket.getCreatedById().equals(userId)) {
            User user = userRepository.findById(userId).orElse(null);
            String userName = user != null ? user.getFullName() : "User";
            notificationService.createNotification(
                    ticket.getCreatedById(),
                    NotificationType.COMMENT_ON_YOUR_TICKET,
                    "New Comment",
                    userName + " commented on your ticket " + ticket.getTicketNumber()
            );
        }

        return convertToDTO(ticket);
    }

    private TicketDTO convertToDTO(Ticket ticket) {
        return TicketDTO.builder()
                .id(ticket.getId())
                .ticketNumber(ticket.getTicketNumber())
                .resourceId(ticket.getResourceId())
                .category(ticket.getCategory().toString())
                .description(ticket.getDescription())
                .priority(ticket.getPriority().toString())
                .status(ticket.getStatus().toString())
                .contactNumber(ticket.getContactNumber())
                .resolutionNotes(ticket.getResolutionNotes())
                .rejectionReason(ticket.getRejectionReason())
                .assignedToId(ticket.getAssignedToId())
                .build();
    }
}
