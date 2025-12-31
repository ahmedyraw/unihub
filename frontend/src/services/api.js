import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

// Create axios instance with security configurations
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Required for httpOnly cookies
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Handle 401 Unauthorized - redirect to login
      // BUT: Don't redirect for public auth endpoints
      if (error.response.status === 401) {
        const url = error.config?.url || '';
        const isPublicAuthEndpoint = 
          url.includes('/auth/session') ||
          url.includes('/auth/register') ||
          url.includes('/auth/login') ||
          url.includes('/auth/verify-email') ||
          url.includes('/auth/resend-verification') ||
          url.includes('/auth/forgot-password') ||
          url.includes('/auth/reset-password');
        
        if (!isPublicAuthEndpoint && !window.location.pathname.includes('/login')) {
          window.location.href = '/login?session=expired';
        }
      }
      
      // Handle 403 Forbidden
      if (error.response.status === 403) {
        console.error('Access denied:', error.response.data);
      }
      
      // Handle 429 Too Many Requests
      if (error.response.status === 429) {
        const message = 'Too many requests. Please wait a moment and try again.';
        alert(message);
        console.error('Rate limit exceeded');
      }
    } else if (error.code === 'ECONNABORTED') {
      console.error('Request timeout');
    } else if (!error.response) {
      console.error('Network error - please check your connection');
    }
    
    return Promise.reject(error);
  }
);

export default api;
