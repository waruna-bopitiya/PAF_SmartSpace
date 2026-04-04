package com.smartcampus.repository;

import com.smartcampus.model.Ticket;
import com.smartcampus.model.TicketStatus;
import com.smartcampus.model.TicketPriority;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends MongoRepository<Ticket, String> {
    Optional<Ticket> findByTicketNumber(String ticketNumber);

    List<Ticket> findByStatus(TicketStatus status);

    List<Ticket> findByPriority(TicketPriority priority);

    List<Ticket> findByCreatedById(String createdById);

    List<Ticket> findByAssignedToId(String assignedToId);

    @Query("{ 'status': { $in: ['OPEN', 'IN_PROGRESS'] } }")
    List<Ticket> findOpenTickets();

    @Query("{ 'status': 'RESOLVED' }")
    List<Ticket> findRecentlyResolved();
}
