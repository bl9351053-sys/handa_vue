<template>
  <div class="container">
    <div class="header">
      <h1 class="title">Update Details</h1>
      <router-link to="/updates" class="btn-back">← Back</router-link>
    </div>

```
<div v-if="loading" class="loading">Loading…</div>
<div v-if="error" class="alert-error">{{ error }}</div>

<div v-if="update" class="form-card">
  <h2 class="update-title">{{ update.title }}</h2>
  <div class="meta">{{ update.source }} • {{ formatDate(update.issued_at) }}</div>
  <p class="description">{{ update.description }}</p>
  <p><strong>Type:</strong> {{ update.disaster_type }}</p>
  <p><strong>Severity:</strong> {{ update.severity }}</p>
  <p><strong>Coordinates:</strong> {{ update.latitude ?? 'N/A' }}, {{ update.longitude ?? 'N/A' }}</p>

  <div v-if="hasCoordinates" class="map-section">
    <h3>📍 Location Map</h3>
    <div id="update-disaster-map" class="map"></div>
  </div>
</div>
```

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const route = useRoute();
const update = ref(null);
const loading = ref(false);
const error = ref(null);
let leafletMap = null;

const hasCoordinates = computed(() => {
  const lat = parseFloat(update.value?.latitude);
  const lng = parseFloat(update.value?.longitude);
  return Number.isFinite(lat) && Number.isFinite(lng);
});

const load = async () => {
  loading.value = true;
  error.value = null;
  try {
    const res = await axios.get(`/updates/${route.params.id}`);
    update.value = res.data.data || res.data;

    await nextTick();
    if (hasCoordinates.value) {
      initializeMap();
    }
  } catch (e) {
    console.error(e);
    error.value = 'Failed to load';
  } finally {
    loading.value = false;
  }
};

const formatDate = s => s ? new Date(s).toLocaleString() : 'N/A';

function initializeMap() {
  if (!hasCoordinates.value) return;
  if (typeof window === 'undefined') return;

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

  const lat = parseFloat(update.value.latitude);
  const lng = parseFloat(update.value.longitude);

  leafletMap = L.map('update-disaster-map', {
    center: [lat, lng],
    zoom: 13,
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(leafletMap);

  L.marker([lat, lng])
    .bindPopup(update.value.title || 'Disaster Location')
    .addTo(leafletMap);

  setTimeout(() => {
    leafletMap.invalidateSize();
  }, 100);
}

onMounted(load);

onUnmounted(() => {
  if (leafletMap) {
    leafletMap.remove();
    leafletMap = null;
  }
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

.form-card { background: #fff; padding: 20px; border-radius: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); }
.update-title { font-size: 20px; font-weight: bold; margin-bottom: 6px; color: #333; }
.meta { font-size: 14px; color: #666; margin-bottom: 12px; }
.description { font-size: 16px; color: #333; line-height: 1.5; margin-bottom: 12px; }

.map-section { margin-top: 20px; padding: 16px; background: #f9f9f9; border-radius: 8px; border: 1px solid #ddd; }
.map-section h3 { font-weight: bold; margin-bottom: 12px; color: #333; }
.map { width: 100%; height: 360px; border-radius: 6px; border: 1px solid #ddd; }
</style>
