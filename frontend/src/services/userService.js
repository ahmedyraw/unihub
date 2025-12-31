import api from './api';

const userService = {
  /**
   * Get current user profile
   */
  getCurrentUser: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },

  /**
   * Get user by ID
   */
  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  /**
   * Update user profile
   */
  updateProfile: async (updates) => {
    const response = await api.put('/users/me', updates);
    return response.data;
  },

  /**
   * Change password
   */
  changePassword: async (oldPassword, newPassword) => {
    const response = await api.put('/users/change-password', {
      oldPassword,
      newPassword
    });
    return response.data;
  },

  /**
   * Set password for OAuth2 users
   */
  setPassword: async (newPassword) => {
    const response = await api.put('/users/set-password', {
      newPassword
    });
    return response.data;
  },

  /**
   * Update university
   */
  updateUniversity: async (universityId) => {
    const response = await api.put('/users/university', {
      universityId: parseInt(universityId)
    });
    return response.data;
  }
};

export default userService;
