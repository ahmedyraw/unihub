# Architecture Documentation

High-Level Design (HLD), Low-Level Design (LLD), and system flow documentation for UniHub.

---

## Table of Contents
1. [High-Level Design (HLD)](#high-level-design-hld)
2. [Low-Level Design (LLD)](#low-level-design-lld)
3. [System Flows](#system-flows)
4. [Component Details](#component-details)
5. [Security Architecture](#security-architecture)
6. [Deployment Architecture](#deployment-architecture)

---

## High-Level Design (HLD)

### System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Browser    │  │    Mobile    │  │   Desktop    │      │
│  │  (React App) │  │     App      │  │     App      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                    HTTP/HTTPS + WebSocket
                            │
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Spring Boot REST API                     │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐     │   │
│  │  │   Auth     │  │   Event    │  │    Blog    │     │   │
│  │  │ Controller │  │ Controller │  │ Controller │     │   │
│  │  └────────────┘  └────────────┘  └────────────┘     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                     Security Layer                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  JWT Filter │ Rate Limiter │ CORS │ Spring Security │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                     Business Layer                           │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │   Auth     │  │   Event    │  │    Blog    │           │
│  │  Service   │  │  Service   │  │  Service   │           │
│  └────────────┘  └────────────┘  └────────────┘           │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │Gamification│  │Notification│  │   Report   │           │
│  │  Service   │  │  Service   │  │  Service   │           │
│  └────────────┘  └────────────┘  └────────────┘           │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                    Data Access Layer                         │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │    User    │  │   Event    │  │    Blog    │           │
│  │ Repository │  │ Repository │  │ Repository │           │
│  └────────────┘  └────────────┘  └────────────┘           │
│                  Spring Data JPA                             │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                      Database Layer                          │
│                    PostgreSQL Database                       │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐        │
│  │Users │  │Events│  │Blogs │  │Badges│  │Points│        │
│  └──────┘  └──────┘  └──────┘  └──────┘  └──────┘        │
└─────────────────────────────────────────────────────────────┘
```

### Key Components

1. **Frontend (React)**
   - Single Page Application (SPA)
   - Component-based architecture
   - State management with Context API
   - Real-time updates via WebSocket

2. **Backend (Spring Boot)**
   - RESTful API
   - JWT authentication
   - WebSocket for real-time notifications
   - Rate limiting for security

3. **Database (PostgreSQL)**
   - Relational data model
   - ACID compliance
   - Indexed for performance

---

## Low-Level Design (LLD)

### Backend Package Structure

```
com.example.unihub/
│
├── config/
│   ├── SecurityConfig.java          # Spring Security configuration
│   ├── CorsConfig.java               # CORS settings
│   ├── WebSocketConfig.java          # WebSocket configuration
│   ├── DataInitializer.java          # Initial data setup
│   └── DatabaseConstraintUpdater.java
│
├── controller/
│   ├── AuthController.java           # /api/auth/*
│   ├── UserController.java           # /api/users/*
│   ├── EventController.java          # /api/events/*
│   ├── EventRequestController.java   # /api/event-requests/*
│   ├── BlogController.java           # /api/blogs/*
│   ├── GamificationController.java   # /api/gamification/*
│   ├── NotificationController.java   # /api/notifications/*
│   ├── ReportController.java         # /api/reports/*
│   └── AdminController.java          # /api/admin/*
│
├── dto/
│   ├── request/
│   │   ├── LoginRequest.java
│   │   ├── RegisterRequest.java
│   │   ├── CreateEventRequest.java
│   │   ├── CreateBlogRequest.java
│   │   └── ...
│   └── response/
│       ├── AuthResponse.java
│       ├── EventResponse.java
│       └── ...
│
├── model/
│   ├── User.java                     # @Entity
│   ├── University.java               # @Entity
│   ├── Event.java                    # @Entity
│   ├── EventParticipant.java         # @Entity
│   ├── EventRequest.java             # @Entity
│   ├── Blog.java                     # @Entity
│   ├── Badge.java                    # @Entity
│   ├── UserBadge.java                # @Entity
│   ├── PointsLog.java                # @Entity
│   ├── Notification.java             # @Entity
│   └── ...
│
├── repository/
│   ├── UserRepository.java           # extends JpaRepository
│   ├── EventRepository.java
│   ├── BlogRepository.java
│   └── ...
│
├── service/
│   ├── AuthService.java              # Authentication logic
│   ├── UserService.java              # User management
│   ├── EventService.java             # Event management
│   ├── EventRequestService.java      # Event request handling
│   ├── BlogService.java              # Blog management
│   ├── GamificationService.java      # Points & badges
│   ├── LeaderboardService.java       # Leaderboard logic
│   ├── NotificationService.java      # Notification handling
│   ├── PasswordResetService.java     # Password reset
│   └── ...
│
├── security/
│   ├── JwtUtil.java                  # JWT token generation/validation
│   ├── JwtAuthenticationFilter.java  # JWT filter
│   ├── CustomUserDetailsService.java # User details for auth
│   └── RateLimitingFilter.java       # Rate limiting
│
├── exception/
│   ├── GlobalExceptionHandler.java   # @ControllerAdvice
│   ├── ResourceNotFoundException.java
│   └── UnauthorizedException.java
│
├── enums/
│   ├── UserRole.java                 # STUDENT, FACULTY, ADMIN
│   ├── EventStatus.java              # PENDING, APPROVED, CANCELLED
│   ├── BlogStatus.java               # PENDING, APPROVED, REJECTED
│   ├── ParticipantRole.java          # ORGANIZER, VOLUNTEER, ATTENDEE
│   └── NotificationType.java
│
└── util/
    └── PasswordValidator.java        # Password validation utility
```

### Frontend Structure

```
frontend/src/
│
├── components/
│   ├── Navbar.jsx                    # Navigation bar
│   ├── Footer.jsx                    # Footer component
│   ├── ProtectedRoute.jsx            # Route guard
│   ├── EventCard.jsx                 # Event display card
│   ├── BlogCard.jsx                  # Blog display card
│   └── ...
│
├── pages/
│   ├── Home.jsx                      # Landing page
│   ├── Login.jsx                     # Login page
│   ├── Register.jsx                  # Registration page
│   ├── Dashboard.jsx                 # User dashboard
│   ├── Events.jsx                    # Events listing
│   ├── EventDetails.jsx              # Event details
│   ├── CreateEvent.jsx               # Create event form
│   ├── Blogs.jsx                     # Blogs listing
│   ├── BlogDetails.jsx               # Blog details
│   ├── CreateBlog.jsx                # Create blog form
│   ├── Leaderboard.jsx               # Leaderboard page
│   ├── Profile.jsx                   # User profile
│   └── AdminDashboard.jsx            # Admin panel
│
├── context/
│   └── AuthContext.jsx               # Authentication context
│
├── services/
│   ├── api.js                        # Axios instance
│   ├── authService.js                # Auth API calls
│   ├── eventService.js               # Event API calls
│   ├── blogService.js                # Blog API calls
│   ├── gamificationService.js        # Gamification API calls
│   └── websocketService.js           # WebSocket connection
│
├── hooks/
│   ├── useAuth.js                    # Auth hook
│   └── useWebSocket.js               # WebSocket hook
│
└── utils/
    ├── validation.js                 # Form validation
    └── dateFormatter.js              # Date formatting
```

---

## System Flows

### 1. User Registration Flow

```
┌──────┐                ┌──────────┐              ┌──────────┐
│Client│                │ Backend  │              │ Database │
└──┬───┘                └────┬─────┘              └────┬─────┘
   │                         │                         │
   │ POST /auth/register     │                         │
   │ {name, email, password} │                         │
   ├────────────────────────>│                         │
   │                         │                         │
   │                         │ Validate input          │
   │                         │ Hash password           │
   │                         │                         │
   │                         │ INSERT INTO users       │
   │                         ├────────────────────────>│
   │                         │                         │
   │                         │ User created            │
   │                         │<────────────────────────┤
   │                         │                         │
   │                         │ Generate JWT token      │
   │                         │                         │
   │                         │ Award Newcomer badge    │
   │                         ├────────────────────────>│
   │                         │                         │
   │ 200 OK                  │                         │
   │ {token, user details}   │                         │
   │<────────────────────────┤                         │
   │                         │                         │
```

### 2. Event Creation & Approval Flow

```
┌────────┐        ┌────────┐        ┌────────┐        ┌────────┐
│Student │        │Backend │        │Database│        │ Admin  │
└───┬────┘        └───┬────┘        └───┬────┘        └───┬────┘
    │                 │                 │                 │
    │ Create Event    │                 │                 │
    ├────────────────>│                 │                 │
    │                 │ Save (PENDING)  │                 │
    │                 ├────────────────>│                 │
    │                 │                 │                 │
    │ Event Created   │                 │                 │
    │<────────────────┤                 │                 │
    │                 │                 │                 │
    │                 │ Notify Admin    │                 │
    │                 ├─────────────────┼────────────────>│
    │                 │                 │                 │
    │                 │                 │  Review Event   │
    │                 │                 │                 │
    │                 │ Approve Event   │                 │
    │                 │<────────────────┼─────────────────┤
    │                 │                 │                 │
    │                 │ Update (APPROVED)                 │
    │                 ├────────────────>│                 │
    │                 │                 │                 │
    │ Notify Creator  │                 │                 │
    │<────────────────┤                 │                 │
    │                 │                 │                 │
```

### 3. Event Join Request Flow

```
┌────────┐        ┌────────┐        ┌────────┐        ┌─────────┐
│Student │        │Backend │        │Database│        │ Creator │
└───┬────┘        └───┬────┘        └───┬────┘        └────┬────┘
    │                 │                 │                  │
    │ Join Event      │                 │                  │
    │ (ATTENDEE)      │                 │                  │
    ├────────────────>│                 │                  │
    │                 │                 │                  │
    │                 │ Check capacity  │                  │
    │                 ├────────────────>│                  │
    │                 │                 │                  │
    │                 │ Create request  │                  │
    │                 ├────────────────>│                  │
    │                 │                 │                  │
    │ Request Created │                 │                  │
    │<────────────────┤                 │                  │
    │                 │                 │                  │
    │                 │ Notify Creator  │                  │
    │                 ├─────────────────┼─────────────────>│
    │                 │                 │                  │
    │                 │ Approve Request │                  │
    │                 │<────────────────┼──────────────────┤
    │                 │                 │                  │
    │                 │ Create participant                 │
    │                 ├────────────────>│                  │
    │                 │                 │                  │
    │                 │ Award points    │                  │
    │                 ├────────────────>│                  │
    │                 │                 │                  │
    │ Notify Student  │                 │                  │
    │<────────────────┤                 │                  │
    │                 │                 │                  │
```

### 4. Gamification Flow

```
┌──────┐              ┌──────────┐              ┌──────────┐
│ User │              │ Backend  │              │ Database │
└──┬───┘              └────┬─────┘              └────┬─────┘
   │                       │                         │
   │ Perform Action        │                         │
   │ (e.g., join event)    │                         │
   ├──────────────────────>│                         │
   │                       │                         │
   │                       │ Calculate points        │
   │                       │                         │
   │                       │ UPDATE users            │
   │                       │ SET points = points + X │
   │                       ├────────────────────────>│
   │                       │                         │
   │                       │ INSERT points_log       │
   │                       ├────────────────────────>│
   │                       │                         │
   │                       │ Check badge eligibility │
   │                       ├────────────────────────>│
   │                       │                         │
   │                       │ Award badge (if earned) │
   │                       ├────────────────────────>│
   │                       │                         │
   │                       │ Check level up          │
   │                       │                         │
   │                       │ Send notification       │
   │                       │ (WebSocket)             │
   │<──────────────────────┤                         │
   │ "You earned 10 points!"                         │
   │                       │                         │
```

### 5. Real-time Notification Flow

```
┌──────┐         ┌──────────┐         ┌──────────┐         ┌──────┐
│User A│         │WebSocket │         │ Backend  │         │User B│
└──┬───┘         └────┬─────┘         └────┬─────┘         └──┬───┘
   │                  │                    │                  │
   │ Connect          │                    │                  │
   ├─────────────────>│                    │                  │
   │                  │                    │                  │
   │ Subscribe        │                    │                  │
   │ /user/queue/     │                    │                  │
   │ notifications    │                    │                  │
   ├─────────────────>│                    │                  │
   │                  │                    │                  │
   │                  │                    │ Event occurs     │
   │                  │                    │ (e.g., approval) │
   │                  │                    │<─────────────────┤
   │                  │                    │                  │
   │                  │                    │ Create notification
   │                  │                    │ in database      │
   │                  │                    │                  │
   │                  │ Send notification  │                  │
   │                  │<───────────────────┤                  │
   │                  │                    │                  │
   │ Receive message  │                    │                  │
   │<─────────────────┤                    │                  │
   │                  │                    │                  │
   │ Display toast    │                    │                  │
   │                  │                    │                  │
```

---

## Component Details

### Authentication Component

**Responsibilities:**
- User registration
- User login
- JWT token generation
- Password reset
- Token validation

**Key Classes:**
- AuthController
- AuthService
- JwtUtil
- CustomUserDetailsService
- PasswordResetService

**Flow:**
1. User submits credentials
2. Validate credentials against database
3. Generate JWT token
4. Return token to client
5. Client includes token in subsequent requests

---

### Event Management Component

**Responsibilities:**
- Event CRUD operations
- Event approval workflow
- Participant management
- Event request handling
- Points distribution

**Key Classes:**
- EventController
- EventService
- EventRequestController
- EventRequestService
- EventParticipantRepository

**Business Rules:**
- Events require admin approval
- Capacity limits enforced
- Points awarded on approval
- Creator can approve join requests

---

### Gamification Component

**Responsibilities:**
- Points calculation
- Badge management
- Level progression
- Leaderboard generation
- Points history tracking

**Key Classes:**
- GamificationService
- LeaderboardService
- BadgeRepository
- PointsLogRepository

**Point System:**
- Event organizer: 50 points
- Event volunteer: 30 points
- Event attendee: 10 points
- Blog approved: 50 points

---

### Notification Component

**Responsibilities:**
- Create notifications
- Send real-time updates
- Mark as read
- Notification history

**Key Classes:**
- NotificationService
- NotificationController
- WebSocketConfig

**Notification Types:**
- LEVEL_UP
- BADGE_EARNED
- EVENT_UPDATE
- BLOG_APPROVAL
- POINTS_UPDATE

---

## Security Architecture

### Authentication Flow

```
1. User Login
   ↓
2. Validate Credentials
   ↓
3. Generate JWT Token
   ↓
4. Return Token to Client
   ↓
5. Client stores token (localStorage)
   ↓
6. Include token in Authorization header
   ↓
7. JwtAuthenticationFilter validates token
   ↓
8. Set SecurityContext
   ↓
9. Allow request to proceed
```

### Security Layers

1. **Rate Limiting**
   - Login: 5 requests/minute
   - Register: 3 requests/minute
   - Password reset: 3 requests/15 minutes

2. **JWT Authentication**
   - Token expiration: 24 hours
   - Secret key: 256-bit minimum
   - Signed with HMAC-SHA256

3. **Password Security**
   - Bcrypt hashing
   - Minimum 8 characters
   - Must include: uppercase, lowercase, digit, special char

4. **CORS Configuration**
   - Allowed origins: Frontend URL
   - Allowed methods: GET, POST, PUT, DELETE
   - Credentials: true

5. **Input Validation**
   - @Valid annotations
   - Custom validators
   - SQL injection prevention (JPA)
   - XSS prevention (sanitization)

---

## Deployment Architecture

### Development Environment

```
┌─────────────────────────────────────────┐
│         Developer Machine               │
│                                         │
│  ┌──────────────┐  ┌─────────────────┐ │
│  │   Frontend   │  │    Backend      │ │
│  │ (Vite:5173)  │  │ (Spring:8080)   │ │
│  └──────────────┘  └─────────────────┘ │
│                                         │
│  ┌─────────────────────────────────────┤
│  │   PostgreSQL (localhost:5432)       │
│  └─────────────────────────────────────┘
└─────────────────────────────────────────┘
```

### Production Environment

```
┌─────────────────────────────────────────────────┐
│                Load Balancer                     │
└────────────────┬────────────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
┌───────▼──────┐  ┌───────▼──────┐
│   Frontend   │  │   Frontend   │
│   (Nginx)    │  │   (Nginx)    │
└──────────────┘  └──────────────┘
        │                 │
        └────────┬────────┘
                 │
        ┌────────▼────────┐
        │  API Gateway    │
        └────────┬────────┘
                 │
        ┌────────┴────────┐
        │                 │
┌───────▼──────┐  ┌───────▼──────┐
│   Backend    │  │   Backend    │
│ (Spring Boot)│  │ (Spring Boot)│
└──────┬───────┘  └───────┬──────┘
       │                  │
       └────────┬─────────┘
                │
        ┌───────▼────────┐
        │   PostgreSQL   │
        │   (Primary)    │
        └────────────────┘
```

---

## Performance Considerations

1. **Database Optimization**
   - Indexes on foreign keys
   - Query optimization
   - Connection pooling

2. **Caching**
   - Static content caching
   - API response caching (future)
   - Database query caching

3. **Pagination**
   - Events listing
   - Blogs listing
   - Leaderboard

4. **Lazy Loading**
   - JPA relationships
   - Frontend components

---

## Scalability

### Horizontal Scaling
- Multiple backend instances
- Load balancer distribution
- Stateless architecture (JWT)

### Vertical Scaling
- Increase server resources
- Database optimization
- Connection pool tuning

---

## Next Steps

- Review [API Documentation](./API_DOCUMENTATION.md)
- Review [Database Documentation](./DB_DOCUMENTATION.md)
- Review [Setup Guide](./SETUP.md)
- Implement monitoring and logging
- Set up CI/CD pipeline
