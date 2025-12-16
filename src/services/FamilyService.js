

import api from './api';

const FamilyService = {
  /**
   * 
   * 
   * @returns {Promise<Array>}
   */
  async getAll() {
    try {
      const response = await api.get('/families');
      return response.data;
    } catch (error) {
      console.error('Error fetching families:', error);
      throw error;
    }
  },

  /**
   * 
   * 
   * @param {number} familyId 
   * @returns {Promise<Object>}
   */
  async checkoutFamily(familyId) {
    try {
      const response = await api.post(`/families/${familyId}/checkout`);
      return response.data;
    } catch (error) {
      console.error(`Error checking out family ${familyId}:`, error);
      throw error;
    }
  }
};

export default FamilyService;
