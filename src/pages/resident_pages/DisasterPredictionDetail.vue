<template>
  <div class="prediction-detail space-y-6">
    <div class="flex items-center justify-between">
      <button @click="goBack" class="btn-back">← Back</button>
    </div>

    <div v-if="loading" class="center py-8">Loading prediction...</div>
    <div v-if="error" class="center error">{{ error }}</div>

    <div v-if="prediction">
      <!-- MAIN SEVERITY CARD -->
      <div :class="['severity-card', severityBgClass(prediction.risk_level)]">
        <h1 class="text-2xl font-bold mb-2">
          {{ prediction.location_name || 'Prediction Details' }}
        </h1>

        <div class="flex gap-4 items-center mb-4">
          <span class="badge type-badge">{{ ucfirst(prediction.disaster_type || 'Unknown') }}</span>

          <span class="badge severity-badge" :class="severityClass(prediction.risk_level)">
            Risk Level: {{ prediction.risk_level ?? 'N/A' }}/10
          </span>
        </div>

        <div v-if="prediction.predicted_recovery_days" class="info-box mb-4">
          <h4 class="mb-1">⏱️ Estimated Recovery Time</h4>
          <p class="recovery-time">~{{ prediction.predicted_recovery_days }} days</p>
          <small class="text-muted">
            Time until area recovers (no floods, debris cleared, etc.)
          </small>
        </div>

        <div v-if="prediction.prediction_factors || prediction.description" class="mb-4">
          <h4 class="mb-1">📋 Factors & Data Sources</h4>
          <p class="text-muted description">
            {{ prediction.prediction_factors || prediction.description }}
          </p>

      
        </div>

        <div class="pt-2 info-footer">
          <p><strong>Coordinates:</strong> {{ prediction.latitude ?? 'N/A' }}, {{ prediction.longitude ?? 'N/A' }}</p>

          <p>
            <strong>Predicted:</strong> {{ formatDate(prediction.predicted_at) }}
            {{ relativeTime(prediction.predicted_at) ? '(' + relativeTime(prediction.predicted_at) + ')' : '' }}
          </p>
        </div>
      </div>

      <!-- MAP CARD -->
      <div class="card rounded border">
        <div class="card-header p-3 font-semibold">📍 Location Map</div>

        <div class="p-3">
          <div v-if="prediction.latitude && prediction.longitude">
            <div v-if="mapError" class="text-red-700">
              Map failed to load: {{ mapError }}
            </div>

            <div v-else-if="!mapReady" class="text-gray-600">Loading map…</div>

            <div id="prediction-map" v-show="mapReady" class="map-container"></div>
          </div>

          <div v-else class="text-center text-muted mt-3">
            No map available for this prediction.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, onMounted, onUnmounted, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet marker icon paths for Vite/Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const route = useRoute();
const router = useRouter();
const residentAxios = inject("residentAxios");

const prediction = ref(null);
const loading = ref(false);
const error = ref(null);
const mapReady = ref(false);
const mapError = ref(null);

let leafletMap = null;

// Fetch prediction data
const fetchPrediction = async (id) => {
  loading.value = true;
  error.value = null;
  try {
    const res = await residentAxios.get(`/disaster-predictions/${id}`);
    prediction.value = res.data?.data || res.data || null;

    await nextTick();
    if (prediction.value?.latitude && prediction.value?.longitude) {
      initLeaflet(prediction.value.latitude, prediction.value.longitude);
    }
  } catch (e) {
    console.error("[Pred] Fetch error:", e);
    error.value = "Failed to load prediction.";
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  const id = route.params.id;
  if (id) fetchPrediction(id);
});

onUnmounted(() => {
  if (leafletMap?.remove) leafletMap.remove();
});

function goBack() {
  router.push({ path: "/resident_pages/disaster-predictions" });
}

// Utilities
const formatDate = (s) => (s ? new Date(s).toLocaleString() : "N/A");
const ucfirst = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");
const relativeTime = (s) => {
  if (!s) return "";
  const diff = Date.now() - new Date(s).getTime();
  const sec = Math.round(Math.abs(diff) / 1000);
  if (sec < 60) return diff > 0 ? sec + " sec ago" : "in " + sec + " sec";
  const min = Math.round(sec / 60);
  if (min < 60) return diff > 0 ? min + " min ago" : "in " + min + " min";
  const hr = Math.round(min / 60);
  if (hr < 24) return diff > 0 ? hr + " hr ago" : "in " + hr + " hr";
  const days = Math.round(hr / 24);
  return diff > 0 ? days + " days ago" : "in " + days + " days";
};

// Severity badge & background
const severityClass = (lvl) => {
  const n = parseInt(lvl || 0, 10);
  if (n >= 8) return "bg-red-600 text-white";
  if (n >= 6) return "bg-orange-600 text-white";
  if (n >= 4) return "bg-yellow-600 text-white";
  return "bg-green-600 text-white";
};
const severityBgClass = (lvl) => {
  const n = parseInt(lvl || 0, 10);
  if (n >= 8) return "severity-critical-bg";
  if (n >= 6) return "severity-high-bg";
  return "severity-moderate-bg";
};

// Initialize Leaflet map
function initLeaflet(lat, lng) {
  try {
    if (leafletMap) {
      leafletMap.remove();
      leafletMap = null;
    }

    const el = document.querySelector("#prediction-map");
    if (!el) throw new Error("Map container not found");

    leafletMap = L.map(el, { center: [lat, lng], zoom: 12 });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(leafletMap);

    const marker = L.marker([lat, lng]).addTo(leafletMap);
    marker.bindPopup(
      `<strong>${prediction.value.location_name}</strong><br>${prediction.value.disaster_type || ""}`
    ).openPopup();

    const risk = parseInt(prediction.value.risk_level || 0, 10);
    const color =
      risk >= 8 ? "#dc3545" :
      risk >= 6 ? "#fd7e14" :
      risk >= 4 ? "#ffc107" :
      "#28a745";

    L.circle([lat, lng], {
      color,
      fillColor: color,
      fillOpacity: 0.2,
      radius: Math.max(500, risk * 500),
    }).addTo(leafletMap);

    // Ensure map is centered & fully rendered
    setTimeout(() => {
      leafletMap.invalidateSize();
      leafletMap.setView([lat, lng], 12);
    }, 150);

    mapReady.value = true;
    mapError.value = null;
  } catch (e) {
    console.error("[Pred] Map error:", e);
    mapReady.value = false;
    mapError.value = e.message;
  }
}
</script>

<style scoped>
/* GENERAL PAGE */
.prediction-detail {
  font-family: "Inter", "Segoe UI", sans-serif;
  padding: 2rem;
  max-width: 1000px;
  margin: 0 auto;

  /* Disaster theme – dark glassy panel */
  background: linear-gradient(135deg, #0a0f24 0%, #111827 100%);
  border-radius: 20px;

  color: #e5e7f1;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(8px);
}

.center {
  text-align: center;
  font-size: 1.1rem;
  color: #cbd5e1;
}

.error {
  color: #ff6b6b;
  font-weight: 600;
}

/* ======= BACK BUTTON ======= */
.btn-back {
  padding: 8px 16px;
  background: rgba(59, 130, 246, 0.15);
  border: 1px solid rgba(59, 130, 246, 0.3);
  color: #93c5fd;
  border-radius: 10px;
  cursor: pointer;
  transition: 0.25s ease;
  backdrop-filter: blur(6px);
}
.btn-back:hover {
  background: rgba(59, 130, 246, 0.3);
  color: white;
  border-color: #3b82f6;
  transform: translateY(-1px);
}

/* ======= MAIN SEVERITY CARD ======= */
.severity-card {
  padding: 24px;
  border-radius: 18px;
  margin-bottom: 24px;

  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);

  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);

  color: #f8fafc;
}

/* Severity Backgrounds */
.severity-critical-bg {
  background: linear-gradient(135deg, rgba(220, 38, 38, 0.2), rgba(185, 28, 28, 0.3));
}
.severity-high-bg {
  background: linear-gradient(135deg, rgba(251, 146, 60, 0.2), rgba(217, 119, 6, 0.3));
}
.severity-moderate-bg {
  background: linear-gradient(135deg, rgba(250, 204, 21, 0.2), rgba(202, 138, 4, 0.3));
}

/* ======= BADGES ======= */
.badge {
  padding: 5px 14px;
  border-radius: 16px;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: .3px;
  display: inline-block;
}

.type-badge {
  background: #3b82f6;
  color: white;
  box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
}

/* ======= INFO BOX ======= */
.info-box {
  background: rgba(59, 130, 246, 0.10);
  border-left: 4px solid #3b82f6;
  padding: 10px 14px;
  border-radius: 10px;
  color: #dbeafe;
}

.recovery-time {
  font-size: 1.4rem;
  color: #60a5fa;
  margin: 0;
}

.description {
  color: #cbd5e1;
}

.info-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  padding-top: 12px;
  margin-top: 12px;
}

/* ======= CARD (MAP CARD) ======= */
.card {
  background: rgba(255, 255, 255, 0.07);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 0 18px rgba(0, 0, 0, 0.3);
}

.card-header {
  background: rgba(255, 255, 255, 0.08);
  padding: 14px 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.14);
  color: #93c5fd;
}

/* ======= MAP ======= */
.map-container {
  width: 100%;
  height: 420px;
  border-radius: 16px;
  overflow: hidden;

  border: 2px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.35);
}

/* Glow on hover */
.map-container:hover {
  box-shadow: 0 0 30px rgba(59, 130, 246, 0.5);
  transition: 0.3s;
}
</style>
