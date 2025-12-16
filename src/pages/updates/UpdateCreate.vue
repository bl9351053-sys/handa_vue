<template>
  <div class="container">
    <header class="form-header">
      <h1>📢 Add Disaster Update</h1>
      <router-link to="/updates" class="btn-back">← Back</router-link>
    </header>

<div class="form-card">
  <form @submit.prevent="submit">
    <div class="form-group">
      <label>Disaster Type *</label>
      <select v-model="form.disaster_type" required>
        <option value="">Select Type</option>
        <option value="typhoon">Typhoon</option>
        <option value="earthquake">Earthquake</option>
        <option value="flood">Flood</option>
        <option value="landslide">Landslide</option>
      </select>
      <div v-if="errors.disaster_type" class="error-msg">{{ errors.disaster_type }}</div>
    </div>

    <div class="form-group">
      <label>Title *</label>
      <input v-model="form.title" type="text" required />
      <div v-if="errors.title" class="error-msg">{{ errors.title }}</div>
    </div>

    <div class="form-group">
      <label>Description *</label>
      <textarea v-model="form.description" rows="5" required></textarea>
      <div v-if="errors.description" class="error-msg">{{ errors.description }}</div>
    </div>

    <div class="form-group">
      <label>Severity Level *</label>
      <select v-model="form.severity" required>
        <option value="">Select Severity</option>
        <option value="low">Low</option>
        <option value="moderate">Moderate</option>
        <option value="high">High</option>
        <option value="critical">Critical</option>
      </select>
      <div v-if="errors.severity" class="error-msg">{{ errors.severity }}</div>
    </div>

    <div class="form-group">
      <label>Source</label>
      <input v-model="form.source" type="text" />
    </div>

    <div class="form-group">
      <label>Location (Click on map to set coordinates)</label>
      <div id="map" ref="mapContainer" class="map-container"></div>
      <div class="coord-display">
        <p v-if="form.latitude && form.longitude">
          📍 Selected: {{ form.latitude.toFixed(6) }}, {{ form.longitude.toFixed(6) }}
        </p>
        <p v-else class="coord-hint">Click on the map to select a location</p>
      </div>
    </div>

    <div class="form-grid">
      <div class="form-group">
        <label>Latitude (Optional)</label>
        <input v-model.number="form.latitude" type="number" step="0.00000001" />
      </div>
      <div class="form-group">
        <label>Longitude (Optional)</label>
        <input v-model.number="form.longitude" type="number" step="0.00000001" />
      </div>
    </div>

    <div class="form-group">
      <label>Issued At *</label>
      <input v-model="form.issued_at" type="datetime-local" required />
      <div v-if="errors.issued_at" class="error-msg">{{ errors.issued_at }}</div>
    </div>

    <div class="form-actions">
      <button type="submit" class="btn-submit">✓ Publish Update</button>
      <router-link to="/updates" class="btn-cancel">Cancel</router-link>
    </div>
  </form>
</div>

  </div>
</template>

<script setup>
import { ref, inject, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import L from 'leaflet';

const residentAxios = inject('residentAxios', null);
const router = useRouter();
const mapContainer = ref(null);
let map = null;
let marker = null;

const nowLocal = () => {
  const d = new Date();
  return d.toISOString().slice(0, 16);
};

const form = ref({
  disaster_type: 'typhoon',
  title: '',
  description: '',
  severity: 'moderate',
  source: 'PAGASA/PhiVolcs',
  latitude: '',
  longitude: '',
  issued_at: nowLocal(),
});

const errors = ref({});

const initMap = () => {
  if (map) return;
  
  map = L.map(mapContainer.value).setView([12.8797, 121.7740], 6); // Philippines center
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19,
  }).addTo(map);

  if (form.value.latitude && form.value.longitude) {
    addMarker(form.value.latitude, form.value.longitude);
  }

  map.on('click', (e) => {
    const { lat, lng } = e.latlng;
    form.value.latitude = lat;
    form.value.longitude = lng;
    addMarker(lat, lng);
  });
};

const addMarker = (lat, lng) => {
  if (marker) {
    map.removeLayer(marker);
  }
  marker = L.marker([lat, lng], {
    icon: L.icon({
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    }),
  }).addTo(map);
};

watch(() => form.value.latitude, (newLat) => {
  if (newLat && form.value.longitude && map) {
    addMarker(newLat, form.value.longitude);
    map.setView([newLat, form.value.longitude], 8);
  }
});

watch(() => form.value.longitude, (newLng) => {
  if (newLng && form.value.latitude && map) {
    addMarker(form.value.latitude, newLng);
    map.setView([form.value.latitude, newLng], 8);
  }
});

const clientValidate = () => {
  errors.value = {};
  if (!form.value.disaster_type) errors.value.disaster_type = 'Disaster type is required.';
  if (!form.value.title) errors.value.title = 'Title is required.';
  if (!form.value.description) errors.value.description = 'Description is required.';
  if (!form.value.severity) errors.value.severity = 'Severity is required.';
  if (!form.value.issued_at) errors.value.issued_at = 'Issued at datetime is required.';
  return Object.keys(errors.value).length === 0;
};

const submit = async () => {
  if (!clientValidate()) return;

  try {
    const payload = { ...form.value };
    if (payload.issued_at) payload.issued_at = new Date(payload.issued_at).toISOString();

    
    const http = axios || residentAxios;
    await http.post('/updates', payload);
    router.push('/updates');
  } catch (e) {
    console.error(e);
    if (e.response) {
      if (e.response.status === 422 && e.response.data && e.response.data.errors) {
        errors.value = e.response.data.errors;
      } else if (e.response.status === 404) {
        alert('Create endpoint not found (404). Verify admin API is running and `/api/updates` exists.');
      } else if (e.response.status === 401 || e.response.status === 403) {
        alert('Authentication error. Make sure you are logged in and have permission.');
      } else {
        alert(`Failed to create update: ${e.response.status} ${e.response.statusText}`);
      }
    } else {
      alert('Failed to create update: network or CORS error');
    }
  }
};

onMounted(initMap);
</script>

<style>
.container {
  max-width: 700px;
  margin: 40px auto;
  padding: 0 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}
.form-header h1 {
  font-size: 2rem;
  font-weight: 700;
}
.btn-back {
  text-decoration: none;
  background-color: #d1d5db;
  padding: 8px 16px;
  border-radius: 8px;
  color: #333;
  font-weight: 500;
  transition: background-color 0.3s;
}
.btn-back:hover {
  background-color: #b0b7bd;
}

.form-card {
  background-color: #fff;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.08);
  transition: box-shadow 0.3s;
}
.form-card:hover {
  box-shadow: 0 10px 30px rgba(0,0,0,0.12);
}

/* Form Groups */
.form-group {
  margin-bottom: 20px;
}
.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
}
.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #ccc;
  outline: none;
  transition: border-color 0.3s, box-shadow 0.3s;
  font-size: 0.95rem;
}
.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: #007bff;
  box-shadow: 0 0 5px rgba(0,123,255,0.3);
}
textarea {
  resize: vertical;
}

/* Error Messages */
.error-msg {
  color: #c0392b;
  font-size: 0.85rem;
  margin-top: 4px;
}

/* Form Grid (Lat/Long) */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
@media(max-width: 600px){
  .form-grid {
    grid-template-columns: 1fr;
  }
}

/* Map Container */
.map-container {
  width: 100%;
  height: 400px;
  border-radius: 8px;
  border: 1px solid #ccc;
  margin-bottom: 10px;
  z-index: 1;
}

/* Coordinate Display */
.coord-display {
  background-color: #f0f8ff;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 15px;
  text-align: center;
  font-size: 0.9rem;
}
.coord-display p {
  margin: 0;
  color: #333;
}
.coord-hint {
  color: #666;
  font-style: italic;
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: 15px;
  margin-top: 25px;
}
.btn-submit {
  background-color: #28a745;
  color: #fff;
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}
.btn-submit:hover {
  background-color: #218838;
}
.btn-cancel {
  background-color: #d1d5db;
  color: #333;
  text-decoration: none;
  padding: 10px 18px;
  border-radius: 8px;
  font-weight: 500;
  transition: background-color 0.3s;
}
.btn-cancel:hover {
  background-color: #b0b7bd;
}
</style>
