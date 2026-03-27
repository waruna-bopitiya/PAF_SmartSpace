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

    public TicketDTO createTicket(TicketDTO ticketDTO, Long userId) {
        Resource resource = resourceRepository.findById(ticketDTO.getResourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found"));

        User creator = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String ticketNumber = "TKT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Ticket ticket = Ticket.builder()
                .ticketNumber(ticketNumber)
                .resource(resource)
                .createdBy(creator)
                .category(TicketCategory.valueOf(ticketDTO.getCategory()))
                .description(ticketDTO.getDescription())
                .priority(TicketPriority.valueOf(ticketDTO.getPriority()))
                .status(TicketStatus.OPEN)
                .contactNumber(ticketDTO.getContactNumber())
                .build();

        Ticket saved = ticketRepository.save(ticket);
        return convertToDTO(saved);
    }

    public TicketDTO getTicketById(Long id) {
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

    public TicketDTO assignTicket(Long id, Long technicianId) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        User technician = userRepository.findById(technicianId)
                .orElseThrow(() -> new ResourceNotFoundException("Technician not found"));

        ticket.setAssignedTo(technician);
        ticket.setStatus(TicketStatus.IN_PROGRESS);
        Ticket updated = ticketRepository.save(ticket);

        // Send notification
        notificationService.createNotification(
                technician.getId(),
                NotificationType.TICKET_ASSIGNED,
                "Ticket Assigned",
                "Ticket " + ticket.getTicketNumber() + " has been assigned to you"
        );

        return convertToDTO(updated);
    }

    public TicketDTO updateTicketStatus(Long id, String status, String resolutionNotes) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        ticket.setStatus(TicketStatus.valueOf(status));
        if (resolutionNotes != null) {
            ticket.setResolutionNotes(resolutionNotes);
        }

        Ticket updated = ticketRepository.save(ticket);

        // Send notification
        notificationService.createNotification(
                ticket.getCreatedBy().getId(),
                NotificationType.TICKET_STATUS_CHANGED,
                "Ticket Status Updated",
                "Your ticket " + ticket.getTicketNumber() + " status has been updated to " + status
        );

        return convertToDTO(updated);
    }

    public TicketDTO rejectTicket(Long id, String rejectionReason) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        ticket.setStatus(TicketStatus.REJECTED);
        ticket.setRejectionReason(rejectionReason);
        Ticket updated = ticketRepository.save(ticket);

        // Send notification
        notificationService.createNotification(
                ticket.getCreatedBy().getId(),
                NotificationType.TICKET_STATUS_CHANGED,
                "Ticket Rejected",
                "Your ticket has been rejected. Reason: " + rejectionReason
        );

        return convertToDTO(updated);
    }

    public TicketDTO addComment(Long ticketId, Long userId, String content) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        TicketComment comment = TicketComment.builder()
                .ticket(ticket)
                .user(user)
                .content(content)
                .build();

        ticketCommentRepository.save(comment);

        // Send notification to ticket creator if comment is from someone else
        if (!ticket.getCreatedBy().getId().equals(userId)) {
            notificationService.createNotification(
                    ticket.getCreatedBy().getId(),
                    NotificationType.COMMENT_ON_YOUR_TICKET,
                    "New Comment",
                    user.getFullName() + " commented on your ticket " + ticket.getTicketNumber()
            );
        }

        return convertToDTO(ticket);
    }

    private TicketDTO convertToDTO(Ticket ticket) {
        return TicketDTO.builder()
                .id(ticket.getId())
                .ticketNumber(ticket.getTicketNumber())
                .resourceId(ticket.getResource().getId())
                .category(ticket.getCategory().toString())
                .description(ticket.getDescription())
                .priority(ticket.getPriority().toString())
                .status(ticket.getStatus().toString())
                .contactNumber(ticket.getContactNumber())
                .resolutionNotes(ticket.getResolutionNotes())
                .rejectionReason(ticket.getRejectionReason())
                .assignedToId(ticket.getAssignedTo() != null ? ticket.getAssignedTo().getId() : null)
                .build();
    }
}
