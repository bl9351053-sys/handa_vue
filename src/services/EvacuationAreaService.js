

import api from './api';

const EvacuationAreaService = {
  /**
   * 
   * 
   * @returns {Promise<Array>}
   */
  async getAll() {
    try {
      const response = await api.get('/evacuation-areas');
      return response.data;
    } catch (error) {
      console.error('Error fetching evacuation areas:', error);
      throw error;
    }
  },

  /**
   * 
   * 
   * @param {number} id 
   * @param {number} latitude 
   * @param {number} longitude 
   * @returns {Promise<Object>}
   */
  async getById(id, latitude = null, longitude = null) {
    try {
      const params = {};
      if (latitude !== null && longitude !== null) {
        params.latitude = latitude;
        params.longitude = longitude;
      }
      const response = await api.get(`/evacuation-areas/${id}`, { params });
      return response.data;
    } catch (error) {
      console.error(`Error fetching evacuation area ${id}:`, error);
      throw error;
    }
  },

  /**
   * 
   * @param {Object} data 
   * @returns {Promise<Object>}
   */
  async create(data) {
    try {
      const response = await api.post('/evacuation-areas', data);
      return response.data;
    } catch (error) {
      console.error('Error creating evacuation area:', error);
      throw error;
    }
  },

  /**
   * 
   *
   * @param {number} id 
   * @param {Object} data 
   * @returns {Promise<Object>}
   */
  async update(id, data) {
    try {
      const response = await api.put(`/evacuation-areas/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating evacuation area ${id}:`, error);
      throw error;
    }
  },

  /**
   * 
   * 
   * @param {number} id 
   * @returns {Promise<Object>}
   */
  async delete(id) {
    try {
      const response = await api.delete(`/evacuation-areas/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting evacuation area ${id}:`, error);
      throw error;
    }
  },

  /**
   * 
   * 
   * @param {number} latitude  
   * @param {number} longitude 
   * @returns {Promise<Array>}
   */
  async getNearestAreas(latitude, longitude) {
    try {
      const response = await api.get('/evacuation-areas/nearest', {
        params: { latitude, longitude }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching nearest evacuation areas:', error);
      throw error;
    }
  },

  /**
  
   
   * @param {number} latitude - 
   * @param {number} longitude - 
   * @param {number} predicted 
   * @returns {Promise<Object>} 
   */
  async getRecommendedAreas(latitude, longitude, predicted = 29.41) {
    try {
      const response = await api.get('/evacuation-areas/recommend', {
        params: { latitude, longitude, predicted }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching recommended evacuation areas:', error);
      throw error;
    }
  },

  /**
   *
   * 
   * @param {number} id 
   * @param {Object} familyData 
   * @returns {Promise<Object>}
   */
  async registerFamilyToArea(id, familyData) {
    try {
      const response = await api.post(`/evacuation-areas/${id}/go`, familyData);
      return response.data;
    } catch (error) {
      console.error(`Error registering family to evacuation area ${id}:`, error);
      throw error;
    }
  }
};

export default EvacuationAreaService;
