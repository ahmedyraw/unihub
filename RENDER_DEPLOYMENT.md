# Render Deployment Guide

## Required Environment Variables

Set these in your Render dashboard (Environment tab):

### Database
- `DB_URL` - PostgreSQL connection string (e.g., `jdbc:postgresql://dpg-xxx.oregon-postgres.render.com:5432/unihub_db`)
- `DB_USERNAME` - Database username
- `DB_PASSWORD` - Database password

### Security
- `JWT_SECRET` - Strong secret key for JWT tokens (generate a random 256-bit key)

### Email (Gmail SMTP)
- `EMAIL_USERNAME` - Your Gmail address
- `EMAIL_PASSWORD` - Gmail app password (not regular password)
- `EMAIL_FROM` - Email address to send from

### OAuth2 (Optional)
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `GITHUB_CLIENT_ID` - GitHub OAuth client ID
- `GITHUB_CLIENT_SECRET` - GitHub OAuth client secret

### CORS & Frontend
- `CORS_ORIGINS` - Frontend URL (e.g., `https://your-frontend.onrender.com`)
- `FRONTEND_URL` - Frontend URL for email links

## Deployment Steps

1. **Create PostgreSQL Database**
   - In Render dashboard, create a new PostgreSQL database
   - Copy the Internal Database URL

2. **Create Web Service**
   - Connect your GitHub repository
   - Select "Docker" as environment
   - Set build command: (leave empty, Dockerfile handles it)
   - Add all environment variables above

3. **Link Database**
   - Use the Internal Database URL from step 1 for `DB_URL`
   - Format: `jdbc:postgresql://[internal-host]:5432/[database-name]`

4. **Deploy**
   - Render will automatically build and deploy using the Dockerfile
   - First deployment takes 5-10 minutes

## Notes
- Render automatically sets `PORT` environment variable (handled in Dockerfile)
- Database tables will be created automatically on first run (ddl-auto=update)
- Check logs in Render dashboard if deployment fails
