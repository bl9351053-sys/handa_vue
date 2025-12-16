<template>
  <div class="container">
    <div class="header">
      <h1 class="title">Edit Disaster Update</h1>
      <router-link to="/updates" class="btn-back">← Back</router-link>
    </div>

    <div v-if="loading" class="loading">Loading…</div>
    <div v-if="error" class="alert-error">{{ error }}</div>

    <div v-if="!loading">
      <form @submit.prevent="submit" class="form-card">
        <div class="form-grid">
          <input v-model="form.title" placeholder="Title" class="input" />
          <select v-model="form.disaster_type" class="input">
            <option value="typhoon">Typhoon</option>
            <option value="earthquake">Earthquake</option>
            <option value="flood">Flood</option>
            <option value="landslide">Landslide</option>
          </select>
          <select v-model="form.severity" class="input">
            <option value="low">Low</option>
            <option value="moderate">Moderate</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
          <input v-model="form.source" placeholder="Source" class="input" />
          <textarea v-model="form.description" placeholder="Description" class="input"></textarea>
          <div class="latlng">
            <input v-model="form.latitude" placeholder="Latitude" class="input flex-1" @change="updateMap" />
            <input v-model="form.longitude" placeholder="Longitude" class="input flex-1" @change="updateMap" />
          </div>
          <input v-model="form.issued_at" type="datetime-local" class="input" />
        </div>

        <div class="map-section">
          <h3>📍 Location Map (Click to set coordinates)</h3>
          <div v-if="mapError" class="alert-error">{{ mapError }}</div>
          <div v-else id="edit-disaster-map" class="map"></div>
          <p class="map-info">Click on the map to set the disaster location</p>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-save">Save</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const route = useRoute();
const router = useRouter();

const form = ref({});
const loading = ref(false);
const error = ref(null);
const mapError = ref(null);
let leafletMap = null;
let marker = null;

const load = async () => {
  loading.value = true;
  error.value = null;
  try {
    const res = await axios.get(`/updates/${route.params.id}`);
    const data = res.data.data || res.data;
    form.value = { ...data };
    if (form.value.issued_at)
      form.value.issued_at = new Date(form.value.issued_at).toISOString().slice(0, 16);

    await nextTick();
    
    await new Promise(resolve => setTimeout(resolve, 200));

    const lat = parseFloat(form.value.latitude) || 12.8797;
    const lng = parseFloat(form.value.longitude) || 121.7740;
    initializeMap(lat, lng);

  } catch (e) {
    console.error(e);
    error.value = 'Failed to load';
  } finally {
    loading.value = false;
  }
};

const submit = async () => {
  try {
    const payload = { ...form.value };
    if (payload.issued_at) payload.issued_at = new Date(payload.issued_at).toISOString();
    await axios.put(`/updates/${route.params.id}`, payload);
    router.push('/updates');
  } catch (e) {
    console.error(e);
    alert('Failed to update');
  }
};

const updateMap = () => {
  if (!leafletMap) return;
  const lat = parseFloat(form.value.latitude);
  const lng = parseFloat(form.value.longitude);
  if (!isNaN(lat) && !isNaN(lng)) {
    leafletMap.setView([lat, lng], 10);
    if (marker) marker.setLatLng([lat, lng]);
    else marker = L.marker([lat, lng]).addTo(leafletMap);
  }
};

function initializeMap(lat, lng) {
  let mapContainer = document.getElementById('edit-disaster-map');
  
  if (!mapContainer) {
    setTimeout(() => {
      mapContainer = document.getElementById('edit-disaster-map');
      if (mapContainer) {
        initializeMapContent(mapContainer, lat, lng);
      } else {
        mapError.value = 'Map container still not found after retry';
        console.error('Map container #edit-disaster-map not found');
      }
    }, 300);
    return;
  }
  
  initializeMapContent(mapContainer, lat, lng);
}

function initializeMapContent(mapContainer, lat, lng) {
  if (leafletMap) {
    leafletMap.remove();
    leafletMap = null;
    marker = null;
  }

  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
  });

  leafletMap = L.map(mapContainer).setView([lat, lng], 10);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(leafletMap);

  if (!isNaN(lat) && !isNaN(lng)) {
    marker = L.marker([lat, lng]).addTo(leafletMap);
  }

  leafletMap.on('click', e => {
    form.value.latitude = e.latlng.lat.toFixed(7);
    form.value.longitude = e.latlng.lng.toFixed(7);
    if (marker) marker.setLatLng(e.latlng);
    else marker = L.marker(e.latlng).addTo(leafletMap);
  });
}

onMounted(load);

onUnmounted(() => {
  if (leafletMap) leafletMap.remove();
});
</script>

<style>
.container { max-width: 700px; margin: 20px auto; padding: 0 16px; font-family: Arial, sans-serif; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.title { font-size: 24px; font-weight: bold; color: #333; }
.btn-back { padding: 8px 16px; background: #ccc; color: #333; border-radius: 6px; text-decoration: none; }
.btn-back:hover { background: #bbb; }
.loading { text-align: center; padding: 16px; color: #555; }
.alert-error { background: #ffe5e5; color: #b30000; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; }
.form-card { background: #fff; padding: 24px; border-radius: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); }
.form-grid { display: grid; grid-template-columns: 1fr; gap: 12px; }
.input { padding: 8px 12px; border: 1px solid #ccc; border-radius: 6px; font-size: 14px; width: 100%; }
.input:focus { outline: none; border-color: #3399ff; }
.latlng { display: flex; gap: 8px; }
.flex-1 { flex: 1; }
.map-section { margin-top: 24px; padding: 16px; background: #f9f9f9; border-radius: 8px; border: 1px solid #ddd; }
.map-section h3 { font-weight: bold; margin-bottom: 12px; color: #333; }
.map { width: 100%; height: 360px; border-radius: 6px; border: 1px solid #ddd; }
.map-info { font-size: 12px; color: #666; margin-top: 8px; text-align: center; font-style: italic; }
.form-actions { margin-top: 16px; }
.btn-save { padding: 8px 16px; background: #f59e0b; color: #fff; border: none; border-radius: 6px; cursor: pointer; }
.btn-save:hover { background: #d97706; }
</style>
