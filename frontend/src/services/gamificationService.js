import api from './api';

const gamificationService = {
  /**
   * Get leaderboard
   */
  getLeaderboard: async (scope = 'GLOBAL', type = 'MEMBERS', universityId = null) => {
    const params = new URLSearchParams();
    params.append('scope', scope);
    params.append('type', type);
    if (universityId) params.append('universityId', universityId);
    
    const response = await api.get(`/gamification/leaderboard?${params.toString()}`);
    return response.data;
  },

  /**
   * Get top members
   */
  getTopMembers: async (scope = 'GLOBAL', universityId = null, limit = 10) => {
    const params = new URLSearchParams();
    params.append('scope', scope);
    params.append('limit', limit);
    if (universityId) params.append('universityId', universityId);
    
    const response = await api.get(`/gamification/top-members?${params.toString()}`);
    return response.data;
  },

  /**
   * Get top events
   */
  getTopEvents: async (scope = 'GLOBAL', universityId = null, limit = 10) => {
    const params = new URLSearchParams();
    params.append('scope', scope);
    params.append('limit', limit);
    if (universityId) params.append('universityId', universityId);
    
    const response = await api.get(`/gamification/top-events?${params.toString()}`);
    return response.data;
  },

  /**
   * Get all badges
   */
  getAllBadges: async () => {
    const response = await api.get('/gamification/badges');
    return response.data;
  },

  /**
   * Get my badges with progress
   */
  getMyBadges: async () => {
    const response = await api.get('/gamification/my-badges');
    return response.data;
  },

  /**
   * Get my rank
   */
  getMyRank: async (scope = 'GLOBAL') => {
    const response = await api.get(`/gamification/my-rank?scope=${scope}`);
    return response.data;
  },

  /**
   * Get user rank by ID
   */
  getUserRank: async (userId, scope = 'GLOBAL') => {
    const response = await api.get(`/gamification/rank/${userId}?scope=${scope}`);
    return response.data;
  }
};

export default gamificationService;
