<template>
  <div class="container">
    <div class="header flex justify-between items-center mb-6">
      <div>
        <h1 class="text-3xl font-bold gradient-text">Disaster Details</h1>
        <p class="text-gray-600 mt-1">View disaster information</p>
      </div>
      <div class="space-x-2">
        <router-link :to="`/predictions/${id}/edit`" class="btn-edit">Edit</router-link>
        <router-link to="/predictions" class="btn-back">Back</router-link>
      </div>
    </div>

```
<div class="card mb-6">
  <h2 class="text-2xl font-bold mb-2">{{ prediction.disaster_type }} - {{ prediction.location_name || 'N/A' }}</h2>
  <p class="text-gray-700 whitespace-pre-line mb-4">{{ prediction.description || 'No description' }}</p>

  <div class="grid grid-cols-2 gap-4 mb-6">
    <div class="info-box purple">
      <p class="label">Affected Areas</p>
      <p class="value">{{ prediction.affected_areas || 'Not specified' }}</p>
    </div>
    <div class="info-box green">
      <p class="label">Risk Level</p>
      <p class="value">{{ prediction.risk_level || 'N/A' }}/10</p>
    </div>
    <div class="info-box indigo">
      <p class="label">Estimated Recovery</p>
      <p class="value">{{ prediction.predicted_recovery_days ? '~' + prediction.predicted_recovery_days + ' days' : 'N/A' }}</p>
    </div>
    <div class="info-box red">
      <p class="label">Severity</p>
      <p class="value">{{ prediction.severity ? prediction.severity.charAt(0).toUpperCase() + prediction.severity.slice(1) : 'N/A' }}</p>
    </div>
  </div>

  <div class="grid grid-cols-2 gap-4 border-t pt-4">
    <div>
      <p class="label">Issued Date</p>
      <p class="value">{{ formatDate(prediction.predicted_at) }}</p>
    </div>
    <div>
      <p class="label">Valid Until</p>
      <p class="value">{{ formatDate(prediction.valid_until) }}</p>
    </div>
    <div>
      <p class="label">Created By</p>
      <p class="value">{{ prediction.user?.name || 'N/A' }}</p>
    </div>
    <div>
      <p class="label">Created At</p>
      <p class="value">{{ formatDate(prediction.created_at) }}</p>
    </div>
  </div>
</div>

<div class="card">
  <h3 class="text-xl font-semibold mb-2">Location Map</h3>
  <div id="map" class="map-box"></div>
</div>
```

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useRoute } from 'vue-router'

const route = useRoute()
const id = route.params.id
const prediction = ref({})

function formatDate(dt) {
  if (!dt) return 'N/A'
  try { return new Date(dt).toLocaleString() } catch { return dt }
}

onMounted(async () => {
  try {
    const res = await api.get(`/disaster-predictions/${id}`)
    prediction.value = res.data

    if (prediction.value.latitude && prediction.value.longitude) {
      const map = L.map('map').setView([prediction.value.latitude, prediction.value.longitude], 13)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)
      const marker = L.marker([prediction.value.latitude, prediction.value.longitude]).addTo(map)
      marker.bindPopup(`<strong>${prediction.value.location_name || 'Location'}</strong><br>${prediction.value.disaster_type || ''}`).openPopup()
      
      const radius = (prediction.value.risk_level || 0) * 500
      const color = prediction.value.risk_level >= 8 ? '#dc3545' : (prediction.value.risk_level >= 6 ? '#fd7e14' : (prediction.value.risk_level >= 4 ? '#ffc107' : '#28a745'))
      L.circle([prediction.value.latitude, prediction.value.longitude], { color, fillColor: color, fillOpacity: 0.2, radius }).addTo(map)
    } else {
      document.getElementById('map').innerHTML = '<p class="text-center text-gray-400 mt-4">No map available for this prediction.</p>'
    }
  } catch (e) {
    console.error('Failed to load prediction', e)
  }
})
</script>

<style scoped>
.container { max-width: 900px; margin: 0 auto; padding: 20px; }
.gradient-text { background: linear-gradient(90deg,#6366f1,#f43f5e); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

.card { background: linear-gradient(135deg,#eef2ff,#ffffff); border-radius:12px; padding:25px; box-shadow:0 8px 20px rgba(0,0,0,0.08); }

.label { font-size:0.875rem; color:#6b7280; margin-bottom:4px; }
.value { font-weight:600; color:#111827; font-size:1.125rem; }

.info-box { padding:15px; border-radius:12px; }
.info-box.purple { background:#f3e8ff; color:#7c3aed; }
.info-box.green { background:#d1fae5; color:#059669; }
.info-box.indigo { background:#e0e7ff; color:#4338ca; }
.info-box.red { background:#fee2e2; color:#dc2626; }

.btn-edit { background:linear-gradient(90deg,#6366f1,#f43f5e); color:#fff; padding:10px 16px; border-radius:10px; font-weight:500; transition:0.3s; }
.btn-edit:hover { opacity:0.9; }
.btn-back { background:#6b7280; color:#fff; padding:10px 16px; border-radius:10px; font-weight:500; transition:0.3s; }
.btn-back:hover { opacity:0.9; }

.map-box { height:400px; border-radius:12px; box-shadow:0 4px 15px rgba(0,0,0,0.1); }
</style>
