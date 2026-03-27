package com.smartcampus.repository;

import com.smartcampus.model.TicketAttachment;
import com.smartcampus.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TicketAttachmentRepository extends JpaRepository<TicketAttachment, Long> {
    List<TicketAttachment> findByTicket(Ticket ticket);

    List<TicketAttachment> findByTicketId(Long ticketId);
}
