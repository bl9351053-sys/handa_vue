import axios from 'axios';

const residentApi = axios.create({
  baseURL: 'http://localhost:8001/api',
  headers: { Accept: 'application/json' }
});

// Attach token if present
residentApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('resident_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
residentApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('resident_token');
      localStorage.removeItem('resident_user');
      window.location.href = '/resident/login';
    }
    return Promise.reject(error);
  }
);

export default residentApi;

// Resident Authentication Service
export const residentAuthService = {
  register(data) {
    return residentApi.post('/auth/register', data);
  },
  login(email, password) {
    return residentApi.post('/auth/login', { email, password });
  },
  logout() {
    return residentApi.post('/auth/logout');
  },
  getCurrentUser() {
    return residentApi.get('/auth/me');
  },
  updateProfile(data) {
    return residentApi.put('/auth/profile', data);
  }
};

// Resident Dashboard Service
export const residentDashboardService = {
  getDashboard() {
    return residentApi.get('/dashboard');
  },
  getEvacuationInfo() {
    return residentApi.get('/evacuation-info');
  },
  getDisasterAlerts() {
    return residentApi.get('/alerts');
  }
};

// Resident Family Service
export const residentFamilyService = {
  getMyFamily() {
    return residentApi.get('/family');
  },
  updateFamilyInfo(data) {
    return residentApi.put('/family', data);
  },
  addFamilyMember(data) {
    return residentApi.post('/family/members', data);
  },
  updateFamilyMember(id, data) {
    return residentApi.put(`/family/members/${id}`, data);
  },
  deleteFamilyMember(id) {
    return residentApi.delete(`/family/members/${id}`);
  },
  getFamilyMembers() {
    return residentApi.get('/family/members');
  }
};

// Resident Evacuation Service
export const residentEvacuationService = {
  getAvailableAreas() {
    return residentApi.get('/evacuation-areas');
  },
  getEvacuationArea(id) {
    return residentApi.get(`/evacuation-areas/${id}`);
  },
  registerEvacuation(areaId, data) {
    return residentApi.post(`/evacuation-areas/${areaId}/go`, data);
  },
  getNearestAreas(lat, lng) {
    return residentApi.get(`/evacuation-areas/nearest`, { params: { latitude: lat, longitude: lng } });
  },
  getRecommendedArea(lat, lng, predicted = 29.41) {
    return residentApi.get(`/evacuation-areas/recommend`, { params: { latitude: lat, longitude: lng, predicted } });
  }
};


// Resident Facilities Service
export const residentFacilitiesService = {
  getNearbyFacilities() {
    return residentApi.get('/facilities/nearby');
  },
  getFacilities() {
    return residentApi.get('/facilities');
  },
  getFacilityDetails(id) {
    return residentApi.get(`/facilities/${id}`);
  }
};

// Resident Predictions Service
export const residentPredictionsService = {
  getDisasterPredictions() {
    return residentApi.get('/disaster-predictions');
  },
  getPredictionDetails(id) {
    return residentApi.get(`/disaster-predictions/${id}`);
  },
  getPersonalRiskAssessment() {
    return residentApi.get('/risk-assessment');
  }
};

// Resident Emergency Alerts Service
export const residentEmergencyAlertsService = {
  getEmergencyAlerts() {
    return residentApi.get('/emergency-alerts');
  },
  getEmergencyAlert(id) {
    return residentApi.get(`/emergency-alerts/${id}`);
  }
};

// Resident Disaster Updates Service
export const residentUpdatesService = {
  getDisasterUpdates() {
    return residentApi.get('/disaster-updates');
  },
  getDisasterUpdate(id) {
    return residentApi.get(`/disaster-updates/${id}`);
  }
};

// Resident Notification Service
export const residentNotificationService = {
  getNotifications() {
    return residentApi.get('/notifications');
  },
  markAsRead(id) {
    return residentApi.patch(`/notifications/${id}/read`);
  },
  deleteNotification(id) {
    return residentApi.delete(`/notifications/${id}`);
  }
};
