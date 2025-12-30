import api from './api';

const eventService = {
  /**
   * Get all events with filters
   */
  getAllEvents: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.universityId) params.append('universityId', filters.universityId);
    if (filters.status) params.append('status', filters.status);
    // Note: type filtering is done client-side as backend doesn't support it
    
    const response = await api.get(`/events?${params.toString()}`);
    return response.data;
  },

  /**
   * Get event by ID
   */
  getEventById: async (id) => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },

  /**
   * Create new event
   */
  createEvent: async (eventData) => {
    const response = await api.post('/events', eventData);
    return response.data;
  },

  /**
   * Update an existing event
   */
  updateEvent: async (eventId, eventData) => {
    const response = await api.put(`/events/${eventId}`, eventData);
    return response.data;
  },

  /**
   * Join an event
   */
  joinEvent: async (eventId, role) => {
    const response = await api.post(`/events/${eventId}/join`, { role });
    return response.data;
  },

  /**
   * Leave an event (with penalty)
   */
  leaveEvent: async (eventId) => {
    const response = await api.post(`/events/${eventId}/leave`);
    return response.data;
  },

  /**
   * Approve event (Supervisor/Admin)
   */
  approveEvent: async (eventId) => {
    const response = await api.put(`/events/${eventId}/approve`);
    return response.data;
  },

  /**
   * Reject event (Supervisor/Admin)
   */
  rejectEvent: async (eventId, reason) => {
    const response = await api.put(`/events/${eventId}/reject`, { reason });
    return response.data;
  },

  /**
   * Cancel event (Supervisor/Admin)
   */
  cancelEvent: async (eventId, reason) => {
    const response = await api.put(`/events/${eventId}/cancel`, { reason });
    return response.data;
  },

  /**
   * Get my created events
   */
  getMyEvents: async () => {
    const response = await api.get('/events/my-events');
    return response.data;
  },

  /**
   * Get my event participations
   */
  getMyParticipations: async () => {
    const response = await api.get('/events/my-participations');
    return response.data;
  },

  /**
   * Get event participants
   */
  getEventParticipants: async (eventId) => {
    const response = await api.get(`/events/${eventId}/participants`);
    return response.data;
  },

  /**
   * Delete an event (Creator or Admin)
   */
  deleteEvent: async (eventId) => {
    const response = await api.delete(`/events/${eventId}`);
    return response.data;
  }
};

export default eventService;
