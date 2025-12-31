import api from './api';

const universityService = {
  /**
   * Get all universities
   */
  getAllUniversities: async () => {
    const response = await api.get('/admin/universities');
    return response.data;
  }
};

export default universityService;
