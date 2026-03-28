# SmartSpace - Quick Reference & Checklists

## Quick Start Commands

### Backend
```bash
# Setup & Build
cd backend
mvn clean compile              # Compile only
mvn clean package -DskipTests  # Build (skip tests)
mvn test                       # Run tests

# Run
mvn spring-boot:run            # Development mode
java -jar target/*.jar         # Run compiled JAR
```

### Frontend
```bash
# Setup & Build
cd frontend
npm install                    # Install dependencies
npm run build                  # Production build
npm test                       # Run tests

# Run
npm start                      # Development server (port 3000)
```

### MongoDB
```bash
# macOS
brew services start mongodb-community
brew services stop mongodb-community

# Linux
sudo systemctl start mongodb
sudo systemctl stop mongodb
sudo systemctl status mongodb

# Test connection
mongo mongodb://localhost:27017
```

---

## API Quick Reference

### Common Headers
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
Accept: application/json
```

### Request Examples

**Login:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@campus.edu",
    "googleId": "google-oauth-123"
  }'
```

**Get Resources:**
```bash
curl -X GET http://localhost:8080/api/resources \
  -H "Authorization: Bearer <TOKEN>"
```

**Create Booking:**
```bash
curl -X POST http://localhost:8080/api/bookings \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "resourceId": "123",
    "title": "Meeting",
    "startTime": "2026-04-25T14:00:00Z",
    "endTime": "2026-04-25T15:00:00Z"
  }'
```

---

## File Locations Reference

### Important Directories

| Path | Purpose |
|------|---------|
| `backend/src/main/java/com/smartcampus/` | Backend source code |
| `backend/target/classes/` | Compiled backend classes |
| `backend/target/*.jar` | Built JAR file |
| `frontend/src/` | Frontend source code |
| `frontend/build/` | Production build output |
| `frontend/node_modules/` | NPM dependencies |

### Configuration Files

| File | Purpose |
|------|---------|
| `backend/pom.xml` | Maven dependencies & build config |
| `backend/src/main/resources/application.yml` | Backend properties |
| `frontend/package.json` | NPM dependencies |
| `frontend/.env` | Frontend environment variables |

---

## Port Reference

| Port | Service | URL |
|------|---------|-----|
| 3000 | React Frontend | http://localhost:3000 |
| 8080 | Spring Boot API | http://localhost:8080 |
| 27017 | MongoDB | mongodb://localhost:27017 |

---

## Pre-Deployment Checklist ✓

### Code Quality
- [ ] All code committed to Git
- [ ] No TODO/FIXME comments left
- [ ] No console.log statements in production code
- [ ] No hardcoded credentials
- [ ] All tests passing
- [ ] Code review completed
- [ ] No deprecated API usage

### Backend Configuration
- [ ] application.yml updated for production
- [ ] JWT secret configured (32+ characters)
- [ ] MongoDB connection string verified
- [ ] Google OAuth credentials configured
- [ ] CORS origins updated
- [ ] Logging level appropriate
- [ ] Error handling comprehensive
- [ ] Database indexes created

### Frontend Configuration
- [ ] .env file updated for production
- [ ] API URL points to production backend
- [ ] Google OAuth redirect URI updated
- [ ] Build tested: `npm run build`
- [ ] No console errors
- [ ] Performance checked
- [ ] Responsive design verified on mobile

### Security
- [ ] HTTPS enabled in production
- [ ] All sensitive data in environment variables
- [ ] Database authentication enabled
- [ ] Firewall rules configured
- [ ] Security headers added
- [ ] CORS properly configured
- [ ] Input validation implemented
- [ ] No SQL injection vulnerabilities
- [ ] No XSS vulnerabilities

### Database
- [ ] MongoDB backup created
- [ ] Indexes created on frequently queried fields
- [ ] Database permissions restricted
- [ ] Encryption at rest enabled
- [ ] Connection pooling configured
- [ ] Slow query logging enabled

### Monitoring & Logging
- [ ] Application logging configured
- [ ] Error logging/alerting setup
- [ ] Performance monitoring enabled
- [ ] Database monitoring enabled
- [ ] Log rotation configured
- [ ] Centralized logging setup (optional)

### Documentation
- [ ] README updated with setup instructions
- [ ] API documentation complete
- [ ] Environment variables documented
- [ ] Deployment procedures documented
- [ ] Troubleshooting guide provided

### Deployment
- [ ] Server provisioned and configured
- [ ] Domain name configured (if applicable)
- [ ] SSL certificate installed
- [ ] Database migrated
- [ ] Backups scheduled
- [ ] Monitoring configured
- [ ] Incident response plan ready

---

## Environment Setup by OS

### Windows

```bash
# Install Java
# Download from https://www.oracle.com/java/technologies/downloads/

# Install Node.js
# Download from https://nodejs.org/

# Install MongoDB
# Download from https://www.mongodb.com/try/download/community
# Or use Chocolatey:
choco install mongodb-community

# Install Git
choco install git

# Verify installations
java -version
node -v
npm -v
mongo --version
```

### macOS

```bash
# Install Homebrew first (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Java
brew install openjdk@17
echo 'export PATH="/usr/local/opt/openjdk@17/bin:$PATH"' >> ~/.zshrc

# Install Node.js
brew install node

# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community

# Verify installations
java -version
node -v
npm -v
mongod --version
```

### Linux (Ubuntu/Debian)

```bash
# Update packages
sudo apt-get update
sudo apt-get upgrade -y

# Install Java
sudo apt-get install -y openjdk-17-jdk-headless

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
sudo apt-get install -y mongodb

# Verify installations
java -version
node -v
npm -v
mongod --version
```

---

## IDE Setup

### IntelliJ IDEA

**Plugins to Install:**
- Spring Boot Assistant
- Lombok Annotations Support (NO LONGER NEEDED)
- MongoDB plugin
- Axios (optional)

**Configuration:**
1. File → Project Structure → SDKs → Add JDK 17
2. Preferences → Editor → Inspections → Add Spring checks
3. Preferences → Editor → Code Style → Set to 4 spaces

### VS Code

**Extensions to Install:**
```json
{
  "extensions": [
    "Extension Pack for Java",
    "Spring Boot Extension Pack",
    "MongoDB for VS Code",
    "Prettier - Code formatter",
    "ESLint",
    "Thunder Client" (API testing)
  ]
}
```

**Settings (.vscode/settings.json):**
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.tabSize": 4,
  "java.home": "/path/to/jdk17",
  "java.server.launchMode": "Standard"
}
```

---

## Build & Deploy Commands

### Local Development

```bash
# Terminal 1: Backend
cd backend && mvn spring-boot:run

# Terminal 2: Frontend
cd frontend && npm start

# Terminal 3: MongoDB (if needed)
mongod
```

### Production Build

```bash
# Backend
cd backend
mvn clean package -DskipTests
docker build -t smartspace-backend:1.0 .
docker push your-registry/smartspace-backend:1.0

# Frontend
cd frontend
npm run build
# Deploy build/ folder to hosting service
```

### Docker Compose (All Services)

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:5.0
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

  backend:
    build: ./backend
    ports:
      - "8080:8080"
    environment:
      - SPRING_DATA_MONGODB_URI=mongodb://mongodb:27017/smartspace
      - GOOGLE_CLIENT_ID=your_client_id
      - GOOGLE_CLIENT_SECRET=your_secret
    depends_on:
      - mongodb

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://localhost:8080
    depends_on:
      - backend

volumes:
  mongodb_data:
```

**Run:**
```bash
docker-compose up -d       # Start all services
docker-compose down        # Stop all services
docker-compose logs -f     # View logs
```

---

## Common Issues & Quick Fixes

| Issue | Quick Fix |
|-------|-----------|
| Port 3000/8080 in use | `lsof -i :3000` then `kill -9 <PID>` |
| MongoDB connection refused | Check MongoDB running: `mongod` or `brew services start mongodb-community` |
| npm install slow | Clear cache: `npm cache clean --force` |
| Build fails on test | Use `-DskipTests` flag for Maven |
| CORS errors | Check `application.yml` CORS config |
| JWT token expired | Clear localStorage and re-login |
| Google OAuth not working | Verify client ID in `.env` and redirect URI |

---

## Performance Tips

### Backend Optimization
- Add pagination to list endpoints
- Create MongoDB indexes on frequently queried fields
- Implement caching with Redis
- Use lazy loading for associations
- Monitor slow queries
- Implement request timeout

### Frontend Optimization
- Code splitting with React.lazy()
- Image compression and lazy loading
- Minimize CSS/JS bundles
- Enable gzip compression
- Use CDN for static assets
- Implement virtual scrolling for large lists

### Database Optimization
```javascript
// MongoDB index examples
db.resources.createIndex({ "status": 1 })
db.bookings.createIndex({ "resourceId": 1, "startTime": 1 })
db.users.createIndex({ "email": 1 }, { unique: true })
```

---

## Git Workflow

```bash
# Clone repository
git clone https://github.com/Lahindu2001/Smartspace_with_0.git

# Create feature branch
git checkout -b feature/my-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push to remote
git push origin feature/my-feature

# Create pull request on GitHub
# After review, merge to main

# Update local main
git checkout main
git pull origin main
```

---

## Useful MongoDB Queries

```javascript
// Connect to MongoDB
mongo mongodb://localhost:27017/smartspace

// View all databases
show dbs

// Use smartspace database
use smartspace

// Show all collections
show collections

// Find all resources
db.resources.find()

// Find resource by ID
db.resources.findOne({ _id: ObjectId("...") })

// Find available resources
db.resources.find({ status: "AVAILABLE" })

// Count resources by status
db.resources.aggregate([
  { $group: { _id: "$status", count: { $sum: 1 } } }
])

// Find bookings in date range
db.bookings.find({
  startTime: { $gte: new Date("2026-04-25"), $lt: new Date("2026-04-26") }
})

// Create indexes
db.resources.createIndex({ status: 1 })
db.bookings.createIndex({ resourceId: 1, startTime: 1 })
db.users.createIndex({ email: 1 }, { unique: true })

// Backup database
mongodump --out ./backup

// Restore database
mongorestore ./backup
```

---

## Useful Terminal Commands

```bash
# Check if port is in use
lsof -i :8080              # macOS/Linux
netstat -ano | findstr :8080  # Windows

# Kill process on port
kill -9 <PID>              # macOS/Linux
taskkill /PID <PID> /F     # Windows

# View file size
du -sh folder/             # macOS/Linux
dir /s /b folder           # Windows

# Monitor processes
top                        # macOS/Linux
tasklist                   # Windows

# View logs in real-time
tail -f logfile.log
Get-Content logfile.log -Tail 20 -Wait  # PowerShell
```

---

## Deployment Platforms

### Recommended Platforms

**Backend:**
- AWS EC2 / Elastic Beanstalk
- Google Cloud App Engine
- Azure App Service
- Heroku
- DigitalOcean

**Frontend:**
- Netlify
- Vercel
- AWS S3 + CloudFront
- Firebase Hosting
- GitHub Pages

**Database:**
- MongoDB Atlas (Cloud)
- AWS DocumentDB
- Azure CosmosDB

---

## Version Control Tips

```bash
# View commit history
git log --oneline

# View recent changes
git diff

# Undo recent commit (keep changes)
git reset --soft HEAD~1

# Discard recent commit
git reset --hard HEAD~1

# Stash changes temporarily
git stash
git stash pop

# Create release tag
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

---

## Additional Resources

- [Spring Boot Docs](https://spring.io/projects/spring-boot)
- [MongoDB University](https://university.mongodb.com/)
- [React Documentation](https://react.dev)
- [OAuth 2.0](https://oauth.net/2/)
- [REST API Best Practices](https://restfulapi.net/)
- [Docker Documentation](https://docs.docker.com/)
- [Git Documentation](https://git-scm.com/doc)

---

**Document Generated:** April 19, 2026
**Project:** SmartSpace v1.0.0
