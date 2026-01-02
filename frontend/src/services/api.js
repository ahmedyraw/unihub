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
    // Token is handled via httpOnly cookies, no need to add Authorization header
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
      // Handle 401 Unauthorized - only redirect on session check failure
      if (error.response.status === 401) {
        const url = error.config?.url || '';
        
        // Only redirect to login if the session check itself fails
        if (url.includes('/auth/session') && !window.location.hash.includes('/login')) {
          localStorage.clear();
          window.location.href = '/#/login';
        }
        // For other 401 errors, just reject without redirecting
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
