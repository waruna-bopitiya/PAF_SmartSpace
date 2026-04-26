package com.smartcampus.controller;

import com.smartcampus.dto.CommentDTO;
import com.smartcampus.dto.TicketDTO;
import com.smartcampus.model.Ticket;
import com.smartcampus.model.TicketComment;
import com.smartcampus.model.TicketPriority;
import com.smartcampus.model.TicketStatus;
import com.smartcampus.service.TicketService;
import jakarta.validation.Valid;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.TicketAttachment;
import com.smartcampus.service.FileUploadService;

@RestController
@RequestMapping("/tickets")
@CrossOrigin(origins = "http://localhost:3000")
public class TicketController {

    @Autowired
    private TicketService ticketService;

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private FileUploadService fileUploadService;

    /**
     * Get all tickets with pagination
     * GET /tickets?page=0&size=10
     */
    @GetMapping
    public ResponseEntity<?> getAllTickets(@RequestParam(defaultValue = "0") int page,
                                          @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Ticket> tickets = ticketService.getAllTickets(pageable);
            Page<TicketDTO> dtos = tickets.map(t -> modelMapper.map(t, TicketDTO.class));
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching tickets: " + e.getMessage());
        }
    }

    /**
     * Get tickets created by user
     * GET /tickets/created-by/{userId}
     */
    @GetMapping("/created-by/{userId}")
    public ResponseEntity<?> getTicketsByCreatedBy(@PathVariable String userId) {
        try {
            List<Ticket> tickets = ticketService.getTicketsByCreatedBy(userId);
            List<TicketDTO> dtos = tickets.stream()
                    .map(t -> modelMapper.map(t, TicketDTO.class))
                    .collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching user tickets: " + e.getMessage());
        }
    }

    /**
     * Get tickets assigned to user (for technicians)
     * GET /tickets/assigned-to/{userId}
     */
    @GetMapping("/assigned-to/{userId}")
    public ResponseEntity<?> getTicketsAssignedTo(@PathVariable String userId) {
        try {
            List<Ticket> tickets = ticketService.getTicketsAssignedTo(userId);
            List<TicketDTO> dtos = tickets.stream()
                    .map(t -> modelMapper.map(t, TicketDTO.class))
                    .collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching assigned tickets: " + e.getMessage());
        }
    }

    /**
     * Get open tickets
     * GET /tickets/status/open
     */
    @GetMapping("/status/open")
    public ResponseEntity<?> getOpenTickets() {
        try {
            List<Ticket> tickets = ticketService.getOpenTickets();
            List<TicketDTO> dtos = tickets.stream()
                    .map(t -> modelMapper.map(t, TicketDTO.class))
                    .collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching open tickets: " + e.getMessage());
        }
    }

    /**
     * Get tickets by resource ID
     * GET /tickets/resource/{resourceId}
     */
    @GetMapping("/resource/{resourceId}")
    public ResponseEntity<?> getTicketsByResourceId(@PathVariable String resourceId) {
        try {
            List<Ticket> tickets = ticketService.getTicketsByResourceId(resourceId);
            List<TicketDTO> dtos = tickets.stream()
                    .map(t -> modelMapper.map(t, TicketDTO.class))
                    .collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching resource tickets: " + e.getMessage());
        }
    }

    /**
     * Get ticket by ID (must be after specific routes like /status/open and /resource/{resourceId})
     * GET /tickets/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getTicketById(@PathVariable String id) {
        try {
            Ticket ticket = ticketService.getTicketById(id);
            TicketDTO dto = modelMapper.map(ticket, TicketDTO.class);
            return ResponseEntity.ok(dto);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("{\"error\": \"Ticket not found\", \"message\": \"" + e.getMessage() + "\"}");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"error\": \"Error fetching ticket\", \"message\": \"" + e.getMessage() + "\"}");
        }
    }

    /**
     * Create new ticket
     * POST /tickets
     */
    @PostMapping
    public ResponseEntity<?> createTicket(@Valid @RequestBody TicketDTO ticketDTO) {
        try {
            Ticket ticket = modelMapper.map(ticketDTO, Ticket.class);
            Ticket savedTicket = ticketService.createTicket(ticket);
            TicketDTO responseDTO = modelMapper.map(savedTicket, TicketDTO.class);
            return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error creating ticket: " + e.getMessage());
        }
    }

    /**
     * Update ticket
     * PATCH /tickets/{id}
     */
    @PatchMapping("/{id}")
    public ResponseEntity<?> updateTicket(@PathVariable String id,
                                         @Valid @RequestBody TicketDTO ticketDTO) {
        try {
            Ticket ticketDetails = modelMapper.map(ticketDTO, Ticket.class);
            Ticket updatedTicket = ticketService.updateTicket(id, ticketDetails);
            TicketDTO responseDTO = modelMapper.map(updatedTicket, TicketDTO.class);
            return ResponseEntity.ok(responseDTO);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Error updating ticket: " + e.getMessage());
        }
    }

    /**
     * Assign ticket to technician
     * PUT /tickets/{id}/assign?technicianId={technicianId}
     */
    @PutMapping("/{id}/assign")
    public ResponseEntity<?> assignTicket(@PathVariable String id,
                                         @RequestParam String technicianId) {
        try {
            Ticket assignedTicket = ticketService.assignTicket(id, technicianId);
            TicketDTO responseDTO = modelMapper.map(assignedTicket, TicketDTO.class);
            return ResponseEntity.ok(responseDTO);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error assigning ticket: " + e.getMessage());
        }
    }

    /**
     * Update ticket status
     * PUT /tickets/{id}/status?status=IN_PROGRESS&resolutionNotes={notes}
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateTicketStatus(@PathVariable String id,
                                               @RequestParam String status,
                                               @RequestParam(required = false) String resolutionNotes) {
        try {
            TicketStatus ticketStatus = TicketStatus.fromString(status);
            Ticket updatedTicket = ticketService.updateTicketStatus(id, ticketStatus, resolutionNotes);
            TicketDTO responseDTO = modelMapper.map(updatedTicket, TicketDTO.class);
            return ResponseEntity.ok(responseDTO);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error updating ticket status: " + e.getMessage());
        }
    }

    /**
     * Reject ticket
     * PUT /tickets/{id}/reject?reason={reason}
     */
    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectTicket(@PathVariable String id,
                                         @RequestParam String reason) {
        try {
            Ticket rejectedTicket = ticketService.rejectTicket(id, reason);
            TicketDTO responseDTO = modelMapper.map(rejectedTicket, TicketDTO.class);
            return ResponseEntity.ok(responseDTO);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error rejecting ticket: " + e.getMessage());
        }
    }

    /**
     * Close ticket
     * PUT /tickets/{id}/close
     */
    @PutMapping("/{id}/close")
    public ResponseEntity<?> closeTicket(@PathVariable String id) {
        try {
            Ticket closedTicket = ticketService.closeTicket(id);
            TicketDTO responseDTO = modelMapper.map(closedTicket, TicketDTO.class);
            return ResponseEntity.ok(responseDTO);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error closing ticket: " + e.getMessage());
        }
    }

    /**
     * Add comment to ticket
     * POST /tickets/{id}/comments
     */
    @PostMapping("/{id}/comments")
    public ResponseEntity<?> addComment(@PathVariable String id,
                                       @Valid @RequestBody CommentDTO commentDTO) {
        try {
            TicketComment comment = ticketService.addComment(
                    id,
                    commentDTO.getUserId(),
                    commentDTO.getUserName(),
                    commentDTO.getUserEmail(),
                    commentDTO.getContent(),
                    commentDTO.getStaffComment()
            );
            CommentDTO responseDTO = modelMapper.map(comment, CommentDTO.class);
            return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error adding comment: " + e.getMessage());
        }
    }

    /**
     * Get ticket comments
     * GET /tickets/{id}/comments
     */
    @GetMapping("/{id}/comments")
    public ResponseEntity<?> getTicketComments(@PathVariable String id) {
        try {
            List<TicketComment> comments = ticketService.getTicketComments(id);
            List<CommentDTO> dtos = comments.stream()
                    .map(c -> modelMapper.map(c, CommentDTO.class))
                    .collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching comments: " + e.getMessage());
        }
    }

    /**
     * Delete ticket
     * DELETE /tickets/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTicket(@PathVariable String id) {
        try {
            ticketService.deleteTicket(id);
            return ResponseEntity.ok("Ticket deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Error deleting ticket: " + e.getMessage());
        }
    }

    /**
     * Upload attachment for ticket
     * POST /tickets/{id}/attachments
     */
    @PostMapping("/{id}/attachments")
    public ResponseEntity<?> uploadAttachment(
            @PathVariable String id,
            @RequestParam("file") MultipartFile file,
            Authentication auth) {
        try {
            // Verify ticket exists
            Ticket ticket = ticketService.getTicketById(id);

            // Check if maximum attachments reached (3 per ticket)
            if (ticket.getAttachmentIds() != null && ticket.getAttachmentIds().size() >= 3) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Maximum 3 attachments per ticket");
            }

            // Upload file
            TicketAttachment attachment = fileUploadService.uploadFile(file, id, auth.getName());

            // Add attachment ID to ticket
            ticketService.addAttachment(id, attachment.getId());

            return ResponseEntity.status(HttpStatus.CREATED).body(attachment);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error uploading file: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Invalid file: " + e.getMessage());
        }
    }

    /**
     * Delete attachment from ticket
     * DELETE /tickets/{ticketId}/attachments/{attachmentId}
     */
    @DeleteMapping("/{ticketId}/attachments/{attachmentId}")
    public ResponseEntity<?> deleteAttachment(
            @PathVariable String ticketId,
            @PathVariable String attachmentId,
            Authentication auth) {
        try {
            // Delete file
            fileUploadService.deleteFile(attachmentId);

            // Remove attachment ID from ticket
            ticketService.removeAttachment(ticketId, attachmentId);

            return ResponseEntity.noContent().build();
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error deleting file: " + e.getMessage());
        }
    }
}
