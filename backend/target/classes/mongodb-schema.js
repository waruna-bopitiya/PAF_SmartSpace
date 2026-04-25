// MongoDB Collections Schema Definition
// Smart Campus Hub Database Structure

// Collection: users
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "fullName", "role", "active"],
      properties: {
        _id: { bsonType: "objectId" },
        email: { 
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
        },
        fullName: { bsonType: "string", minLength: 3, maxLength: 100 },
        googleId: { bsonType: "string" },
        profilePictureUrl: { bsonType: "string" },
        role: { enum: ["USER", "ADMIN", "TECHNICIAN"] },
        active: { bsonType: "bool" },
        department: { bsonType: "string" },
        phoneNumber: { bsonType: "string" },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  }
});

db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ googleId: 1 }, { unique: true, sparse: true });
db.users.createIndex({ createdAt: 1 });

// Collection: resources
db.createCollection("resources", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "type", "capacity", "location", "status"],
      properties: {
        _id: { bsonType: "objectId" },
        name: { bsonType: "string", minLength: 3, maxLength: 100 },
        description: { bsonType: "string" },
        type: { enum: ["LECTURE_HALL", "LAB", "MEETING_ROOM", "EQUIPMENT", "OTHER"] },
        capacity: { bsonType: "int", minimum: 1 },
        location: { bsonType: "string" },
        status: { enum: ["ACTIVE", "OUT_OF_SERVICE", "MAINTENANCE", "RETIRED"] },
        imageUrl: { bsonType: "string" },
        tags: { bsonType: "array", items: { bsonType: "string" } },
        contactPerson: { bsonType: "string" },
        phoneNumber: { bsonType: "string" },
        email: { bsonType: "string" },
        weekdayOpenTime: { bsonType: "date" },
        weekdayCloseTime: { bsonType: "date" },
        createdAt: { bsonType: "date" },
        createdBy: { bsonType: "objectId" },
        updatedAt: { bsonType: "date" }
      }
    }
  }
});

db.resources.createIndex({ name: 1 });
db.resources.createIndex({ type: 1 });
db.resources.createIndex({ status: 1 });
db.resources.createIndex({ location: 1 });
db.resources.createIndex({ "name": "text", "description": "text", "location": "text" });

// Collection: bookings
db.createCollection("bookings", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["resourceId", "userId", "startTime", "endTime", "status"],
      properties: {
        _id: { bsonType: "objectId" },
        resourceId: { bsonType: "objectId" },
        userId: { bsonType: "objectId" },
        startTime: { bsonType: "date" },
        endTime: { bsonType: "date" },
        purpose: { bsonType: "string" },
        expectedAttendees: { bsonType: "int", minimum: 1 },
        status: { enum: ["PENDING", "APPROVED", "REJECTED", "CANCELLED"] },
        approvalReason: { bsonType: "string" },
        approvedBy: { bsonType: "objectId" },
        approvalDate: { bsonType: "date" },
        commentIds: { bsonType: "array", items: { bsonType: "objectId" } },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  }
});

db.bookings.createIndex({ resourceId: 1, startTime: 1, endTime: 1 });
db.bookings.createIndex({ userId: 1 });
db.bookings.createIndex({ status: 1 });
db.bookings.createIndex({ startTime: 1, endTime: 1 });
db.bookings.createIndex({ createdAt: 1 });

// Collection: booking_comments
db.createCollection("booking_comments", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["bookingId", "userId", "content"],
      properties: {
        _id: { bsonType: "objectId" },
        bookingId: { bsonType: "objectId" },
        userId: { bsonType: "objectId" },
        content: { bsonType: "string", minLength: 1, maxLength: 1000 },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  }
});

db.booking_comments.createIndex({ bookingId: 1 });
db.booking_comments.createIndex({ userId: 1 });

// Collection: tickets
db.createCollection("tickets", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["resourceId", "createdBy", "title", "category", "priority", "status"],
      properties: {
        _id: { bsonType: "objectId" },
        resourceId: { bsonType: "objectId" },
        createdBy: { bsonType: "objectId" },
        title: { bsonType: "string", minLength: 5, maxLength: 200 },
        description: { bsonType: "string" },
        category: { enum: ["DAMAGE", "MALFUNCTION", "LOST_AND_FOUND", "MAINTENANCE", "OTHER"] },
        priority: { enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"] },
        status: { enum: ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"] },
        assignedTo: { bsonType: "objectId" },
        location: { bsonType: "string" },
        preferredContactEmail: { bsonType: "string" },
        preferredContactPhone: { bsonType: "string" },
        attachmentIds: { bsonType: "array", items: { bsonType: "objectId" }, maxItems: 3 },
        commentIds: { bsonType: "array", items: { bsonType: "objectId" } },
        resolutionNotes: { bsonType: "string" },
        resolvedDate: { bsonType: "date" },
        lastResponseAt: { bsonType: "date" },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  }
});

db.tickets.createIndex({ resourceId: 1 });
db.tickets.createIndex({ createdBy: 1 });
db.tickets.createIndex({ assignedTo: 1 });
db.tickets.createIndex({ status: 1 });
db.tickets.createIndex({ priority: 1 });
db.tickets.createIndex({ createdAt: 1 });
db.tickets.createIndex({ category: 1 });

// Collection: ticket_comments
db.createCollection("ticket_comments", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["ticketId", "userId", "content"],
      properties: {
        _id: { bsonType: "objectId" },
        ticketId: { bsonType: "objectId" },
        userId: { bsonType: "objectId" },
        content: { bsonType: "string", minLength: 1, maxLength: 1000 },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  }
});

db.ticket_comments.createIndex({ ticketId: 1 });
db.ticket_comments.createIndex({ userId: 1 });

// Collection: ticket_attachments
db.createCollection("ticket_attachments", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["ticketId", "fileName", "fileUrl", "fileType"],
      properties: {
        _id: { bsonType: "objectId" },
        ticketId: { bsonType: "objectId" },
        fileName: { bsonType: "string" },
        fileUrl: { bsonType: "string" },
        fileType: { bsonType: "string" },
        fileSize: { bsonType: "int" },
        uploadedBy: { bsonType: "objectId" },
        createdAt: { bsonType: "date" }
      }
    }
  }
});

db.ticket_attachments.createIndex({ ticketId: 1 });
db.ticket_attachments.createIndex({ uploadedBy: 1 });

// Collection: notifications
db.createCollection("notifications", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "type", "title", "message"],
      properties: {
        _id: { bsonType: "objectId" },
        userId: { bsonType: "objectId" },
        relatedEntityId: { bsonType: "objectId" },
        relatedEntityType: { enum: ["Booking", "Ticket", "Resource", "User", "System"] },
        type: { enum: ["BOOKING_CREATED", "BOOKING_APPROVED", "BOOKING_REJECTED", "TICKET_CREATED", "TICKET_ASSIGNED", "TICKET_CLOSED", "COMMENT_ADDED", "SYSTEM"] },
        title: { bsonType: "string" },
        message: { bsonType: "string" },
        isRead: { bsonType: "bool" },
        readAt: { bsonType: "date" },
        actionUrl: { bsonType: "string" },
        createdAt: { bsonType: "date" }
      }
    }
  }
});

db.notifications.createIndex({ userId: 1 });
db.notifications.createIndex({ isRead: 1 });
db.notifications.createIndex({ createdAt: 1 });
db.notifications.createIndex({ userId: 1, isRead: 1 });

// Enable TTL to auto-delete old notifications (90 days)
db.notifications.createIndex({ createdAt: 1 }, { expireAfterSeconds: 7776000 });
