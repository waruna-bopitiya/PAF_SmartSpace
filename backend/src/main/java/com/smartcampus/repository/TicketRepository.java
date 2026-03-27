package com.smartcampus.repository;

import com.smartcampus.model.Ticket;
import com.smartcampus.model.TicketStatus;
import com.smartcampus.model.TicketPriority;
import com.smartcampus.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    Optional<Ticket> findByTicketNumber(String ticketNumber);

    List<Ticket> findByStatus(TicketStatus status);

    List<Ticket> findByPriority(TicketPriority priority);

    List<Ticket> findByCreatedBy(User createdBy);

    List<Ticket> findByAssignedTo(User assignedTo);

    @Query("SELECT t FROM Ticket t WHERE t.status IN ('OPEN', 'IN_PROGRESS') ORDER BY t.priority DESC, t.createdAt ASC")
    List<Ticket> findOpenTickets();

    @Query("SELECT t FROM Ticket t WHERE t.status = 'RESOLVED' AND DAY(CURRENT_DATE) - DAY(t.updatedAt) <= 7")
    List<Ticket> findRecentlyResolved();
}
