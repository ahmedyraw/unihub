# Setup Guide

Complete setup instructions for UniHub platform.

## Prerequisites

### Required Software
- **Java**: JDK 17 or higher
- **Maven**: 3.6+ (or use Maven wrapper)
- **Node.js**: 18+ and npm
- **PostgreSQL**: 14+
- **Git**: Latest version

### Verify Installations
```bash
java -version        # Should show Java 17+
mvn -version         # Should show Maven 3.6+
node -version        # Should show Node 18+
npm -version         # Should show npm 9+
psql --version       # Should show PostgreSQL 14+
```

## Database Setup

### 1. Install PostgreSQL
Download and install from [postgresql.org](https://www.postgresql.org/download/)

### 2. Create Database
```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database
CREATE DATABASE unihub_db;

-- Verify
\l
\q
```

### 3. Configure Database User (Optional)
```sql
-- Create dedicated user
CREATE USER unihub_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE unihub_db TO unihub_user;
```

## Backend Setup

### 1. Navigate to Project Root
```bash
cd unihub
```

### 2. Configure Application Properties
Edit `src/main/resources/application.properties`:

```properties
# Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/unihub_db
spring.datasource.username=postgres
spring.datasource.password=your_password

# JWT Secret (Change in production!)
jwt.secret=your_very_long_secret_key_at_least_256_bits_change_in_production
jwt.expiration=86400000

# Frontend URL
cors.allowed.origins=http://localhost:5173
```

### 3. Build the Project
```bash
# Using Maven wrapper (recommended)
./mvnw clean install

# Or using system Maven
mvn clean install
```

### 4. Run the Backend
```bash
# Using Maven wrapper
./mvnw spring-boot:run

# Or using system Maven
mvn spring-boot:run

# Or run the JAR
java -jar target/unihub-0.0.1-SNAPSHOT.jar
```

Backend will start on `http://localhost:8080`

### 5. Verify Backend
```bash
curl http://localhost:8080/api/auth/health
```

## Frontend Setup

### 1. Navigate to Frontend Directory
```bash
cd frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
Create `.env` file in `frontend/` directory:

```env
VITE_API_URL=http://localhost:8080/api
VITE_WS_URL=http://localhost:8080/ws
```

### 4. Run Development Server
```bash
npm run dev
```

Frontend will start on `http://localhost:5173`

### 5. Build for Production
```bash
npm run build
```

## Initial Data Setup

### 1. Default Admin Account
The system creates a default admin on first run:
- **Email**: admin@unihub.com
- **Password**: Admin@123

**⚠️ Change this password immediately after first login!**

### 2. Sample Universities
The system initializes with sample universities:
- University of Jordan
- PSUT
- Hashemite University

### 3. Sample Badges
Default badges are created automatically:
- Newcomer (0 points)
- Active Member (100 points)
- Star Contributor (500 points)
- Legend (1000 points)

## Running the Complete Application

### Option 1: Development Mode

**Terminal 1 - Backend:**
```bash
cd unihub
./mvnw spring-boot:run
```

**Terminal 2 - Frontend:**
```bash
cd unihub/frontend
npm run dev
```

**Terminal 3 - Database:**
```bash
# PostgreSQL should be running as a service
# Or start manually if needed
```

### Option 2: Production Mode

**Backend:**
```bash
cd unihub
./mvnw clean package
java -jar target/unihub-0.0.1-SNAPSHOT.jar
```

**Frontend:**
```bash
cd unihub/frontend
npm run build
# Serve the dist/ folder with nginx or any static server
```

## Verification Steps

### 1. Check Backend Health
```bash
curl http://localhost:8080/api/auth/health
```

### 2. Check Database Connection
```bash
psql -U postgres -d unihub_db -c "\dt"
```

### 3. Access Frontend
Open browser: `http://localhost:5173`

### 4. Test Login
- Navigate to login page
- Use admin credentials
- Verify dashboard loads

## Common Issues

### Backend Won't Start
- **Issue**: Port 8080 already in use
- **Solution**: Change port in `application.properties` or kill process using port 8080

### Database Connection Failed
- **Issue**: Connection refused
- **Solution**: Verify PostgreSQL is running and credentials are correct

### Frontend Can't Connect to Backend
- **Issue**: CORS errors
- **Solution**: Verify `cors.allowed.origins` in `application.properties` matches frontend URL

### Maven Build Fails
- **Issue**: Java version mismatch
- **Solution**: Ensure Java 17+ is installed and JAVA_HOME is set correctly

## Environment-Specific Configuration

### Development
```properties
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
logging.level.com.example.unihub=DEBUG
```

### Production
```properties
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false
logging.level.com.example.unihub=INFO
jwt.secret=<strong-random-secret>
```

## Next Steps

After successful setup:
1. Change default admin password
2. Create test users
3. Create sample events
4. Test all features
5. Review [API Documentation](./API_DOCUMENTATION.md)
6. Review [Database Documentation](./DB_DOCUMENTATION.md)

## Support

For issues or questions, refer to:
- [API Documentation](./API_DOCUMENTATION.md)
- [Database Documentation](./DB_DOCUMENTATION.md)
- [Architecture Documentation](./ARCHITECTURE.md)
