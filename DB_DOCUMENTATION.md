# Database Documentation

Complete database schema and design documentation for UniHub.

## Database Overview

- **RDBMS**: PostgreSQL 18.1
- **Database Name**: unihub_db
- **Character Set**: UTF8
- **Timezone**: UTC

---

## Entity Relationship Diagram (ERD)

```
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│   User      │───────│ University   │       │   Badge     │
│             │  N:1  │              │       │             │
└─────────────┘       └──────────────┘       └─────────────┘
      │                                              │
      │ 1:N                                          │
      │                                              │ N:M
┌─────────────┐                              ┌─────────────┐
│   Event     │                              │ UserBadge   │
│             │                              │             │
└─────────────┘                              └─────────────┘
      │
      │ 1:N
      │
┌──────────────────┐
│ EventParticipant │
│                  │
└──────────────────┘
      │
      │ 1:N
      │
┌──────────────────┐
│  EventRequest    │
│                  │
└──────────────────┘
```

---

## Tables

### 1. users
Stores user account information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| user_id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique user identifier |
| name | VARCHAR(255) | NOT NULL | User's full name |
| email | VARCHAR(255) | NOT NULL, UNIQUE | User's email address |
| password_hash | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| role | VARCHAR(50) | NOT NULL | STUDENT, FACULTY, ADMIN |
| university_id | BIGINT | FOREIGN KEY | Reference to universities |
| points | INTEGER | DEFAULT 0 | Gamification points |
| level | INTEGER | DEFAULT 1 | User level based on points |
| created_at | TIMESTAMP | NOT NULL | Account creation timestamp |
| updated_at | TIMESTAMP | | Last update timestamp |

**Indexes:**
- PRIMARY KEY on user_id
- UNIQUE INDEX on email
- INDEX on university_id
- INDEX on role

**Sample Data:**
```sql
INSERT INTO users (name, email, password_hash, role, university_id, points, level) 
VALUES 
  ('Admin User', 'admin@unihub.com', '$2a$10$...', 'ADMIN', 1, 0, 1),
  ('John Doe', 'john@example.com', '$2a$10$...', 'STUDENT', 1, 150, 2);
```

---

### 2. universities
Stores university information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| university_id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique university identifier |
| name | VARCHAR(255) | NOT NULL, UNIQUE | University name |
| location | VARCHAR(255) | | University location |
| created_at | TIMESTAMP | NOT NULL | Record creation timestamp |

**Sample Data:**
```sql
INSERT INTO universities (name, location) 
VALUES 
  ('University of Jordan', 'Amman, Jordan'),
  ('PSUT', 'Amman, Jordan'),
  ('Hashemite University', 'Zarqa, Jordan');
```

---

### 3. events
Stores event information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| event_id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique event identifier |
| title | VARCHAR(255) | NOT NULL | Event title |
| description | TEXT | | Event description |
| type | VARCHAR(50) | | ACADEMIC, SOCIAL, SPORTS, WORKSHOP |
| location | VARCHAR(255) | | Event location |
| start_date | TIMESTAMP | NOT NULL | Event start date/time |
| end_date | TIMESTAMP | NOT NULL | Event end date/time |
| status | VARCHAR(50) | NOT NULL | PENDING, APPROVED, CANCELLED |
| created_by | BIGINT | FOREIGN KEY | User who created event |
| university_id | BIGINT | FOREIGN KEY | Associated university |
| max_organizers | INTEGER | | Maximum organizer slots |
| max_volunteers | INTEGER | | Maximum volunteer slots |
| max_attendees | INTEGER | | Maximum attendee slots |
| organizer_points | INTEGER | | Points for organizers |
| volunteer_points | INTEGER | | Points for volunteers |
| attendee_points | INTEGER | | Points for attendees |
| created_at | TIMESTAMP | NOT NULL | Record creation timestamp |
| updated_at | TIMESTAMP | | Last update timestamp |

**Indexes:**
- PRIMARY KEY on event_id
- INDEX on created_by
- INDEX on university_id
- INDEX on status
- INDEX on start_date

**Constraints:**
- CHECK: status IN ('PENDING', 'APPROVED', 'CANCELLED')
- CHECK: end_date > start_date

---

### 4. event_participants
Stores event participation records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| participant_id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique participant identifier |
| event_id | BIGINT | FOREIGN KEY, NOT NULL | Reference to events |
| user_id | BIGINT | FOREIGN KEY, NOT NULL | Reference to users |
| role | VARCHAR(50) | NOT NULL | ORGANIZER, VOLUNTEER, ATTENDEE |
| joined_at | TIMESTAMP | NOT NULL | Join timestamp |
| points_awarded | INTEGER | | Points awarded for participation |

**Indexes:**
- PRIMARY KEY on participant_id
- UNIQUE INDEX on (event_id, user_id)
- INDEX on event_id
- INDEX on user_id

**Constraints:**
- CHECK: role IN ('ORGANIZER', 'VOLUNTEER', 'ATTENDEE')
- UNIQUE: (event_id, user_id) - User can only join event once

---

### 5. event_requests
Stores event join requests.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| request_id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique request identifier |
| event_id | BIGINT | FOREIGN KEY, NOT NULL | Reference to events |
| user_id | BIGINT | FOREIGN KEY, NOT NULL | Reference to users |
| requested_role | VARCHAR(50) | NOT NULL | ORGANIZER, VOLUNTEER, ATTENDEE |
| status | VARCHAR(50) | NOT NULL | PENDING, APPROVED, REJECTED |
| created_at | TIMESTAMP | NOT NULL | Request creation timestamp |

**Indexes:**
- PRIMARY KEY on request_id
- INDEX on event_id
- INDEX on user_id
- INDEX on status

**Constraints:**
- CHECK: requested_role IN ('ORGANIZER', 'VOLUNTEER', 'ATTENDEE')
- CHECK: status IN ('PENDING', 'APPROVED', 'REJECTED')

---

### 6. blogs
Stores blog posts.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| blog_id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique blog identifier |
| title | VARCHAR(255) | NOT NULL | Blog title |
| content | TEXT | NOT NULL | Blog content |
| category | VARCHAR(100) | | Blog category |
| status | VARCHAR(50) | NOT NULL | PENDING, APPROVED, REJECTED |
| is_global | BOOLEAN | NOT NULL | Global or university-specific |
| author_id | BIGINT | FOREIGN KEY, NOT NULL | Reference to users |
| university_id | BIGINT | FOREIGN KEY | Reference to universities |
| created_at | TIMESTAMP | NOT NULL | Creation timestamp |
| updated_at | TIMESTAMP | | Last update timestamp |

**Indexes:**
- PRIMARY KEY on blog_id
- INDEX on author_id
- INDEX on university_id
- INDEX on status
- INDEX on category

**Constraints:**
- CHECK: status IN ('PENDING', 'APPROVED', 'REJECTED')

---

### 7. badges
Stores badge definitions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| badge_id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique badge identifier |
| name | VARCHAR(255) | NOT NULL, UNIQUE | Badge name |
| description | TEXT | | Badge description |
| points_threshold | INTEGER | NOT NULL | Points required to earn |
| created_at | TIMESTAMP | NOT NULL | Creation timestamp |
| updated_at | TIMESTAMP | | Last update timestamp |

**Sample Data:**
```sql
INSERT INTO badges (name, description, points_threshold) 
VALUES 
  ('Newcomer', 'Welcome to UniHub!', 0),
  ('Active Member', 'Earned 100 points', 100),
  ('Star Contributor', 'Earned 500 points', 500),
  ('Legend', 'Earned 1000 points', 1000);
```

---

### 8. user_badges
Stores user badge achievements (junction table).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| user_badge_id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique record identifier |
| user_id | BIGINT | FOREIGN KEY, NOT NULL | Reference to users |
| badge_id | BIGINT | FOREIGN KEY, NOT NULL | Reference to badges |
| earned_at | TIMESTAMP | NOT NULL | Badge earned timestamp |

**Indexes:**
- PRIMARY KEY on user_badge_id
- UNIQUE INDEX on (user_id, badge_id)
- INDEX on user_id
- INDEX on badge_id

**Constraints:**
- UNIQUE: (user_id, badge_id) - User can earn badge only once

---

### 9. points_log
Stores points transaction history.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| log_id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique log identifier |
| user_id | BIGINT | FOREIGN KEY, NOT NULL | Reference to users |
| points | INTEGER | NOT NULL | Points added/deducted |
| reason | TEXT | NOT NULL | Reason for points change |
| created_at | TIMESTAMP | NOT NULL | Transaction timestamp |

**Indexes:**
- PRIMARY KEY on log_id
- INDEX on user_id
- INDEX on created_at

---

### 10. notifications
Stores user notifications.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| notification_id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique notification identifier |
| user_id | BIGINT | FOREIGN KEY, NOT NULL | Reference to users |
| type | VARCHAR(50) | NOT NULL | Notification type |
| message | TEXT | NOT NULL | Notification message |
| link_url | TEXT | | Optional link URL |
| is_read | BOOLEAN | DEFAULT FALSE | Read status |
| created_at | TIMESTAMP | NOT NULL | Creation timestamp |

**Notification Types:**
- LEVEL_UP
- BADGE_EARNED
- EVENT_UPDATE
- BLOG_APPROVAL
- SYSTEM_ALERT
- POINTS_UPDATE

**Indexes:**
- PRIMARY KEY on notification_id
- INDEX on user_id
- INDEX on is_read
- INDEX on created_at

---

### 11. event_reports
Stores event reports.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| report_id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique report identifier |
| event_id | BIGINT | FOREIGN KEY, NOT NULL | Reference to events |
| reported_by | BIGINT | FOREIGN KEY, NOT NULL | User who reported |
| reason | TEXT | NOT NULL | Report reason |
| status | VARCHAR(50) | NOT NULL | PENDING, REVIEWED, DISMISSED |
| created_at | TIMESTAMP | NOT NULL | Report timestamp |

**Constraints:**
- CHECK: status IN ('PENDING', 'REVIEWED', 'DISMISSED')

---

### 12. blog_reports
Stores blog reports.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| report_id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique report identifier |
| blog_id | BIGINT | FOREIGN KEY, NOT NULL | Reference to blogs |
| reported_by | BIGINT | FOREIGN KEY, NOT NULL | User who reported |
| reason | TEXT | NOT NULL | Report reason |
| status | VARCHAR(50) | NOT NULL | PENDING, REVIEWED, DISMISSED |
| created_at | TIMESTAMP | NOT NULL | Report timestamp |

**Constraints:**
- CHECK: status IN ('PENDING', 'REVIEWED', 'DISMISSED')

---

### 13. password_reset_tokens
Stores password reset tokens.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique token identifier |
| user_id | BIGINT | FOREIGN KEY, NOT NULL | Reference to users |
| token_hash | VARCHAR(255) | NOT NULL, UNIQUE | Hashed reset token |
| expiry_date | TIMESTAMP | NOT NULL | Token expiration |
| used | BOOLEAN | DEFAULT FALSE | Token usage status |
| created_at | TIMESTAMP | NOT NULL | Creation timestamp |

**Indexes:**
- PRIMARY KEY on id
- UNIQUE INDEX on token_hash
- INDEX on user_id

---

## Relationships

### One-to-Many (1:N)

1. **University → Users**
   - One university has many users
   - `users.university_id` → `universities.university_id`

2. **User → Events**
   - One user creates many events
   - `events.created_by` → `users.user_id`

3. **Event → EventParticipants**
   - One event has many participants
   - `event_participants.event_id` → `events.event_id`

4. **User → EventParticipants**
   - One user participates in many events
   - `event_participants.user_id` → `users.user_id`

5. **User → Blogs**
   - One user writes many blogs
   - `blogs.author_id` → `users.user_id`

6. **User → PointsLog**
   - One user has many points transactions
   - `points_log.user_id` → `users.user_id`

7. **User → Notifications**
   - One user receives many notifications
   - `notifications.user_id` → `users.user_id`

### Many-to-Many (N:M)

1. **Users ↔ Badges** (via user_badges)
   - Users can earn multiple badges
   - Badges can be earned by multiple users

---

## Database Queries

### Common Queries

#### 1. Get User with University
```sql
SELECT u.user_id, u.name, u.email, u.role, u.points, u.level,
       uni.name as university_name
FROM users u
LEFT JOIN universities uni ON u.university_id = uni.university_id
WHERE u.user_id = ?;
```

#### 2. Get Events with Participant Counts
```sql
SELECT e.event_id, e.title, e.start_date, e.status,
       COUNT(CASE WHEN ep.role = 'ORGANIZER' THEN 1 END) as organizer_count,
       COUNT(CASE WHEN ep.role = 'VOLUNTEER' THEN 1 END) as volunteer_count,
       COUNT(CASE WHEN ep.role = 'ATTENDEE' THEN 1 END) as attendee_count
FROM events e
LEFT JOIN event_participants ep ON e.event_id = ep.event_id
WHERE e.status = 'APPROVED'
GROUP BY e.event_id;
```

#### 3. Get Leaderboard
```sql
SELECT u.user_id, u.name, u.points, u.level,
       uni.name as university_name,
       COUNT(ub.badge_id) as badge_count,
       RANK() OVER (ORDER BY u.points DESC) as rank
FROM users u
LEFT JOIN universities uni ON u.university_id = uni.university_id
LEFT JOIN user_badges ub ON u.user_id = ub.user_id
GROUP BY u.user_id, uni.name
ORDER BY u.points DESC
LIMIT 10;
```

#### 4. Get User Points History
```sql
SELECT log_id, points, reason, created_at
FROM points_log
WHERE user_id = ?
ORDER BY created_at DESC
LIMIT 20;
```

#### 5. Get Unread Notifications
```sql
SELECT notification_id, type, message, link_url, created_at
FROM notifications
WHERE user_id = ? AND is_read = FALSE
ORDER BY created_at DESC;
```

---

## Database Initialization

### Schema Creation
```sql
-- Create database
CREATE DATABASE unihub_db;

-- Connect to database
\c unihub_db;

-- Tables are auto-created by Hibernate with ddl-auto=update
```

### Initial Data
```sql
-- Insert universities
INSERT INTO universities (name, location) VALUES
  ('University of Jordan', 'Amman, Jordan'),
  ('PSUT', 'Amman, Jordan'),
  ('Hashemite University', 'Zarqa, Jordan');

-- Insert badges
INSERT INTO badges (name, description, points_threshold) VALUES
  ('Newcomer', 'Welcome to UniHub!', 0),
  ('Active Member', 'Earned 100 points', 100),
  ('Star Contributor', 'Earned 500 points', 500),
  ('Legend', 'Earned 1000 points', 1000);

-- Insert admin user (password: Admin@123)
INSERT INTO users (name, email, password_hash, role, university_id, points, level) VALUES
  ('Admin User', 'admin@unihub.com', '$2a$10$...', 'ADMIN', 1, 0, 1);
```

---

## Performance Optimization

### Indexes
All foreign keys have indexes for faster joins.

### Query Optimization
- Use pagination for large result sets
- Use appropriate indexes on frequently queried columns
- Avoid N+1 queries with JOIN FETCH in JPA

### Connection Pooling
Configured in Spring Boot:
```properties
spring.datasource.hikari.maximum-pool-size=10
spring.datasource.hikari.minimum-idle=5
```

---

## Backup and Restore

### Backup
```bash
pg_dump -U postgres -d unihub_db -F c -f unihub_backup.dump
```

### Restore
```bash
pg_restore -U postgres -d unihub_db unihub_backup.dump
```

---

## Security Considerations

1. **Password Storage**: Bcrypt hashing with salt
2. **SQL Injection**: Prevented by JPA parameterized queries
3. **Token Security**: JWT tokens with expiration
4. **Data Validation**: Constraints at database level

---

## Maintenance

### Regular Tasks
- Vacuum database weekly
- Analyze tables after bulk operations
- Monitor slow queries
- Archive old notifications and logs

### Monitoring Queries
```sql
-- Check database size
SELECT pg_size_pretty(pg_database_size('unihub_db'));

-- Check table sizes
SELECT schemaname, tablename, 
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check active connections
SELECT count(*) FROM pg_stat_activity WHERE datname = 'unihub_db';
```

---

## Next Steps

- Review [API Documentation](./API_DOCUMENTATION.md)
- Review [Architecture Documentation](./ARCHITECTURE.md)
- Set up database backups
- Configure monitoring
