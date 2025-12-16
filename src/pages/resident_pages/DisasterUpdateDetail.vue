<template>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <button @click="goBack" class="btn-back">← Back</button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center loading">
      Loading disaster update...
    </div>

    <!-- Error State -->
    <div v-if="error && !loading" class="alert alert-error">
      {{ error }}
    </div>

    <!-- Update Detail -->
    <div v-if="!loading && !error && update">
      <!-- Severity Card -->
      <div :class="['severity-card', 'severity-' + update.severity]">
        <div class="card-header">
          <h1 class="update-title">{{ update.title }}</h1>
          <div class="tags">
            <span :class="['tag', 'tag-' + update.severity]">
              {{ update.severity.charAt(0).toUpperCase() + update.severity.slice(1) }} Severity
            </span>
            <span class="tag tag-type">
              {{ update.disaster_type.charAt(0).toUpperCase() + update.disaster_type.slice(1) }}
            </span>
          </div>
        </div>

        <p class="description">{{ update.description }}</p>

        <div class="details">
          <p><strong>Source:</strong> {{ update.source }}</p>
          <p><strong>Issued:</strong> {{ formatDate(update.issued_at) }}</p>
          <p class="time"><strong>Time:</strong> {{ getTimeAgo(update.issued_at) }}</p>
        </div>
      </div>

      <!-- Map Section -->
      <div v-if="update.latitude && update.longitude" class="map-container">
        <div class="map-header">
          📍 <strong>Affected Location:</strong> {{ update.latitude }}, {{ update.longitude }}
        </div>
        <div v-if="mapError" class="map-error">Map failed to load: {{ mapError }}</div>
        <div v-else-if="!mapReady" class="map-loading">Loading map…</div>
        <div id="disaster-map" v-show="mapReady" class="map"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, onMounted, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
const residentAxios = inject('residentAxios');

const update = ref(null);
const loading = ref(false);
const error = ref(null);
const mapReady = ref(false);
const mapError = ref(null);

let map = null;

const fetchUpdate = async (id) => {
  loading.value = true;
  error.value = null;
  try {
    const response = await residentAxios.get(`/disaster-updates/${id}`);
    update.value = response.data.data || {};
    await nextTick();
    if (update.value.latitude && update.value.longitude) {
      initMap(update.value.latitude, update.value.longitude);
    }
  } catch (err) {
    error.value = 'Failed to load disaster update. Please try again.';
  } finally {
    loading.value = false;
  }
};

const goBack = () => {
  router.push({ path: '/resident_pages/disaster-updates' });
};

const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch (e) { return dateString; }
};

const getTimeAgo = (dateString) => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return `${Math.floor(seconds / 604800)}w ago`;
  } catch (e) { return ''; }
};

async function initMap(lat, lng) {
  try {
    const L = await loadLeaflet();

    // Wait for the map container to exist in the DOM
    await new Promise(resolve => setTimeout(resolve, 50));

    const el = document.getElementById('disaster-map');
    if (!el) throw new Error('Map container not found');

    map = L.map(el, { center: [parseFloat(lat), parseFloat(lng)], zoom: 12 });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add marker centered
    L.marker([parseFloat(lat), parseFloat(lng)])
      .addTo(map)
      .bindPopup(`<strong>${update.value.title}</strong>`)
      .openPopup();

    mapReady.value = true;
  } catch (err) {
    mapError.value = err.message || 'Failed to load map';
    mapReady.value = false;
  }
}

function loadLeaflet() {
  return new Promise((resolve, reject) => {
    if (window.L) return resolve(window.L);

    const cssHref = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    const jsSrc = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';

    if (!document.querySelector(`link[href="${cssHref}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = cssHref;
      document.head.appendChild(link);
    }

    if (!document.querySelector(`script[src="${jsSrc}"]`)) {
      const script = document.createElement('script');
      script.src = jsSrc;
      script.async = true;
      script.onload = () => resolve(window.L);
      script.onerror = () => reject(new Error('Leaflet failed to load'));
      document.head.appendChild(script);
    } else {
      resolve(window.L);
    }
  });
}

onMounted(() => {
  const id = route.params.id;
  if (id) fetchUpdate(id);
});
</script>

<style>
/* Container */
.container { max-width: 900px; margin: 20px auto; padding: 0 16px; font-family: Arial, sans-serif; }
.header { display: flex; align-items: center; margin-bottom: 20px; }
.btn-back { padding: 8px 16px; background: #ccc; color: #333; border: none; border-radius: 6px; cursor: pointer; }
.btn-back:hover { background: #bbb; }

.text-center { text-align: center; }
.loading { text-align: center; padding: 32px 0; color: #555; }
.alert { border-radius: 8px; padding: 16px; margin-bottom: 20px; }
.alert-error { background: #ffe5e5; border: 1px solid #ffcccc; color: #b30000; }

.severity-card { border-radius: 12px; padding: 24px; margin-bottom: 20px; }
.severity-critical { background: #ffe5e5; border: 2px solid #ff4d4d; }
.severity-high { background: #fff4e5; border: 2px solid #ff9900; }
.severity-moderate { background: #fffbe5; border: 2px solid #ffcc00; }
.severity-low { background: #e5f0ff; border: 2px solid #3399ff; }

.card-header { margin-bottom: 16px; }
.update-title { font-size: 28px; font-weight: bold; margin-bottom: 12px; color: #333; }
.tags { display: flex; flex-wrap: wrap; gap: 8px; }
.tag { padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: bold; }
.tag-critical { background: #ff4d4d; color: white; }
.tag-high { background: #ff9900; color: white; }
.tag-moderate { background: #ffcc00; color: white; }
.tag-low { background: #3399ff; color: white; }
.tag-type { background: #888; color: white; }

.description { font-size: 16px; color: #333; line-height: 1.6; margin-bottom: 16px; }
.details { border-top: 2px solid #ddd; padding-top: 12px; }
.time { font-size: 14px; color: #666; }

.map-container { border: 1px solid #ccc; border-radius: 12px; overflow: hidden; margin-bottom: 20px; }
.map-header { padding: 8px 16px; background: #f5f5f5; border-bottom: 1px solid #ddd; font-size: 14px; color: #333; }
.map { width: 100%; height: 360px; }
.map-error { color: #b30000; padding: 16px; }
.map-loading { color: #555; padding: 16px; }

.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
.info-card { border: 1px solid #ccc; border-radius: 10px; padding: 16px; background: #f9f9f9; }
.info-card h3 { font-weight: bold; margin-bottom: 8px; color: #333; }
.info-card p { color: #555; }

.actions-card { border: 1px solid #3399ff; background: #e5f0ff; border-radius: 12px; padding: 16px; }
.actions-card h3 { font-weight: bold; margin-bottom: 12px; color: #333; }
.actions-card ul { list-style-type: disc; padding-left: 20px; color: #333; }
.actions-card li { margin-bottom: 6px; }
</style>
