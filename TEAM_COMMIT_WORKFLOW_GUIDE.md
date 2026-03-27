# Team Commit Workflow Guide

This guide explains how to split the Smart Campus project across four members, how to commit each module in order, and how to merge everything back into `main` with a clean workflow.

## 1. Recommended Team Flow

Use this order so shared code is owned by one person and module work does not collide:

1. Member 4 sets up the foundation first.
2. Member 1 commits Module A.
3. Member 2 commits Module B.
4. Member 3 commits Module C.
5. Member 4 commits Module D.
6. Member 4 commits Module E.
7. Member 4 finishes the shared integration files.

## 2. Branch Strategy

Create one branch per ownership area:

1. `member4-foundation`
2. `member1-module-a`
3. `member2-module-b`
4. `member3-module-c`
5. `member4-module-d-e`

Keep module branches focused. Do not mix Module A, B, and C files in the same branch unless they are shared integration files that belong to Member 4.

## 3. File Ownership Split

### Member 1 - Module A: Facilities & Assets Catalogue

Backend:

- `backend/src/main/java/com/smartcampus/controller/ResourceController.java`
- `backend/src/main/java/com/smartcampus/service/ResourceService.java`
- `backend/src/main/java/com/smartcampus/repository/ResourceRepository.java`
- `backend/src/main/java/com/smartcampus/model/Resource.java`
- `backend/src/main/java/com/smartcampus/model/ResourceType.java`
- `backend/src/main/java/com/smartcampus/model/ResourceStatus.java`
- `backend/src/main/java/com/smartcampus/dto/ResourceDTO.java`

Frontend:

- `frontend/src/pages/Resources.js`
- `frontend/src/styles/Resources.css`

### Member 2 - Module B: Booking Management

Backend:

- `backend/src/main/java/com/smartcampus/controller/BookingController.java`
- `backend/src/main/java/com/smartcampus/service/BookingService.java`
- `backend/src/main/java/com/smartcampus/repository/BookingRepository.java`
- `backend/src/main/java/com/smartcampus/model/Booking.java`
- `backend/src/main/java/com/smartcampus/model/BookingStatus.java`
- `backend/src/main/java/com/smartcampus/model/BookingComment.java`
- `backend/src/main/java/com/smartcampus/repository/BookingCommentRepository.java`
- `backend/src/main/java/com/smartcampus/dto/BookingDTO.java`
- `backend/src/main/java/com/smartcampus/exception/BookingConflictException.java`

Frontend:

- `frontend/src/pages/Bookings.js`
- `frontend/src/styles/Bookings.css`

### Member 3 - Module C: Maintenance & Incident Ticketing

Backend:

- `backend/src/main/java/com/smartcampus/controller/TicketController.java`
- `backend/src/main/java/com/smartcampus/service/TicketService.java`
- `backend/src/main/java/com/smartcampus/service/FileUploadService.java`
- `backend/src/main/java/com/smartcampus/config/FileUploadConfig.java`
- `backend/src/main/java/com/smartcampus/repository/TicketRepository.java`
- `backend/src/main/java/com/smartcampus/repository/TicketCommentRepository.java`
- `backend/src/main/java/com/smartcampus/repository/TicketAttachmentRepository.java`
- `backend/src/main/java/com/smartcampus/model/Ticket.java`
- `backend/src/main/java/com/smartcampus/model/TicketStatus.java`
- `backend/src/main/java/com/smartcampus/model/TicketPriority.java`
- `backend/src/main/java/com/smartcampus/model/TicketCategory.java`
- `backend/src/main/java/com/smartcampus/model/TicketComment.java`
- `backend/src/main/java/com/smartcampus/model/TicketAttachment.java`
- `backend/src/main/java/com/smartcampus/dto/TicketDTO.java`
- `backend/src/main/java/com/smartcampus/dto/CommentDTO.java`
- `TICKET_FILE_UPLOAD_DOCUMENTATION.md`

Frontend:

- `frontend/src/pages/Tickets.js`
- `frontend/src/styles/Tickets.css`

### Member 4 - Module D and Module E

Module D backend:

- `backend/src/main/java/com/smartcampus/controller/NotificationController.java`
- `backend/src/main/java/com/smartcampus/service/NotificationService.java`
- `backend/src/main/java/com/smartcampus/repository/NotificationRepository.java`
- `backend/src/main/java/com/smartcampus/model/Notification.java`
- `backend/src/main/java/com/smartcampus/model/NotificationType.java`
- `backend/src/main/java/com/smartcampus/dto/NotificationDTO.java`

Module D frontend:

- `frontend/src/pages/Notifications.js`
- `frontend/src/styles/Notifications.css`

Module E backend:

- `backend/src/main/java/com/smartcampus/controller/AuthController.java`
- `backend/src/main/java/com/smartcampus/controller/UserController.java`
- `backend/src/main/java/com/smartcampus/service/UserService.java`
- `backend/src/main/java/com/smartcampus/repository/UserRepository.java`
- `backend/src/main/java/com/smartcampus/model/User.java`
- `backend/src/main/java/com/smartcampus/model/UserRole.java`
- `backend/src/main/java/com/smartcampus/security/SecurityConfig.java`
- `backend/src/main/java/com/smartcampus/security/JwtAuthenticationFilter.java`
- `backend/src/main/java/com/smartcampus/security/JwtAuthenticationEntryPoint.java`
- `backend/src/main/java/com/smartcampus/security/OAuth2SuccessHandler.java`
- `backend/src/main/java/com/smartcampus/security/CustomUserDetailsService.java`
- `backend/src/main/java/com/smartcampus/util/JwtTokenProvider.java`
- `backend/src/main/java/com/smartcampus/dto/LoginRequest.java`
- `backend/src/main/java/com/smartcampus/dto/LoginResponse.java`
- `backend/src/main/java/com/smartcampus/dto/UserDTO.java`

Module E frontend:

- `frontend/src/context/AuthContext.js`
- `frontend/src/hooks/useAuth.js`
- `frontend/src/components/ProtectedRoute.js`
- `frontend/src/components/AdminRoute.js`
- `frontend/src/pages/Login.js`
- `frontend/src/pages/AuthSuccess.js`
- `frontend/src/styles/Login.css`

Shared integration files owned by Member 4:

- `frontend/src/services/api.js`
- `frontend/src/App.js`
- `frontend/src/components/Layout.js`
- `frontend/src/pages/AdminDashboard.js`
- `frontend/src/pages/Dashboard.js`
- `frontend/src/styles/App.css`
- `frontend/src/styles/Layout.css`
- `frontend/src/styles/AdminDashboard.css`
- `frontend/src/styles/Dashboard.css`

Foundation files owned by Member 4:

- `backend/pom.xml`
- `backend/src/main/java/com/smartcampus/SmartCampusHubApplication.java`
- `backend/src/main/java/com/smartcampus/config/AppConfig.java`
- `backend/src/main/java/com/smartcampus/config/DataInitializer.java`
- `backend/src/main/resources/application.yml`
- `backend/src/main/resources/mongodb-schema.js`
- `frontend/package.json`
- `frontend/public/index.html`
- `frontend/src/index.js`

## 4. Backdated Commit Timeline

Use a separate commit date for each milestone. Keep them in order.

Suggested sequence:

1. 2026-03-31 - Foundation setup
2. 2026-04-01 - Module A backend core
3. 2026-04-02 - Module A controller and UI
4. 2026-04-03 - Module B backend core
5. 2026-04-04 - Module B controller and comments
6. 2026-04-05 - Module B UI
7. 2026-04-06 - Module C backend core
8. 2026-04-08 - Module C attachments and UI
9. 2026-04-09 - Module D notifications
10. 2026-04-10 - Module E auth and access control
11. 2026-04-11 - Shared integration cleanup

## 5. Commit Date Pattern

Set both author and committer dates before each commit.

```powershell
$env:GIT_AUTHOR_DATE="2026-04-01T10:00:00+05:30"
$env:GIT_COMMITTER_DATE="2026-04-01T10:00:00+05:30"
git add <files>
git commit --author="Member Name <member@email.com>" -m "commit message"
Remove-Item Env:GIT_AUTHOR_DATE
Remove-Item Env:GIT_COMMITTER_DATE
```

Use the same timezone for every commit. If your team uses Sri Lanka time, use `+05:30`.

## 6. Exact Commit Order

### Foundation commit

1. Checkout `member4-foundation`
2. Add base backend and frontend setup files
3. Commit with a `2026-03-31` timestamp

### Module A commits

1. Commit resource model, repository, DTO, and service
2. Commit resource controller and frontend resource page

### Module B commits

1. Commit booking model, repository, DTO, service, and conflict exception
2. Commit booking controller and booking comment support
3. Commit bookings page and bookings stylesheet

### Module C commits

1. Commit ticket model, repository, DTOs, service, and controller
2. Commit attachment upload support and file upload config
3. Commit ticket page and ticket stylesheet

### Module D commits

1. Commit notification model, repository, DTO, service, and controller
2. Commit notification page and stylesheet

### Module E commits

1. Commit user model, repository, service, and controller
2. Commit security config, JWT, OAuth2, and login DTOs
3. Commit frontend auth context, routes, login, and OAuth success page

### Integration commit

1. Commit shared API client, app routing, layout, dashboard, and shared styles
2. This should be the last commit before merge to `main`

## 7. Merge Order to Main

Merge the branches in this order:

1. `member4-foundation`
2. `member1-module-a`
3. `member2-module-b`
4. `member3-module-c`
5. `member4-module-d-e`

Use `--no-ff` for clear history.

## 8. Practical Rules

1. Do not let two members edit the same shared file.
2. Keep Member 4 in charge of routing, security, global config, and integration files.
3. Commit module work in small logical chunks, not all at once.
4. Keep commit dates chronological.
5. Verify each module before moving to the next one.

## 9. Quick Checklist Before Each Commit

1. Files belong to only one module owner.
2. Commit message matches the module and milestone.
3. Author date and committer date are set.
4. No unrelated files are included in the `git add`.
5. Commit date is later than the previous commit.

## 10. Short Summary

The safest workflow is:

Foundation first, then Module A, Module B, Module C, Module D, Module E, and finally shared integration. Keep Member 4 responsible for all shared files so the module branches stay clean and easy to merge.