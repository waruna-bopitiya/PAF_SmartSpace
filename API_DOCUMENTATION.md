# API Documentation

## Base URL
```
http://localhost:8080/api
```

## Authentication
All endpoints (except `/auth/*`) require JWT token in the `Authorization` header:
```
Authorization: Bearer <jwt_token>
```

---

## Module A: Resource Management

### 1. GET /resources
Get all bookable resources

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "name": "Lecture Hall A",
    "description": "Main lecture hall",
    "type": "LECTURE_HALL",
    "capacity": 100,
    "location": "Building A, Floor 1",
    "status": "ACTIVE",
    "imageUrl": null
  }
]
```

### 2. GET /resources/{id}
Get resource by ID

**Parameters**:
- `id` (path, required): Resource ID

**Response** (200 OK): Single resource object

### 3. POST /resources
Create new resource (Admin only)

**Request Body**:
```json
{
  "name": "Lecture Hall B",
  "description": "Second lecture hall",
  "type": "LECTURE_HALL",
  "capacity": 80,
  "location": "Building B, Floor 1",
  "imageUrl": "https://example.com/image.jpg"
}
```

**Response** (201 Created): Created resource object

**Validation**:
- `name`: Required, not blank
- `capacity`: Required, must be positive
- `location`: Required, not blank
- `type`: Required, valid enum (LECTURE_HALL, LAB, MEETING_ROOM, EQUIPMENT)

### 4. PUT /resources/{id}
Update resource (Admin only)

**Parameters**:
- `id` (path, required): Resource ID

**Request Body**: Same as POST

**Response** (200 OK): Updated resource object

### 5. DELETE /resources/{id}
Delete resource (Admin only)

**Parameters**:
- `id` (path, required): Resource ID

**Response** (204 No Content)

### 6. GET /resources/search
Search resources

**Query Parameters**:
- `type` (optional): LECTURE_HALL, LAB, MEETING_ROOM, EQUIPMENT
- `minCapacity` (optional): Minimum capacity (integer)
- `location` (optional): Location keyword

**Response** (200 OK): Array of matching resources

### 7. GET /resources/type/{type}
Get resources by type

**Parameters**:
- `type` (path, required): Resource type

**Response** (200 OK): Array of resources

### 8. GET /resources/location/{location}
Get resources by location

**Parameters**:
- `location` (path, required): Location keyword

**Response** (200 OK): Array of resources

---

## Module B: Booking Management

### 1. POST /bookings
Create booking request

**Request Body**:
```json
{
  "resourceId": 1,
  "startTime": "2026-04-01T10:00:00",
  "endTime": "2026-04-01T12:00:00",
  "purpose": "Lecture",
  "expectedAttendees": 50
}
```

**Response** (201 Created):
```json
{
  "id": 1,
  "resourceId": 1,
  "startTime": "2026-04-01T10:00:00",
  "endTime": "2026-04-01T12:00:00",
  "purpose": "Lecture",
  "expectedAttendees": 50,
  "status": "PENDING",
  "rejectionReason": null,
  "approvalNotes": null
}
```

**Validation**:
- `startTime` < `endTime`
- No conflicts with existing bookings
- All fields required

**Error** (409 Conflict): Resource already booked for this time

### 2. GET /bookings/{id}
Get booking details

**Response** (200 OK): Booking object

### 3. GET /bookings (Admin only)
Get all bookings

**Response** (200 OK): Array of bookings

### 4. GET /bookings/pending (Admin only)
Get pending bookings

**Response** (200 OK): Array of pending bookings

### 5. POST /bookings/{id}/approve (Admin only)
Approve booking

**Query Parameters**:
- `notes` (required): Approval notes

**Response** (200 OK): Updated booking with status APPROVED

**Side effects**: 
- Notification sent to user
- Status changes to APPROVED

### 6. POST /bookings/{id}/reject (Admin only)
Reject booking

**Query Parameters**:
- `reason` (required): Rejection reason

**Response** (200 OK): Updated booking with status REJECTED

**Side effects**:
- Notification sent to user
- Status changes to REJECTED

### 7. POST /bookings/{id}/cancel
Cancel booking

**Response** (200 OK): Updated booking with status CANCELLED

**Side effects**:
- Notification sent to user
- Status changes to CANCELLED

---

## Module C: Ticket Management

### 1. POST /tickets
Create maintenance ticket

**Request Body**:
```json
{
  "resourceId": 1,
  "category": "DAMAGE",
  "description": "Projector is not working",
  "priority": "HIGH",
  "contactNumber": "+94700000000"
}
```

**Response** (201 Created):
```json
{
  "id": 1,
  "ticketNumber": "TKT-ABC123DE",
  "resourceId": 1,
  "category": "DAMAGE",
  "description": "Projector is not working",
  "priority": "HIGH",
  "status": "OPEN",
  "contactNumber": "+94700000000",
  "resolutionNotes": null,
  "rejectionReason": null,
  "assignedToId": null
}
```

**Categories**: DAMAGE, MALFUNCTION, CLEANING, SAFETY_CONCERN, OTHER
**Priority**: LOW, MEDIUM, HIGH, URGENT

### 2. GET /tickets/{id}
Get ticket details

**Response** (200 OK): Ticket object

### 3. GET /tickets (Admin/Technician only)
Get all tickets

**Response** (200 OK): Array of tickets

### 4. GET /tickets/open (Admin/Technician only)
Get open tickets

**Response** (200 OK): Array of open/in-progress tickets

### 5. POST /tickets/{id}/assign (Admin only)
Assign ticket to technician

**Query Parameters**:
- `technicianId` (required): Technician user ID

**Response** (200 OK): Ticket with assigned technician and status IN_PROGRESS

**Side effects**:
- Notification sent to technician
- Status changed to IN_PROGRESS

### 6. PUT /tickets/{id}/status (Admin/Technician only)
Update ticket status

**Query Parameters**:
- `status` (required): OPEN, IN_PROGRESS, RESOLVED, CLOSED, REJECTED
- `resolutionNotes` (optional): Resolution details

**Response** (200 OK): Updated ticket

**Status Flow**: OPEN → IN_PROGRESS → RESOLVED → CLOSED

**Side effects**:
- Notification sent to ticket creator
- If RESOLVED, can be moved to CLOSED

### 7. POST /tickets/{id}/reject (Admin only)
Reject ticket

**Query Parameters**:
- `reason` (required): Rejection reason

**Response** (200 OK): Ticket with status REJECTED

### 8. POST /tickets/{id}/comments
Add comment to ticket

**Query Parameters**:
- `content` (required): Comment text

**Response** (200 OK): Updated ticket

**Side effects**:
- Notification sent to ticket creator (if not commenter)

---

## Module D: Notifications

### 1. GET /notifications
Get all notifications for logged-in user

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "type": "BOOKING_APPROVED",
    "title": "Booking Approved",
    "message": "Your booking for Lab A has been approved",
    "isRead": false,
    "createdAt": "2026-03-27T10:30:00",
    "relatedResourceId": 1,
    "relatedResourceType": "BOOKING"
  }
]
```

**Notification Types**:
- BOOKING_APPROVED
- BOOKING_REJECTED
- BOOKING_CANCELLED
- TICKET_STATUS_CHANGED
- TICKET_ASSIGNED
- TICKET_COMMENTED
- COMMENT_ON_YOUR_TICKET
- COMMENT_ON_YOUR_BOOKING
- SYSTEM_ALERT

### 2. GET /notifications/unread
Get unread notifications

**Response** (200 OK): Array of unread notification objects

### 3. GET /notifications/unread-count
Get count of unread notifications

**Response** (200 OK):
```
5
```

### 4. POST /notifications/{id}/read
Mark notification as read

**Parameters**:
- `id` (path, required): Notification ID

**Response** (200 OK): Updated notification with `isRead: true`

### 5. POST /notifications/read-all
Mark all notifications as read

**Response** (204 No Content)

### 6. DELETE /notifications/{id}
Delete notification

**Parameters**:
- `id` (path, required): Notification ID

**Response** (204 No Content)

---

## Error Handling

All error responses follow this format:

```json
{
  "status": 404,
  "message": "Resource not found with ID: 1",
  "timestamp": "2026-03-27T10:30:00",
  "path": "/api/resources/1"
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200  | OK - Successful GET/PUT |
| 201  | Created - Successful POST |
| 204  | No Content - Successful DELETE |
| 400  | Bad Request - Validation error |
| 401  | Unauthorized - Missing/invalid token |
| 403  | Forbidden - Insufficient permissions |
| 404  | Not Found - Resource doesn't exist |
| 409  | Conflict - Booking conflict/duplicate |
| 500  | Server Error - Unexpected error |

### Validation Errors

```json
{
  "status": 400,
  "message": "Validation failed",
  "timestamp": "2026-03-27T10:30:00",
  "path": "/api/bookings",
  "validationErrors": {
    "startTime": "must not be null",
    "purpose": "must not be blank"
  }
}
```

---

## Rate Limiting

- No explicit rate limiting implemented
- Consider adding for production

---

## Pagination

- Not implemented in current version
- Can be added using Spring Data JPA PageRequest

---

## Filtering & Sorting

- Basic filtering by status, type, location
- Can be extended with more search criteria

---

## Versioning

Current API version: **v1**

Future versions planned for:
- v2: Analytics and reporting
- v3: Mobile app support

---

**API Documentation Version**: 1.0
**Last Updated**: 2026-03-27
