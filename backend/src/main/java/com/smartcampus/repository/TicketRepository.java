package com.smartcampus.repository;

import com.smartcampus.model.Ticket;
import com.smartcampus.model.TicketPriority;
import com.smartcampus.model.TicketStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TicketRepository extends MongoRepository<Ticket, String> {
    List<Ticket> findByCreatedBy(String userId);
    List<Ticket> findByAssignedTo(String userId);
    List<Ticket> findByStatus(TicketStatus status);
    List<Ticket> findByPriority(TicketPriority priority);
    List<Ticket> findByResourceId(String resourceId);
}
