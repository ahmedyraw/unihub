// API Base URL - Use environment variables for security
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
export const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'http://localhost:8080/ws';
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'UniHub';
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';

// User Roles
export const USER_ROLES = {
  STUDENT: 'STUDENT',
  SUPERVISOR: 'SUPERVISOR',
  ADMIN: 'ADMIN'
};

// Event Status
export const EVENT_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  CANCELLED: 'CANCELLED'
};

// Blog Status
export const BLOG_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED'
};

// Participant Roles
export const PARTICIPANT_ROLES = {
  ORGANIZER: 'ORGANIZER',
  VOLUNTEER: 'VOLUNTEER',
  ATTENDEE: 'ATTENDEE'
};

// Points awarded for each role
export const PARTICIPANT_POINTS = {
  ORGANIZER: 50,
  VOLUNTEER: 20,
  ATTENDEE: 10
};

// Blog points
export const BLOG_POINTS = {
  STUDENT: 30,
  SUPERVISOR: 50
};

// Notification Types
export const NOTIFICATION_TYPES = {
  LEVEL_UP: 'LEVEL_UP',
  BADGE_EARNED: 'BADGE_EARNED',
  EVENT_UPDATE: 'EVENT_UPDATE',
  BLOG_APPROVAL: 'BLOG_APPROVAL',
  SYSTEM_ALERT: 'SYSTEM_ALERT'
};

// Blog Categories
export const BLOG_CATEGORIES = {
  ARTICLE: 'ARTICLE',
  INTERNSHIP: 'INTERNSHIP',
  JOB: 'JOB'
};

// Leaderboard Scopes
export const LEADERBOARD_SCOPES = {
  UNIVERSITY: 'UNIVERSITY',
  GLOBAL: 'GLOBAL'
};

// Leaderboard Types
export const LEADERBOARD_TYPES = {
  MEMBERS: 'MEMBERS',
  EVENTS: 'EVENTS'
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'unihub_token',
  USER: 'unihub_user',
  NOTIFICATIONS_ENABLED: 'unihub_notifications_enabled'
};

// Date Format
export const DATE_FORMAT = 'YYYY-MM-DD HH:mm';

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
