<template>
  <div class="container">
    <div class="header">
      <h1 class="title">🚨 Emergency Alert Details</h1>
      <router-link to="/emergency-alerts" class="btn-back">← Back</router-link>
    </div>

    <div v-if="loading" class="loading">Loading…</div>
    <div v-if="error" class="alert-error">{{ error }}</div>

    <div v-if="!loading && alert" class="alert-card">
      <div class="alert-header">
        <div class="alert-title-section">
          <h2>{{ alert.title }}</h2>
          <div class="alert-meta">
            <span class="severity" :class="alert.severity">{{ alert.severity.toUpperCase() }}</span>
            <span class="status" :class="alert.status">{{ alert.status.toUpperCase() }}</span>
          </div>
        </div>
        <div class="alert-actions">
          <router-link :to="`/emergency-alerts/${alert.id}/edit`" class="btn-edit">Edit</router-link>
        </div>
      </div>

      <div class="alert-content">
        <div class="info-grid">
          <div class="info-item">
            <label>Area:</label>
            <span>{{ alert.area }}</span>
          </div>
          <div class="info-item" v-if="alert.latitude && alert.longitude">
            <label>Coordinates:</label>
            <span>{{ alert.latitude.toFixed(6) }}, {{ alert.longitude.toFixed(6) }}</span>
          </div>
          <div class="info-item">
            <label>Created:</label>
            <span>{{ formatDate(alert.created_at) }}</span>
          </div>
          <div class="info-item">
            <label>Last Updated:</label>
            <span>{{ formatDate(alert.updated_at) }}</span>
          </div>
        </div>

        <div class="description-section">
          <h3>Description</h3>
          <p>{{ alert.description }}</p>
        </div>

        <div v-if="alert.latitude && alert.longitude" class="map-section">
          <h3>📍 Location</h3>
          <div v-if="mapError" class="alert-error">{{ mapError }}</div>
          <div v-else id="show-emergency-alert-map" class="map"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const route = useRoute();

const alert = ref(null);
const loading = ref(false);
const error = ref(null);
const mapError = ref(null);
let leafletMap = null;

const load = async () => {
  loading.value = true;
  error.value = null;
  try {
    const res = await axios.get(`/emergency-alerts/${route.params.id}`);
    alert.value = res.data.alert || res.data;

    if (alert.value.latitude && alert.value.longitude) {
      setTimeout(() => {
        initializeMap(parseFloat(alert.value.latitude), parseFloat(alert.value.longitude));
      }, 100);
    }

  } catch (e) {
    console.error(e);
    error.value = 'Failed to load alert details';
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString();
};

function initializeMap(lat, lng) {
  const mapContainer = document.getElementById('show-emergency-alert-map');
  if (!mapContainer) {
    mapError.value = 'Map container not found';
    return;
  }

  if (leafletMap) {
    leafletMap.remove();
    leafletMap = null;
  }

  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
  });

  leafletMap = L.map(mapContainer).setView([lat, lng], 12);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(leafletMap);

  L.marker([lat, lng]).addTo(leafletMap);
}

onMounted(load);

onUnmounted(() => {
  if (leafletMap) leafletMap.remove();
});
</script>

<style>
.container { max-width: 800px; margin: 20px auto; padding: 0 16px; font-family: Arial, sans-serif; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.title { font-size: 24px; font-weight: bold; color: #333; }
.btn-back { padding: 8px 16px; background: #ccc; color: #333; border-radius: 6px; text-decoration: none; }
.btn-back:hover { background: #bbb; }
.loading { text-align: center; padding: 16px; color: #555; }
.alert-error { background: #ffe5e5; color: #b30000; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; }

.alert-card { background: #fff; border-radius: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); overflow: hidden; }
.alert-header { background: #f8f9fa; padding: 24px; border-bottom: 1px solid #e9ecef; }
.alert-title-section h2 { font-size: 28px; margin: 0 0 12px 0; color: #333; }
.alert-meta { display: flex; gap: 12px; }
.severity { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; color: white; }
.severity.low { background: #28a745; }
.severity.medium { background: #ffc107; color: #333; }
.severity.high { background: #dc3545; }
.status { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
.status.active { background: #007bff; color: white; }
.status.inactive { background: #6c757d; color: white; }
.alert-actions { margin-top: 16px; }
.btn-edit { padding: 8px 16px; background: #007bff; color: white; border-radius: 6px; text-decoration: none; }
.btn-edit:hover { background: #0056b3; }

.alert-content { padding: 24px; }
.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
.info-item { display: flex; flex-direction: column; }
.info-item label { font-weight: bold; color: #666; font-size: 14px; margin-bottom: 4px; }
.info-item span { color: #333; }

.description-section { margin-bottom: 24px; }
.description-section h3 { font-size: 20px; margin-bottom: 12px; color: #333; }
.description-section p { line-height: 1.6; color: #555; }

.map-section { margin-top: 24px; padding: 16px; background: #f9f9f9; border-radius: 8px; border: 1px solid #ddd; }
.map-section h3 { font-weight: bold; margin-bottom: 12px; color: #333; }
.map { width: 100%; height: 300px; border-radius: 6px; border: 1px solid #ddd; }

@media (max-width: 768px) {
  .info-grid { grid-template-columns: 1fr; }
  .alert-meta { flex-direction: column; gap: 8px; }
}
</style>
