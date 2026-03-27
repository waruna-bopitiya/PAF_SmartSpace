# Quick Start Guide

## 🚀 Fast Setup (5 minutes)

### Prerequisites
- Java 17+ 
- Node.js 18+
- MySQL 8.0+
- Git

### Step 1: Create Database

```bash
mysql -u root -p
CREATE DATABASE smart_campus_db;
exit;
```

### Step 2: Backend Setup

```bash
cd backend

# Update application.yml with your database credentials
# spring.datasource.username and password

# Build
mvn clean package -DskipTests

# Run
mvn spring-boot:run
```

**Backend runs on**: http://localhost:8080/api

### Step 3: Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_GOOGLE_CLIENT_ID=your_client_id
EOF

# Start dev server
npm start
```

**Frontend runs on**: http://localhost:3000

---

## 📝 Testing the API

### Option 1: Using cURL

```bash
# Get all resources
curl http://localhost:8080/api/resources

# Create a resource (need admin role)
curl -X POST http://localhost:8080/api/resources \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Lab A",
    "type": "LAB",
    "capacity": 30,
    "location": "Building 1"
  }'
```

### Option 2: Using Postman

1. Open Postman
2. Set base URL to: `http://localhost:8080/api`
3. Import collection from: `swagger-ui` at `http://localhost:8080/api/swagger-ui/index.html`

### Option 3: Direct Testing

Visit API Swagger UI: http://localhost:8080/api/swagger-ui/index.html

---

## 🔍 Key Endpoints to Test

### Resources (Module A)
```
GET    /resources              - List all resources
GET    /resources/{id}         - Get resource
POST   /resources              - Create resource
PUT    /resources/{id}         - Update resource
DELETE /resources/{id}         - Delete resource
```

### Bookings (Module B)
```
POST   /bookings               - Create booking
GET    /bookings/{id}          - Get booking
POST   /bookings/{id}/approve  - Approve booking (Admin)
POST   /bookings/{id}/reject   - Reject booking (Admin)
POST   /bookings/{id}/cancel   - Cancel booking
```

### Tickets (Module C)
```
POST   /tickets                - Create ticket
GET    /tickets/{id}           - Get ticket
POST   /tickets/{id}/assign    - Assign ticket (Admin)
PUT    /tickets/{id}/status    - Update status
POST   /tickets/{id}/comments  - Add comment
```

### Notifications (Module D)
```
GET    /notifications          - Get all notifications
GET    /notifications/unread   - Get unread
GET    /notifications/unread-count  - Count unread
POST   /notifications/{id}/read     - Mark as read
```

---

## 🐛 Troubleshooting

### Port Already in Use

**Windows**:
```bash
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

**Mac/Linux**:
```bash
lsof -ti:8080 | xargs kill -9
lsof -ti:3000 | xargs kill -9
```

### Database Connection Error

```bash
# Check MySQL is running
# Verify credentials in application.yml
# Check database exists
mysql -u root -p -e "SHOW DATABASES;"
```

### CORS Error

- Check `SecurityConfig.java` CORS configuration
- Verify frontend URL in `corsConfigurationSource()`

### Frontend Can't Connect to Backend

- Check backend is running on 8080
- Verify `.env` has correct `REACT_APP_API_URL`
- Check firewall settings

---

## 📊 Database Schema

Tables auto-created by Hibernate:
- `users` - User accounts and roles
- `resources` - Bookable facilities
- `bookings` - Reservation requests
- `booking_comments` - Booking notes
- `tickets` - Maintenance issues
- `ticket_comments` - Ticket updates
- `ticket_attachments` - Issue images
- `notifications` - User alerts

---

## 🔐 Default Credentials

For demo purposes, use any email/password combination. 
In production, implement proper OAuth2 with Google.

---

## 📚 Additional Resources

- [Spring Boot Docs](https://spring.io/projects/spring-boot)
- [React Docs](https://react.dev)
- [API Best Practices](https://restfulapi.net)
- [JWT Guide](https://jwt.io)

---

## ✅ Verification Checklist

- [ ] Database created
- [ ] Backend builds without errors
- [ ] Backend runs on port 8080
- [ ] Frontend runs on port 3000
- [ ] Can access Swagger UI
- [ ] Can view resources in React app
- [ ] Can create a booking
- [ ] Can create a ticket

---

**Ready to develop!** 🎉
