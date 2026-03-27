# SmartSpace - Smart Campus Operations Hub - Complete Guide

## Table of Contents
1. [Project Overview](#project-overview)
2. [Project Architecture](#project-architecture)
3. [Backend Setup & Documentation](#backend-setup--documentation)
4. [Frontend Setup & Documentation](#frontend-setup--documentation)
5. [Database Configuration](#database-configuration)
6. [Running the Application](#running-the-application)
7. [Testing](#testing)
8. [API Endpoints](#api-endpoints)
9. [Deployment Guide](#deployment-guide)
10. [Troubleshooting](#troubleshooting)

---

## Project Overview

**SmartSpace** is a comprehensive Smart Campus Operations Hub designed to streamline campus resource management, booking systems, and support ticket handling.

### Key Features
- 🔐 **Authentication**: Google OAuth 2.0 integration
- 📚 **Resource Management**: Manage campus resources with capacity tracking
- 📅 **Booking System**: Reserve resources with conflict detection
- 🎫 **Ticket System**: Support tickets with comments and attachments
- 🔔 **Notifications**: Real-time notifications for system events
- 👥 **User Management**: Role-based access control (Admin, Staff, User)
- 📁 **File Uploads**: Support for ticket attachments

### Tech Stack

**Backend:**
- Java 17
- Spring Boot 3.x
- MongoDB (NoSQL Database)
- Spring Security with OAuth 2.0
- Maven

**Frontend:**
- React 18.2
- React Router v6
- Axios (HTTP client)
- Zustand (State management)
- React Icons
- CSS3 with custom styling

---

## Project Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SmartSpace Application                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────┐          ┌──────────────────────┐  │
│  │  React Frontend      │          │   Spring Boot API    │  │
│  │  (Port 3000)         │◄────────►│   (Port 8080)        │  │
│  └──────────────────────┘          └──────────────────────┘  │
│         │                                    │                │
│         ▼                                    ▼                │
│    User Interface                   REST API Controllers     │
│    - Dashboard                      - Auth Controller        │
│    - Resources Page                 - Resource Controller    │
│    - Bookings Page                  - Booking Controller     │
│    - Tickets Page                   - Ticket Controller      │
│    - Notifications                  - Notification Controller│
│                                                               │
│                          ┌──────────────────────┐             │
│                          │   MongoDB Database   │             │
│                          │   (Port 27017)       │             │
│                          └──────────────────────┘             │
│                                    ▲                          │
│                                    │                          │
│                          Spring Data MongoDB                  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Microservices Communication Flow

```
User Action → React Component → Axios HTTP Request 
    ↓
Spring Controller → Service Layer → Repository Layer
    ↓
MongoDB Query → Data Processing → Response DTO
    ↓
JSON Response → React State Update → UI Re-render
```

---

## Backend Setup & Documentation

### Directory Structure

```
backend/
├── pom.xml                          # Maven configuration
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   ├── SmartCampusHubApplication.java
│   │   │   └── com/smartcampus/
│   │   │       ├── controller/       # REST API Endpoints
│   │   │       │   ├── AuthController.java
│   │   │       │   ├── BookingController.java
│   │   │       │   ├── NotificationController.java
│   │   │       │   ├── ResourceController.java
│   │   │       │   └── TicketController.java
│   │   │       ├── service/          # Business Logic
│   │   │       │   ├── AuthService.java
│   │   │       │   ├── BookingService.java
│   │   │       │   ├── NotificationService.java
│   │   │       │   ├── ResourceService.java
│   │   │       │   ├── TicketService.java
│   │   │       │   └── FileUploadService.java
│   │   │       ├── model/            # Entity Models
│   │   │       │   ├── User.java
│   │   │       │   ├── Resource.java
│   │   │       │   ├── Booking.java
│   │   │       │   ├── Ticket.java
│   │   │       │   ├── Notification.java
│   │   │       │   ├── ResourceStatus.java
│   │   │       │   ├── BookingStatus.java
│   │   │       │   ├── TicketStatus.java
│   │   │       │   └── UserRole.java
│   │   │       ├── repository/       # Data Access Layer
│   │   │       │   ├── UserRepository.java
│   │   │       │   ├── ResourceRepository.java
│   │   │       │   ├── BookingRepository.java
│   │   │       │   ├── TicketRepository.java
│   │   │       │   └── NotificationRepository.java
│   │   │       ├── dto/              # Data Transfer Objects
│   │   │       │   ├── UserDTO.java
│   │   │       │   ├── ResourceDTO.java
│   │   │       │   ├── BookingDTO.java
│   │   │       │   ├── TicketDTO.java
│   │   │       │   └── NotificationDTO.java
│   │   │       ├── exception/        # Exception Handling
│   │   │       │   ├── GlobalExceptionHandler.java
│   │   │       │   ├── ResourceNotFoundException.java
│   │   │       │   └── BookingConflictException.java
│   │   │       ├── security/         # Security Configuration
│   │   │       │   ├── SecurityConfig.java
│   │   │       │   ├── JwtTokenProvider.java
│   │   │       │   └── CustomUserDetailsService.java
│   │   │       ├── config/           # Application Configuration
│   │   │       │   ├── FileUploadConfig.java
│   │   │       │   ├── CorsConfig.java
│   │   │       │   └── MongoConfig.java
│   │   │       └── util/             # Utility Classes
│   │   │           └── JwtTokenProvider.java
│   │   └── resources/
│   │       └── application.yml       # Application properties
│   └── test/
│       └── java/com/smartcampus/...  # Test files
└── target/                           # Compiled output
```

### Backend Technologies

| Component | Technology | Version |
|-----------|-----------|---------|
| Runtime | Java | 17+ |
| Framework | Spring Boot | 3.x |
| Database | MongoDB | 5.0+ |
| Build Tool | Maven | 3.8+ |
| Security | Spring Security | 6.x |
| API Documentation | SpringDoc OpenAPI | Latest |

### Backend Setup Steps

#### 1. Install Prerequisites
```bash
# Check Java version (should be 17 or higher)
java -version

# Check Maven version (should be 3.8 or higher)
mvn -version

# MongoDB should be running (local or remote)
# Default connection: mongodb://localhost:27017/smartspace
```

#### 2. Configure Backend Properties
Edit `backend/src/main/resources/application.yml`:

```yaml
spring:
  application:
    name: SmartCampus Hub API
  
  data:
    mongodb:
      uri: mongodb://localhost:27017/smartspace
      # OR for remote MongoDB:
      # uri: mongodb+srv://username:password@cluster.mongodb.net/smartspace
  
  security:
    oauth2:
      client:
        registration:
          google:
            client-id: YOUR_GOOGLE_CLIENT_ID
            client-secret: YOUR_GOOGLE_CLIENT_SECRET
            scope: openid,profile,email

server:
  port: 8080
  
# File upload configuration
file:
  upload:
    max-size: 5242880  # 5MB
    allowed-types: jpg,jpeg,png,gif,pdf
```

#### 3. Build Backend
```bash
cd backend

# Clean and compile
mvn clean compile

# Build with tests skipped
mvn clean package -DskipTests

# Build with tests
mvn clean package

# Run tests only
mvn test
```

#### 4. Run Backend Server
```bash
cd backend

# Option 1: Run using Maven
mvn spring-boot:run

# Option 2: Run JAR file
java -jar target/smart-campus-hub-api-1.0.0.jar

# Option 3: Run from IDE (IntelliJ/Eclipse)
# Right-click on SmartCampusHubApplication.java → Run
```

**Expected Output:**
```
2026-04-19 07:45:00.123  INFO 12345 --- [main] c.s.SmartCampusHubApplication           : Starting SmartCampusHubApplication v1.0.0
2026-04-19 07:45:02.456  INFO 12345 --- [main] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat started on port(s): 8080
2026-04-19 07:45:02.789  INFO 12345 --- [main] c.s.SmartCampusHubApplication           : Started SmartCampusHubApplication
```

#### 5. Backend Health Check
```bash
# Check if API is running
curl http://localhost:8080/actuator/health

# Expected response:
# {"status":"UP"}
```

---

## Frontend Setup & Documentation

### Directory Structure

```
frontend/
├── package.json                     # NPM dependencies
├── public/
│   ├── index.html                   # Main HTML entry point
│   └── favicon.ico
├── src/
│   ├── index.js                     # React entry point
│   ├── App.js                       # Main App component
│   ├── App.css                      # App styling
│   ├── components/
│   │   ├── Layout.js                # Layout wrapper
│   │   ├── Layout.css
│   │   ├── ProtectedRoute.js        # Auth protection
│   │   └── (Other reusable components)
│   ├── pages/
│   │   ├── Login.js                 # OAuth login page
│   │   ├── Login.css
│   │   ├── Dashboard.js             # Main dashboard
│   │   ├── Resources.js             # Resource management
│   │   ├── Bookings.js              # Booking management
│   │   ├── Tickets.js               # Support tickets
│   │   ├── Notifications.js         # Notifications
│   │   ├── AuthSuccess.js           # Post-auth callback
│   │   └── (styling CSS files)
│   ├── context/
│   │   └── AuthContext.js           # Auth state management
│   ├── hooks/
│   │   └── useAuth.js               # Custom auth hook
│   ├── services/
│   │   └── api.js                   # API client (Axios)
│   └── styles/
│       └── (Global styles)
├── .env                             # Environment variables
├── .gitignore
└── README.md
```

### Frontend Technologies

| Component | Technology | Version |
|-----------|-----------|---------|
| UI Framework | React | 18.2+ |
| Routing | React Router | 6.30+ |
| HTTP Client | Axios | 1.4+ |
| State Management | Zustand | 4.3+ |
| Icons | React Icons | 4.10+ |
| Date Handling | date-fns | 2.30+ |

### Frontend Setup Steps

#### 1. Install Prerequisites
```bash
# Check Node version (should be 14+ or 16+)
node --version

# Check NPM version
npm --version
```

#### 2. Install Dependencies
```bash
cd frontend

# Install all packages listed in package.json
npm install

# Expected output:
# up to date, audited 1318 packages in 10s
# 269 packages are looking for funding
```

#### 3. Configure Environment Variables
Create `.env` file in `frontend/`:

```env
# Backend API URL
REACT_APP_API_URL=http://localhost:8080

# Google OAuth Configuration
REACT_APP_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
REACT_APP_GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback

# Application settings
REACT_APP_APP_NAME=SmartSpace
REACT_APP_ENVIRONMENT=development
```

#### 4. Start Development Server
```bash
cd frontend

# Start React development server with hot reload
npm start

# Expected output:
# Compiled successfully!
# 
# You can now view SMARTSPACE in the browser.
#   Local:            http://localhost:3000
#   On Your Network:  http://192.168.x.x:3000
```

#### 5. Build for Production
```bash
cd frontend

# Create production build
npm run build

# Output location: frontend/build/
# Ready to deploy to any static hosting service
```

---

## Database Configuration

### MongoDB Setup

#### Local MongoDB Installation
```bash
# Windows
# Download from https://www.mongodb.com/try/download/community
# Run installer and follow instructions
# Start MongoDB service: net start MongoDB

# macOS (using Homebrew)
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Linux (Ubuntu/Debian)
sudo apt-get install -y mongodb
sudo systemctl start mongodb
```

#### MongoDB Connection Strings

```yaml
# Local Development
mongodb://localhost:27017/smartspace

# MongoDB Atlas (Cloud)
mongodb+srv://username:password@cluster0.abc123.mongodb.net/smartspace?retryWrites=true&w=majority

# Docker Container
mongodb://mongodb:27017/smartspace
```

### Database Collections & Schemas

#### Users Collection
```json
{
  "_id": ObjectId,
  "email": "user@campus.edu",
  "fullName": "John Doe",
  "googleId": "google-oauth-id",
  "profilePictureUrl": "https://...",
  "role": "STUDENT",  // ADMIN, STAFF, STUDENT
  "active": true,
  "department": "Engineering",
  "phoneNumber": "+1234567890",
  "createdAt": ISODate("2026-04-19T00:00:00Z"),
  "updatedAt": ISODate("2026-04-19T00:00:00Z")
}
```

#### Resources Collection
```json
{
  "_id": ObjectId,
  "name": "Main Auditorium",
  "description": "Large auditorium for events",
  "type": "AUDITORIUM",  // CLASSROOM, AUDITORIUM, LABORATORY, etc.
  "capacity": 500,
  "location": "Building A, Floor 3",
  "status": "AVAILABLE",  // AVAILABLE, MAINTENANCE, RESERVED
  "imageUrl": "https://...",
  "weekdayOpenTime": ISODate("2026-04-19T08:00:00Z"),
  "weekdayCloseTime": ISODate("2026-04-19T20:00:00Z"),
  "weekendOpenTime": ISODate("2026-04-19T10:00:00Z"),
  "weekendCloseTime": ISODate("2026-04-19T18:00:00Z"),
  "contactPerson": "Mr. Smith",
  "phoneNumber": "+1234567890",
  "email": "smith@campus.edu",
  "tags": ["audio-visual", "wheelchair-accessible"],
  "createdAt": ISODate("2026-04-19T00:00:00Z"),
  "updatedAt": ISODate("2026-04-19T00:00:00Z")
}
```

#### Bookings Collection
```json
{
  "_id": ObjectId,
  "resourceId": ObjectId,
  "userId": ObjectId,
  "title": "Team Meeting",
  "description": "Quarterly planning meeting",
  "startTime": ISODate("2026-04-25T14:00:00Z"),
  "endTime": ISODate("2026-04-25T15:30:00Z"),
  "status": "CONFIRMED",  // PENDING, CONFIRMED, CANCELLED
  "attendeeCount": 15,
  "notes": "Please setup projector",
  "createdAt": ISODate("2026-04-19T00:00:00Z"),
  "updatedAt": ISODate("2026-04-19T00:00:00Z")
}
```

#### Tickets Collection
```json
{
  "_id": ObjectId,
  "title": "Broken projector in Auditorium",
  "description": "Projector not working",
  "status": "OPEN",  // OPEN, IN_PROGRESS, RESOLVED, CLOSED
  "priority": "HIGH",  // LOW, MEDIUM, HIGH, URGENT
  "category": "MAINTENANCE",
  "userId": ObjectId,
  "assignedTo": ObjectId,
  "resourceId": ObjectId,
  "attachments": [ObjectId],
  "comments": [ObjectId],
  "createdAt": ISODate("2026-04-19T00:00:00Z"),
  "updatedAt": ISODate("2026-04-19T00:00:00Z")
}
```

#### Notifications Collection
```json
{
  "_id": ObjectId,
  "userId": ObjectId,
  "relatedEntityId": ObjectId,
  "relatedEntityType": "BOOKING",  // BOOKING, TICKET, RESOURCE, etc.
  "type": "BOOKING_CONFIRMED",
  "title": "Booking Confirmed",
  "message": "Your booking has been confirmed",
  "isRead": false,
  "actionUrl": "/bookings/12345",
  "createdAt": ISODate("2026-04-19T00:00:00Z"),
  "readAt": null
}
```

---

## Running the Application

### Local Development Environment

#### Prerequisites
- Java 17+
- Node.js 14+
- MongoDB 5.0+
- npm or yarn
- Git

#### Step-by-Step Startup

**Terminal 1 - Backend API:**
```bash
cd backend
mvn spring-boot:run
# API will be available at http://localhost:8080
```

**Terminal 2 - Frontend App:**
```bash
cd frontend
npm start
# App will open at http://localhost:3000
```

**Terminal 3 - MongoDB (if running locally):**
```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongodb

# Windows
net start MongoDB
```

#### Verification Checklist
- [ ] Backend API running on `http://localhost:8080`
- [ ] Frontend app running on `http://localhost:3000`
- [ ] MongoDB connection established
- [ ] Google OAuth credentials configured
- [ ] CORS settings allow frontend origin
- [ ] Can login with Google account

---

## Testing

### Backend Testing

#### Unit Tests
```bash
cd backend

# Run all tests
mvn test

# Run specific test class
mvn test -Dtest=ResourceServiceTest

# Run with coverage report
mvn test jacoco:report
```

#### Integration Tests
```bash
cd backend

# Run integration tests (requires Docker/Testcontainers)
mvn test -Dgroups=integration

# Run with specific profile
mvn test -P integration
```

#### API Testing with Postman/cURL

**Test Login Endpoint:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@campus.edu","googleId":"google-oauth-id"}'
```

**Test Get Resources:**
```bash
curl -X GET http://localhost:8080/api/resources \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Frontend Testing

#### Component Tests
```bash
cd frontend

# Run tests in watch mode
npm test

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test ResourceList.test.js
```

#### E2E Testing (Optional)
```bash
# Install Cypress
npm install --save-dev cypress

# Open Cypress Test Runner
npm run cypress:open

# Run Cypress tests headless
npm run cypress:run
```

### Manual Testing Checklist

**Authentication:**
- [ ] User can login with Google account
- [ ] JWT token is stored in localStorage
- [ ] Protected routes redirect to login when not authenticated
- [ ] Logout clears token and redirects to login

**Resources:**
- [ ] Can view list of all resources
- [ ] Can view resource details
- [ ] Can filter resources by type
- [ ] Can search resources by name
- [ ] Can view availability calendar

**Bookings:**
- [ ] Can create booking for available time slot
- [ ] Cannot create conflicting bookings
- [ ] Can view all user bookings
- [ ] Can cancel booking
- [ ] Receives notification on booking confirmation
- [ ] Can view booking details with attendees

**Tickets:**
- [ ] Can create support ticket
- [ ] Can upload attachments to ticket
- [ ] Can add comments to ticket
- [ ] Staff can assign tickets
- [ ] Can track ticket status changes
- [ ] Receives notifications on status updates

**Notifications:**
- [ ] Receives notifications for bookings
- [ ] Receives notifications for ticket updates
- [ ] Can mark notifications as read
- [ ] Can view notification history

---

## API Endpoints

### Authentication Endpoints

```
POST   /api/auth/login                 # Login or create user
POST   /api/auth/logout                # Logout user
POST   /api/auth/verify-token          # Verify JWT token
GET    /api/auth/refresh               # Refresh JWT token
GET    /api/auth/current-user          # Get current logged-in user
```

### Resource Endpoints

```
GET    /api/resources                  # Get all resources
GET    /api/resources/{id}             # Get resource details
POST   /api/resources                  # Create new resource (ADMIN)
PUT    /api/resources/{id}             # Update resource (ADMIN)
DELETE /api/resources/{id}             # Delete resource (ADMIN)
GET    /api/resources/type/{type}      # Get resources by type
GET    /api/resources/location/{loc}   # Get resources by location
GET    /api/resources/availability     # Get available resources in time range
```

### Booking Endpoints

```
GET    /api/bookings                   # Get all bookings
GET    /api/bookings/{id}              # Get booking details
POST   /api/bookings                   # Create booking
PUT    /api/bookings/{id}              # Update booking
DELETE /api/bookings/{id}              # Cancel booking
GET    /api/bookings/user/{userId}     # Get user's bookings
GET    /api/bookings/resource/{resId}  # Get resource's bookings
POST   /api/bookings/{id}/confirm      # Confirm booking (STAFF)
POST   /api/bookings/{id}/reject       # Reject booking (STAFF)
```

### Ticket Endpoints

```
GET    /api/tickets                    # Get all tickets
GET    /api/tickets/{id}               # Get ticket details
POST   /api/tickets                    # Create ticket
PUT    /api/tickets/{id}               # Update ticket
DELETE /api/tickets/{id}               # Delete ticket
GET    /api/tickets/user/{userId}      # Get user's tickets
POST   /api/tickets/{id}/comments      # Add comment to ticket
POST   /api/tickets/{id}/attachments   # Upload attachment
GET    /api/tickets/{id}/attachments   # Get ticket attachments
```

### Notification Endpoints

```
GET    /api/notifications              # Get user's notifications
GET    /api/notifications/{id}         # Get notification details
PUT    /api/notifications/{id}/read    # Mark as read
DELETE /api/notifications/{id}         # Delete notification
POST   /api/notifications/read-all     # Mark all as read
GET    /api/notifications/unread       # Get unread count
```

### User Endpoints

```
GET    /api/users/{id}                 # Get user profile
PUT    /api/users/{id}                 # Update user profile
GET    /api/users                      # Get all users (ADMIN)
PUT    /api/users/{id}/role            # Update user role (ADMIN)
DELETE /api/users/{id}                 # Deactivate user (ADMIN)
```

---

## Deployment Guide

### Backend Deployment

#### Docker Deployment

**Create Dockerfile:**
```dockerfile
FROM openjdk:17-jdk-slim

WORKDIR /app

COPY target/smart-campus-hub-api-1.0.0.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
```

**Build Docker Image:**
```bash
cd backend
mvn clean package -DskipTests
docker build -t smartspace-backend:1.0 .
```

**Run Docker Container:**
```bash
docker run -p 8080:8080 \
  -e SPRING_DATA_MONGODB_URI=mongodb://mongo:27017/smartspace \
  -e GOOGLE_CLIENT_ID=your_client_id \
  -e GOOGLE_CLIENT_SECRET=your_secret \
  smartspace-backend:1.0
```

#### Cloud Deployment (AWS EC2)

**Prerequisites:**
- AWS EC2 instance (t2.micro or larger)
- Ubuntu 20.04+ or Amazon Linux 2
- Security groups configured (ports 8080, 27017)

**Deployment Steps:**
```bash
# 1. SSH into EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# 2. Install Java
sudo apt-get update
sudo apt-get install -y openjdk-17-jdk-headless

# 3. Install MongoDB
sudo apt-get install -y mongodb

# 4. Start MongoDB
sudo systemctl start mongodb

# 5. Upload JAR file
scp -i your-key.pem target/smart-campus-hub-api-1.0.0.jar ubuntu@your-ec2-ip:~/

# 6. Run application
java -jar smart-campus-hub-api-1.0.0.jar &

# 7. Check if running
curl http://localhost:8080/actuator/health
```

#### Azure App Service Deployment

```bash
# 1. Create resource group
az group create --name smartspace-rg --location eastus

# 2. Create App Service plan
az appservice plan create --name smartspace-plan \
  --resource-group smartspace-rg --sku B1 --is-linux

# 3. Create web app
az webapp create --name smartspace-api \
  --resource-group smartspace-rg \
  --plan smartspace-plan --runtime "JAVA|17"

# 4. Configure MongoDB connection
az webapp config appsettings set \
  --name smartspace-api \
  --resource-group smartspace-rg \
  --settings SPRING_DATA_MONGODB_URI="mongodb+srv://..."

# 5. Deploy JAR
az webapp deployment source config-zip \
  --resource-group smartspace-rg \
  --name smartspace-api \
  --src smart-campus-hub-api-1.0.0.jar
```

### Frontend Deployment

#### Static Hosting (Netlify)

```bash
# 1. Build production bundle
npm run build

# 2. Connect to Netlify (via CLI or web)
npm install -g netlify-cli
netlify deploy --prod --dir=build

# Or drag & drop build folder to Netlify dashboard
```

#### AWS S3 + CloudFront

```bash
# 1. Create S3 bucket
aws s3 mb s3://smartspace-frontend

# 2. Build and upload
npm run build
aws s3 sync build/ s3://smartspace-frontend

# 3. Create CloudFront distribution (via AWS Console)
# - Point to S3 bucket
# - Set build/index.html as default root object
# - Enable cache invalidation on updates
```

#### Vercel Deployment

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy
vercel --prod

# 3. Configure environment variables in Vercel dashboard
# REACT_APP_API_URL=https://api.smartspace.com
```

---

## Environment Variables Reference

### Backend (application.yml)

```yaml
# Server
server:
  port: 8080
  servlet:
    context-path: /
    session:
      cookie:
        http-only: true
        secure: true  # Set to true in production (HTTPS)
        same-site: strict

# Spring Boot
spring:
  application:
    name: SmartCampus Hub API
  
  # MongoDB
  data:
    mongodb:
      uri: ${MONGODB_URI:mongodb://localhost:27017/smartspace}
      auto-index-creation: true
  
  # Security
  security:
    oauth2:
      client:
        registration:
          google:
            client-id: ${GOOGLE_CLIENT_ID}
            client-secret: ${GOOGLE_CLIENT_SECRET}
            scope: openid,profile,email
            redirect-uri: http://localhost:3000/auth/callback
  
  # Jackson
  jackson:
    serialization:
      write-dates-as-timestamps: false
    default-property-inclusion: non_null

# JWT Configuration
jwt:
  secret: ${JWT_SECRET:your-secret-key-min-32-chars}
  expiration: 86400000  # 24 hours
  refresh-expiration: 604800000  # 7 days

# File Upload
file:
  upload:
    dir: uploads/
    max-size: 5242880  # 5MB
    allowed-types: jpg,jpeg,png,gif,pdf

# Logging
logging:
  level:
    root: INFO
    com.smartcampus: DEBUG
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n"
```

### Frontend (.env)

```env
# API Configuration
REACT_APP_API_URL=http://localhost:8080
REACT_APP_API_TIMEOUT=10000

# OAuth Configuration
REACT_APP_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
REACT_APP_GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback

# App Configuration
REACT_APP_APP_NAME=SmartSpace
REACT_APP_ENVIRONMENT=development
REACT_APP_DEBUG=false

# Feature Flags
REACT_APP_FEATURE_FILE_UPLOAD=true
REACT_APP_FEATURE_NOTIFICATIONS=true
REACT_APP_FEATURE_NOTIFICATIONS_REAL_TIME=false
```

---

## Troubleshooting

### Backend Issues

**Problem: Connection refused to MongoDB**
```
Solution:
1. Verify MongoDB is running: sudo systemctl status mongodb
2. Check connection string in application.yml
3. Verify MongoDB port (default 27017) is accessible
4. For remote MongoDB, check firewall and credentials
```

**Problem: Google OAuth not working**
```
Solution:
1. Verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in application.yml
2. Check Google OAuth credentials at https://console.cloud.google.com
3. Verify redirect URI matches configured value
4. Clear browser cookies for oauth.googleapis.com
5. Check redirect URI format (must be exact match)
```

**Problem: CORS errors on frontend requests**
```
Solution:
1. Check SecurityConfig.java CORS configuration
2. Verify frontend URL is added to allowed origins
3. Ensure credentials are sent with requests (withCredentials: true)
4. Restart backend after configuration changes
```

**Problem: JWT token expired**
```
Solution:
1. Check jwt.expiration value in application.yml (default 24 hours)
2. Implement token refresh endpoint
3. Clear localStorage and re-login
4. Verify server time is synchronized
```

### Frontend Issues

**Problem: API requests return 404**
```
Solution:
1. Verify REACT_APP_API_URL in .env matches backend port
2. Check if backend is running on http://localhost:8080
3. Verify API endpoint path is correct
4. Check console for full error message
```

**Problem: Cannot login with Google**
```
Solution:
1. Verify REACT_APP_GOOGLE_CLIENT_ID in .env
2. Check Google OAuth redirect URI matches exactly
3. Verify HTTPS in production (OAuth requires HTTPS)
4. Clear browser cache and cookies
5. Test Google OAuth at https://myaccount.google.com/connected-apps
```

**Problem: State not updating from API response**
```
Solution:
1. Check Zustand store initialization
2. Verify API response format matches expected DTO
3. Check console for state update errors
4. Verify useEffect dependencies array
5. Use React DevTools to inspect state changes
```

**Problem: Localhost:3000 not loading**
```
Solution:
1. Verify npm install completed successfully
2. Check if port 3000 is available (not used by another app)
3. Run: npm start from frontend directory
4. Clear node_modules and package-lock.json, then reinstall
5. Check console for build errors
```

### Database Issues

**Problem: MongoDB data not persisting**
```
Solution:
1. Verify MongoDB is storing data (check /data/db directory)
2. Check MongoDB logs: tail -f /var/log/mongodb/mongod.log
3. Verify sufficient disk space
4. Check MongoDB permissions on data directory
5. Use mongostat to monitor MongoDB status
```

**Problem: Database connection timeout**
```
Solution:
1. Verify MongoDB service is running
2. Check connection timeout value in application.yml
3. Verify network connectivity to MongoDB server
4. Check MongoDB authentication credentials
5. Monitor MongoDB with mongotop
```

### Performance Issues

**Problem: Slow API responses**
```
Solution:
1. Add database indexes to frequently queried fields
2. Implement pagination for large result sets
3. Use projection to return only needed fields
4. Monitor MongoDB with mongostat
5. Check server logs for slow queries
6. Implement caching for frequently accessed data
```

**Problem: React app is slow**
```
Solution:
1. Implement code splitting with React.lazy()
2. Use React.memo() for expensive components
3. Verify bundle size with: npm run build -- --analyze
4. Implement virtualization for large lists
5. Use browser DevTools Performance tab
6. Check for unnecessary re-renders with React DevTools Profiler
```

---

## Security Best Practices

### Backend Security

1. **JWT Token Management:**
   - Store JWT_SECRET in environment variables
   - Use strong, random secret (minimum 32 characters)
   - Implement token expiration (24 hours recommended)
   - Implement token refresh mechanism

2. **Authentication:**
   - Always verify Google OAuth token
   - Validate token signature before accepting
   - Implement rate limiting on login endpoint
   - Store only salted/hashed passwords

3. **Authorization:**
   - Implement role-based access control (RBAC)
   - Check user permissions before data access
   - Log authorization failures
   - Prevent privilege escalation

4. **Data Protection:**
   - Use HTTPS in production
   - Encrypt sensitive data in transit (TLS 1.2+)
   - Validate and sanitize all user inputs
   - Implement CORS properly

5. **Database Security:**
   - Use MongoDB authentication (username/password)
   - Restrict database access by IP
   - Enable encryption at rest
   - Regular database backups

### Frontend Security

1. **Authentication:**
   - Store JWT in secure HttpOnly cookies (if possible)
   - Implement token refresh before expiration
   - Clear sensitive data on logout
   - Prevent XSS attacks with proper escaping

2. **API Communication:**
   - Always use HTTPS in production
   - Validate SSL/TLS certificates
   - Implement request timeout
   - Send JWT in Authorization header

3. **Code Security:**
   - Keep dependencies updated
   - Use security headers (CSP, X-Frame-Options)
   - Implement input validation
   - Sanitize user input before display

---

## Version History & Recent Changes

### Latest Release (v1.0.0)
- ✅ Removed Lombok dependency for explicit JavaBeans
- ✅ Upgraded all DTO and Model classes
- ✅ Fixed service layer to use constructors
- ✅ Successfully compiled all 54 source files
- ✅ React dev server running successfully

### Previous Changes
- Google OAuth 2.0 integration
- MongoDB integration
- Spring Security implementation
- REST API development
- React frontend setup

---

## Support & Documentation

### Useful Resources
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [React Documentation](https://react.dev/)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)

### Getting Help
- Check troubleshooting section above
- Review application logs: `backend/logs/`
- Check browser console for frontend errors
- Use Git to track changes: `git log --oneline`

---

## Next Steps

1. **Customize application.yml** for your environment
2. **Configure Google OAuth credentials**
3. **Set up MongoDB** (local or cloud)
4. **Run backend**: `mvn spring-boot:run`
5. **Run frontend**: `npm start`
6. **Test authentication flow**
7. **Create test resources and bookings**
8. **Deploy to production** when ready

---

**Last Updated:** April 19, 2026
**Project Version:** 1.0.0
**Status:** ✅ Ready for Development & Testing

