package com.smartcampus.repository;

import com.smartcampus.model.TicketAttachment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TicketAttachmentRepository extends MongoRepository<TicketAttachment, String> {
    List<TicketAttachment> findByTicketId(String ticketId);
}
