import api from './api';

const authService = {
  /**
   * Register a new user
   */
  register: async (data) => {
    const response = await api.post('/auth/register', data);
    // Token is now in httpOnly cookie, just return user data
    return response.data;
  },

  /**
   * Login user
   */
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    // Token is now in httpOnly cookie, just return user data
    return response.data;
  },

  /**
   * Logout user
   */
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
    // Redirect to login
    window.location.href = '/login';
  },

  /**
   * Check if user is authenticated by making a test request
   */
  isAuthenticated: async () => {
    try {
      // Make a simple request to check if cookie is valid
      await api.get('/auth/check');
      return true;
    } catch (error) {
      return false;
    }
  },

  /**
   * Check session and get current user
   */
  checkSession: async () => {
    const response = await api.get('/auth/session');
    return response.data;
  },

  /**
   * Forgot password
   */
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  }
};

export default authService;
