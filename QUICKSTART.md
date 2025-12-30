# UniHub - Quick Start Guide

This guide will help you get UniHub up and running in minutes.

## Prerequisites Checklist

- [ ] Java 17+ installed
- [ ] Maven 3.6+ installed
- [ ] Node.js 18+ and npm installed
- [ ] PostgreSQL 14+ installed
- [ ] Git installed

## 5-Minute Setup

### Step 1: Clone Repository
```bash
git clone <repository-url>
cd unihub
```

### Step 2: Setup Database
```bash
# Start PostgreSQL and create database
psql -U postgres
CREATE DATABASE unihub_db;
\q
```

### Step 3: Configure Backend
Edit `src/main/resources/application.properties`:
```properties
spring.datasource.password=your_postgres_password
```

### Step 4: Start Backend
```bash
# In project root
./mvnw spring-boot:run
```

Backend runs on: http://localhost:8080

### Step 5: Setup Frontend
```bash
# Open new terminal
cd frontend
npm install
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:8080/api
VITE_WS_URL=http://localhost:8080/ws
```

### Step 6: Start Frontend
```bash
npm run dev
```

Frontend runs on: http://localhost:5173

## Default Login

**Admin Account:**
- Email: admin@unihub.com
- Password: Admin@123

⚠️ Change this password immediately!

## Verify Installation

1. Open browser: http://localhost:5173
2. Login with admin credentials
3. Check dashboard loads correctly

## Common Issues

**Port 8080 in use:**
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8080 | xargs kill -9
```

**Database connection failed:**
- Verify PostgreSQL is running
- Check credentials in application.properties
- Ensure database exists

**Frontend can't connect:**
- Verify backend is running on port 8080
- Check CORS settings in application.properties
- Verify .env file in frontend directory

## Project Structure

```
unihub/
├── src/                    # Backend source code
├── frontend/               # Frontend React app
├── docs/                   # Documentation
├── README.md               # Project overview
├── SETUP.md                # Detailed setup guide
├── API_DOCUMENTATION.md    # API reference
├── DB_DOCUMENTATION.md     # Database schema
└── ARCHITECTURE.md         # System architecture
```

## Key Features to Test

1. **Authentication**
   - Register new user
   - Login/Logout
   - Password reset

2. **Events**
   - Create event (requires approval)
   - Join event
   - View event details

3. **Blogs**
   - Create blog post
   - View blogs
   - Admin approval

4. **Gamification**
   - View leaderboard
   - Check points
   - Earn badges

5. **Admin Panel**
   - Approve events
   - Approve blogs
   - View statistics

## Development Workflow

1. Make changes to code
2. Backend auto-reloads (Spring DevTools)
3. Frontend auto-reloads (Vite HMR)
4. Test changes in browser
5. Commit changes

## Testing APIs

### Using cURL
```bash
# Register
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"Test@123","role":"STUDENT","universityId":1}'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test@123"}'
```

### Using Postman
1. Import API collection
2. Set baseUrl = http://localhost:8080/api
3. Test endpoints

## Next Steps

- [ ] Change admin password
- [ ] Create test users
- [ ] Create sample events
- [ ] Test all features
- [ ] Read full documentation

## Documentation

- [README.md](./README.md) - Project overview
- [SETUP.md](./SETUP.md) - Detailed setup instructions
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - Complete API reference
- [DB_DOCUMENTATION.md](./DB_DOCUMENTATION.md) - Database schema
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture

## Support

For detailed information, refer to the documentation files above.

## Production Deployment

For production deployment:
1. Change JWT secret to strong random string
2. Set `spring.jpa.hibernate.ddl-auto=validate`
3. Disable SQL logging
4. Use environment variables for sensitive data
5. Enable HTTPS
6. Configure proper CORS origins
7. Set up database backups
8. Configure monitoring and logging

---

Happy coding! 🚀
