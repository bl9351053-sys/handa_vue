import api from './api';

function setToken(token) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}

const AuthService = {
  post(endpoint, data) {
    return api.post(endpoint, data);
  },
  get(endpoint, params) {
    return api.get(endpoint, { params });
  },
  logout() {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  },
  setToken
};

export default AuthService;
