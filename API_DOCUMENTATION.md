# API Documentation

Complete API reference for UniHub platform.

## Base URL
```
http://localhost:8080/api
```

## Authentication

All protected endpoints require JWT token in header:
```
Authorization: Bearer <jwt_token>
```

---

## 1. Authentication APIs

### 1.1 Register User
**POST** `/auth/register`

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass@123",
  "role": "STUDENT",
  "universityId": 1
}
```

**Response:** `200 OK`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "STUDENT",
  "universityId": 1,
  "universityName": "University of Jordan"
}
```

**Validation Rules:**
- Name: Required, 2-100 characters
- Email: Valid email format
- Password: Min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char
- Role: STUDENT, FACULTY, or ADMIN
- UniversityId: Must exist in database

---

### 1.2 Login
**POST** `/auth/login`

**Request:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass@123"
}
```

**Response:** `200 OK`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "STUDENT",
  "universityId": 1,
  "universityName": "University of Jordan"
}
```

**Error:** `401 Unauthorized`
```json
{
  "error": "Invalid credentials"
}
```

---

### 1.3 Forgot Password
**POST** `/auth/forgot-password`

**Request:**
```json
{
  "email": "john@example.com"
}
```

**Response:** `200 OK`
```json
{
  "message": "Password reset link sent to email"
}
```

---

### 1.4 Reset Password
**POST** `/auth/reset-password`

**Request:**
```json
{
  "token": "reset-token-from-email",
  "newPassword": "NewSecurePass@123"
}
```

**Response:** `200 OK`
```json
{
  "message": "Password reset successful"
}
```

---

## 2. User APIs

### 2.1 Get Current User Profile
**GET** `/users/me`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "userId": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "STUDENT",
  "universityId": 1,
  "universityName": "University of Jordan",
  "points": 150,
  "level": 2,
  "badges": [
    {
      "badgeId": 1,
      "name": "Newcomer",
      "description": "Welcome to UniHub!",
      "earnedAt": "2024-01-15T10:30:00"
    }
  ]
}
```

---

### 2.2 Get User by ID
**GET** `/users/{userId}`

**Response:** `200 OK`
```json
{
  "userId": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "STUDENT",
  "universityName": "University of Jordan",
  "points": 150,
  "level": 2
}
```

---

## 3. Event APIs

### 3.1 Create Event
**POST** `/events`

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "title": "Tech Workshop 2024",
  "description": "Learn about latest technologies",
  "type": "WORKSHOP",
  "location": "Main Hall",
  "startDate": "2024-06-15T10:00:00",
  "endDate": "2024-06-15T16:00:00",
  "maxOrganizers": 3,
  "maxVolunteers": 10,
  "maxAttendees": 100,
  "organizerPoints": 50,
  "volunteerPoints": 30,
  "attendeePoints": 10
}
```

**Response:** `201 Created`
```json
{
  "eventId": 1,
  "title": "Tech Workshop 2024",
  "description": "Learn about latest technologies",
  "type": "WORKSHOP",
  "location": "Main Hall",
  "startDate": "2024-06-15T10:00:00",
  "endDate": "2024-06-15T16:00:00",
  "status": "PENDING",
  "createdBy": 1,
  "universityId": 1,
  "maxOrganizers": 3,
  "maxVolunteers": 10,
  "maxAttendees": 100,
  "organizerPoints": 50,
  "volunteerPoints": 30,
  "attendeePoints": 10,
  "currentOrganizers": 0,
  "currentVolunteers": 0,
  "currentAttendees": 0
}
```

---

### 3.2 Get All Events
**GET** `/events`

**Query Parameters:**
- `status` (optional): PENDING, APPROVED, CANCELLED
- `universityId` (optional): Filter by university
- `type` (optional): ACADEMIC, SOCIAL, SPORTS, WORKSHOP

**Response:** `200 OK`
```json
[
  {
    "eventId": 1,
    "title": "Tech Workshop 2024",
    "description": "Learn about latest technologies",
    "type": "WORKSHOP",
    "location": "Main Hall",
    "startDate": "2024-06-15T10:00:00",
    "endDate": "2024-06-15T16:00:00",
    "status": "APPROVED",
    "universityName": "University of Jordan",
    "createdByName": "John Doe",
    "currentOrganizers": 2,
    "currentVolunteers": 5,
    "currentAttendees": 45,
    "maxOrganizers": 3,
    "maxVolunteers": 10,
    "maxAttendees": 100
  }
]
```

---

### 3.3 Get Event by ID
**GET** `/events/{eventId}`

**Response:** `200 OK`
```json
{
  "eventId": 1,
  "title": "Tech Workshop 2024",
  "description": "Learn about latest technologies",
  "type": "WORKSHOP",
  "location": "Main Hall",
  "startDate": "2024-06-15T10:00:00",
  "endDate": "2024-06-15T16:00:00",
  "status": "APPROVED",
  "universityName": "University of Jordan",
  "createdByName": "John Doe",
  "participants": [
    {
      "userId": 2,
      "userName": "Jane Smith",
      "role": "ORGANIZER",
      "joinedAt": "2024-06-01T09:00:00"
    }
  ]
}
```

---

### 3.4 Join Event (Create Request)
**POST** `/event-requests`

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "eventId": 1,
  "requestedRole": "ATTENDEE"
}
```

**Response:** `201 Created`
```json
{
  "requestId": 1,
  "eventId": 1,
  "userId": 1,
  "requestedRole": "ATTENDEE",
  "status": "PENDING",
  "createdAt": "2024-06-01T10:00:00"
}
```

---

### 3.5 Approve Event Request
**PUT** `/event-requests/{requestId}/approve`

**Headers:** `Authorization: Bearer <token>` (Event creator or Admin)

**Response:** `200 OK`
```json
{
  "message": "Request approved successfully",
  "participantId": 1
}
```

---

### 3.6 Reject Event Request
**PUT** `/event-requests/{requestId}/reject`

**Response:** `200 OK`
```json
{
  "message": "Request rejected"
}
```

---

## 4. Blog APIs

### 4.1 Create Blog
**POST** `/blogs`

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "title": "Introduction to Spring Boot",
  "content": "Spring Boot is a powerful framework...",
  "category": "TECHNOLOGY",
  "isGlobal": false
}
```

**Response:** `201 Created`
```json
{
  "blogId": 1,
  "title": "Introduction to Spring Boot",
  "content": "Spring Boot is a powerful framework...",
  "category": "TECHNOLOGY",
  "status": "PENDING",
  "isGlobal": false,
  "authorId": 1,
  "authorName": "John Doe",
  "universityId": 1,
  "createdAt": "2024-06-01T10:00:00"
}
```

---

### 4.2 Get All Blogs
**GET** `/blogs`

**Query Parameters:**
- `status` (optional): PENDING, APPROVED, REJECTED
- `category` (optional): Filter by category
- `universityId` (optional): Filter by university
- `isGlobal` (optional): true/false

**Response:** `200 OK`
```json
[
  {
    "blogId": 1,
    "title": "Introduction to Spring Boot",
    "content": "Spring Boot is a powerful framework...",
    "category": "TECHNOLOGY",
    "status": "APPROVED",
    "isGlobal": false,
    "authorName": "John Doe",
    "universityName": "University of Jordan",
    "createdAt": "2024-06-01T10:00:00",
    "updatedAt": "2024-06-01T11:00:00"
  }
]
```

---

### 4.3 Get Blog by ID
**GET** `/blogs/{blogId}`

**Response:** `200 OK`
```json
{
  "blogId": 1,
  "title": "Introduction to Spring Boot",
  "content": "Spring Boot is a powerful framework...",
  "category": "TECHNOLOGY",
  "status": "APPROVED",
  "isGlobal": false,
  "authorId": 1,
  "authorName": "John Doe",
  "universityId": 1,
  "universityName": "University of Jordan",
  "createdAt": "2024-06-01T10:00:00",
  "updatedAt": "2024-06-01T11:00:00"
}
```

---

## 5. Gamification APIs

### 5.1 Get Leaderboard
**GET** `/gamification/leaderboard`

**Query Parameters:**
- `universityId` (optional): Filter by university
- `limit` (optional): Number of results (default: 10)

**Response:** `200 OK`
```json
[
  {
    "rank": 1,
    "userId": 5,
    "userName": "Alice Johnson",
    "universityName": "University of Jordan",
    "points": 850,
    "level": 5,
    "badgeCount": 3
  },
  {
    "rank": 2,
    "userId": 3,
    "userName": "Bob Smith",
    "universityName": "PSUT",
    "points": 720,
    "level": 4,
    "badgeCount": 2
  }
]
```

---

### 5.2 Get User Points History
**GET** `/gamification/points-history/{userId}`

**Response:** `200 OK`
```json
[
  {
    "logId": 1,
    "userId": 1,
    "points": 10,
    "reason": "Attended event: Tech Workshop 2024",
    "createdAt": "2024-06-15T16:30:00"
  },
  {
    "logId": 2,
    "userId": 1,
    "points": 50,
    "reason": "Blog approved: Introduction to Spring Boot",
    "createdAt": "2024-06-01T11:00:00"
  }
]
```

---

### 5.3 Get All Badges
**GET** `/gamification/badges`

**Response:** `200 OK`
```json
[
  {
    "badgeId": 1,
    "name": "Newcomer",
    "description": "Welcome to UniHub!",
    "pointsThreshold": 0
  },
  {
    "badgeId": 2,
    "name": "Active Member",
    "description": "Earned 100 points",
    "pointsThreshold": 100
  }
]
```

---

## 6. Admin APIs

### 6.1 Approve Event
**PUT** `/admin/events/{eventId}/approve`

**Headers:** `Authorization: Bearer <token>` (Admin only)

**Response:** `200 OK`
```json
{
  "message": "Event approved successfully"
}
```

---

### 6.2 Reject Event
**PUT** `/admin/events/{eventId}/reject`

**Response:** `200 OK`
```json
{
  "message": "Event rejected"
}
```

---

### 6.3 Approve Blog
**PUT** `/admin/blogs/{blogId}/approve`

**Response:** `200 OK`
```json
{
  "message": "Blog approved successfully"
}
```

---

### 6.4 Reject Blog
**PUT** `/admin/blogs/{blogId}/reject`

**Response:** `200 OK`
```json
{
  "message": "Blog rejected"
}
```

---

### 6.5 Get All Users
**GET** `/admin/users`

**Response:** `200 OK`
```json
[
  {
    "userId": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "STUDENT",
    "universityName": "University of Jordan",
    "points": 150,
    "level": 2,
    "createdAt": "2024-01-15T10:00:00"
  }
]
```

---

### 6.6 Get Dashboard Statistics
**GET** `/admin/dashboard/stats`

**Response:** `200 OK`
```json
{
  "totalUsers": 150,
  "totalEvents": 45,
  "totalBlogs": 78,
  "pendingEvents": 5,
  "pendingBlogs": 12,
  "activeUsers": 120
}
```

---

## 7. Notification APIs

### 7.1 Get User Notifications
**GET** `/notifications`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
[
  {
    "notificationId": 1,
    "type": "EVENT_UPDATE",
    "message": "Your event 'Tech Workshop 2024' has been approved",
    "linkUrl": "/events/1",
    "isRead": false,
    "createdAt": "2024-06-01T12:00:00"
  }
]
```

---

### 7.2 Mark Notification as Read
**PUT** `/notifications/{notificationId}/read`

**Response:** `200 OK`
```json
{
  "message": "Notification marked as read"
}
```

---

### 7.3 Mark All as Read
**PUT** `/notifications/read-all`

**Response:** `200 OK`
```json
{
  "message": "All notifications marked as read"
}
```

---

## 8. Report APIs

### 8.1 Report Event
**POST** `/reports/events`

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "eventId": 1,
  "reason": "Inappropriate content"
}
```

**Response:** `201 Created`
```json
{
  "reportId": 1,
  "eventId": 1,
  "reportedBy": 1,
  "reason": "Inappropriate content",
  "status": "PENDING",
  "createdAt": "2024-06-01T14:00:00"
}
```

---

### 8.2 Report Blog
**POST** `/reports/blogs`

**Request:**
```json
{
  "blogId": 1,
  "reason": "Spam content"
}
```

**Response:** `201 Created`
```json
{
  "reportId": 1,
  "blogId": 1,
  "reportedBy": 1,
  "reason": "Spam content",
  "status": "PENDING",
  "createdAt": "2024-06-01T14:00:00"
}
```

---

## 9. WebSocket APIs

### 9.1 Connect to WebSocket
**Endpoint:** `/ws`

**Protocol:** STOMP over SockJS

**Subscribe to notifications:**
```javascript
stompClient.subscribe('/user/queue/notifications', (message) => {
  const notification = JSON.parse(message.body);
  console.log('New notification:', notification);
});
```

**Notification Message Format:**
```json
{
  "notificationId": 1,
  "type": "POINTS_UPDATE",
  "message": "You earned 10 points!",
  "linkUrl": "/profile",
  "createdAt": "2024-06-01T15:00:00"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Validation failed",
  "details": {
    "password": "Password must contain at least one uppercase letter"
  }
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "error": "Access denied"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 429 Too Many Requests
```json
{
  "error": "Rate limit exceeded. Try again later."
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "An unexpected error occurred"
}
```

---

## Rate Limiting

Sensitive endpoints are rate-limited:
- **Login**: 5 requests per minute
- **Register**: 3 requests per minute
- **Password Reset**: 3 requests per 15 minutes

---

## Testing with cURL

### Register User
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test@123",
    "role": "STUDENT",
    "universityId": 1
  }'
```

### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123"
  }'
```

### Get Events (with auth)
```bash
curl -X GET http://localhost:8080/api/events \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Testing with Postman

1. Import the API collection
2. Set environment variable `baseUrl` = `http://localhost:8080/api`
3. After login, save token to environment variable `authToken`
4. Use `{{authToken}}` in Authorization header

---

## Frontend Integration

### API Service Example (React)
```javascript
import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData)
};

export const eventService = {
  getAll: () => api.get('/events'),
  getById: (id) => api.get(`/events/${id}`),
  create: (eventData) => api.post('/events', eventData)
};
```

---

## Next Steps

- Review [Database Documentation](./DB_DOCUMENTATION.md)
- Review [Architecture Documentation](./ARCHITECTURE.md)
- Test APIs using Postman or cURL
- Integrate with frontend application
