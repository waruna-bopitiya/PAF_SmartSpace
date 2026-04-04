package com.smartcampus.controller;

import com.smartcampus.dto.TicketDTO;
import com.smartcampus.service.TicketService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/tickets")
@AllArgsConstructor
@Tag(name = "Ticket Management", description = "APIs for managing maintenance and incident tickets")
public class TicketController {
    private final TicketService ticketService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public ResponseEntity<List<TicketDTO>> getAllTickets() {
        return ResponseEntity.ok(ticketService.getAllTickets());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketDTO> getTicketById(@PathVariable String id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<TicketDTO> createTicket(@Valid @RequestBody TicketDTO ticketDTO, Authentication authentication) {
        String userId = authentication.getName();
        TicketDTO created = ticketService.createTicket(ticketDTO, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/open")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public ResponseEntity<List<TicketDTO>> getOpenTickets() {
        return ResponseEntity.ok(ticketService.getOpenTickets());
    }

    @PostMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TicketDTO> assignTicket(@PathVariable String id, @RequestParam String technicianId) {
        TicketDTO assigned = ticketService.assignTicket(id, technicianId);
        return ResponseEntity.ok(assigned);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public ResponseEntity<TicketDTO> updateTicketStatus(
            @PathVariable String id,
            @RequestParam String status,
            @RequestParam(required = false) String resolutionNotes) {
        TicketDTO updated = ticketService.updateTicketStatus(id, status, resolutionNotes);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TicketDTO> rejectTicket(@PathVariable String id, @RequestParam String reason) {
        TicketDTO rejected = ticketService.rejectTicket(id, reason);
        return ResponseEntity.ok(rejected);
    }

    @PostMapping("/{id}/comments")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public ResponseEntity<TicketDTO> addComment(
            @PathVariable String id,
            @RequestParam String content,
            Authentication authentication) {
        String userId = authentication.getName();
        TicketDTO ticket = ticketService.addComment(id, userId, content);
        return ResponseEntity.ok(ticket);
    }
}
