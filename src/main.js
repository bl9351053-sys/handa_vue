import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import './index.css';
import 'font-awesome/css/font-awesome.min.css';
import 'leaflet/dist/leaflet.css';

import VueSweetalert2 from 'vue-sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';

const app = createApp(App).use(router).use(VueSweetalert2);

// Global Vue error handler to surface helpful debugging info during development
app.config.errorHandler = (err, vm, info) => {
  // vm may be null in some failures; log as much as possible
  try {
    console.error('[Vue error handler]', { err, info, component: vm && vm.type && (vm.type.name || vm.type.__file) });
  } catch (e) {
    console.error('[Vue error handler] failed to log', e);
  }
};

// Window-level handlers for unhandled exceptions and rejections
window.addEventListener('error', (ev) => {
  console.error('[window error]', ev.error || ev.message, ev);
});
window.addEventListener('unhandledrejection', (ev) => {
  console.error('[unhandledrejection]', ev.reason || ev);
});

// Admin API base (used by the main app pages like login/register)
const adminApiBase = (process.env.VUE_APP_ADMIN_API_URL || 'http://127.0.0.1:8000/api').replace(/\/$/, '');
app.provide('baseUrl', adminApiBase);

// Configure default axios to point to admin API by default
axios.defaults.baseURL = adminApiBase;

// If an admin token exists in localStorage (login), main.js already sets it in axios defaults earlier.

// Create a dedicated axios instance for resident pages that talks to port 8001 by default
import axiosLib from 'axios';
const residentApiBase = (process.env.VUE_APP_RESIDENT_API_URL || 'http://127.0.0.1:8001/api').replace(/\/$/, '');
const residentAxios = axiosLib.create({ baseURL: residentApiBase, headers: { Accept: 'application/json' } });

// Optionally set resident token from env at build time
if (process.env.VUE_APP_RESIDENT_API_TOKEN) {
  residentAxios.defaults.headers.common['Authorization'] = `Bearer ${process.env.VUE_APP_RESIDENT_API_TOKEN}`;
}

// Also support setting a resident-specific token at runtime from localStorage
// This allows the resident UI to call protected endpoints (like sync) when a token is provided on the client
try {
  const residentToken = localStorage.getItem('resident_token');
  if (residentToken) {
    residentAxios.defaults.headers.common['Authorization'] = `Bearer ${residentToken}`;
  }
} catch (e) {
  // ignore localStorage access errors in some environments
}

// Provide residentAxios so resident layouts/pages can inject it
app.provide('residentAxios', residentAxios);

// set token on start if exists
const token = localStorage.getItem('token');
if (token) {
	axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
	// lazy import AuthService to set header
	import('./services/AuthService').then(({ default: AuthService }) => AuthService.setToken(token));
}

// Add axios interceptor to set token on every request
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

app.mount('#app');
