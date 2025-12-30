import api from './api';

const eventRequestService = {
  /**
   * Create a new event request
   */
  createRequest: async (eventId, role) => {
    const response = await api.post('/event-requests', { eventId, role });
    return response.data;
  },

  /**
   * Accept an event request
   */
  acceptRequest: async (requestId) => {
    const response = await api.put(`/event-requests/${requestId}/accept`);
    return response.data;
  },

  /**
   * Reject an event request
   */
  rejectRequest: async (requestId, reason) => {
    const response = await api.put(`/event-requests/${requestId}/reject`, { reason });
    return response.data;
  },

  /**
   * Get my pending requests (as event owner)
   */
  getMyRequests: async () => {
    const response = await api.get('/event-requests/my-requests');
    return response.data;
  },

  /**
   * Get requests for a specific event
   */
  getEventRequests: async (eventId) => {
    const response = await api.get(`/event-requests/event/${eventId}`);
    return response.data;
  }
};

export default eventRequestService;
