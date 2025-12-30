# UniHub - University Portal Platform

UniHub is a comprehensive university portal platform that connects students, faculty, and administrators through events, blogs, and gamification features.

## Overview

UniHub provides a centralized platform for university communities to:
- Create and manage events (academic, social, sports, workshops)
- Share knowledge through blogs and articles
- Engage through gamification (points, badges, leaderboards)
- Real-time notifications via WebSocket
- Role-based access control (Student, Faculty, Admin)

## Tech Stack

### Backend
- **Framework**: Spring Boot 3.5.7
- **Language**: Java 17
- **Security**: Spring Security + JWT
- **Database**: PostgreSQL
- **ORM**: Hibernate/JPA
- **WebSocket**: STOMP over SockJS
- **Rate Limiting**: Bucket4j

### Frontend
- **Framework**: React 19.2.0
- **Build Tool**: Vite
- **UI Library**: React Bootstrap 5.3.3
- **Routing**: React Router DOM 6.28.0
- **HTTP Client**: Axios
- **Charts**: Recharts
- **WebSocket**: STOMP.js + SockJS

### Database
- **RDBMS**: PostgreSQL 18.1
- **Connection**: JDBC

## Key Features

### 1. Authentication & Authorization
- JWT-based authentication
- Role-based access control (STUDENT, FACULTY, ADMIN)
- Password reset with email tokens
- Rate limiting on sensitive endpoints

### 2. Event Management
- Create events with role-specific slots (Organizer, Volunteer, Attendee)
- Event approval workflow
- Points system for participation
- Event requests and approvals
- Event reporting system

### 3. Blog System
- Create and publish blogs (university-specific or global)
- Blog approval workflow
- Category-based organization
- Blog reporting system

### 4. Gamification
- Points system for activities
- Badge achievements
- University and global leaderboards
- Level progression
- Real-time points updates

### 5. Notifications
- Real-time WebSocket notifications
- Event updates
- Blog approvals
- Points and badge achievements
- System alerts

### 6. Admin Dashboard
- User management
- Event approvals
- Blog approvals
- Report management
- System statistics

## Project Structure

```
unihub/
├── src/main/java/com/example/unihub/
│   ├── config/          # Security, CORS, WebSocket configs
│   ├── controller/      # REST API endpoints
│   ├── dto/             # Request/Response objects
│   ├── enums/           # Enumerations
│   ├── exception/       # Exception handlers
│   ├── model/           # JPA entities
│   ├── repository/      # Data access layer
│   ├── security/        # JWT, authentication
│   ├── service/         # Business logic
│   └── util/            # Utility classes
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable React components
│   │   ├── context/     # React Context (Auth)
│   │   ├── hooks/       # Custom React hooks
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   └── utils/       # Utility functions
│   └── public/          # Static assets
└── docs/                # Documentation
```

## Quick Links

- [Setup Guide](./SETUP.md) - Installation and configuration
- [API Documentation](./API_DOCUMENTATION.md) - Complete API reference
- [Database Documentation](./DB_DOCUMENTATION.md) - Database schema and design
- [Architecture Documentation](./ARCHITECTURE.md) - HLD, LLD, and flow diagrams

## License

This project is licensed under the MIT License.

## Contributors

Developed as a university graduation project.
