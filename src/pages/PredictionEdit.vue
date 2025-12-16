<template>
  <div class="container">
    <div class="header">
      <div>
        <h1>Edit Disaster Risk</h1>
        <p class="text-gray-600 mt-1">Modify existing disaster risks</p>
      </div>
      <router-link to="/predictions" class="back-link">
        <span class="arrow">&#8592;</span> Back
      </router-link>
    </div>

```
<div class="card">
  <form @submit.prevent="submit" class="space-y-6">
    <div>
      <label class="label">Disaster Type <span class="text-red-500">*</span></label>
      <input v-model="form.disaster_type" type="text" required class="input-field" />
    </div>
    <div>
      <label class="label">Description</label>
      <textarea v-model="form.description" rows="3" class="input-field"></textarea>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label class="label">Severity</label>
        <select v-model="form.severity" class="input-field">
          <option value="">Select Severity</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>
      <div>
        <label class="label">Valid Until</label>
        <input type="date" v-model="form.valid_until" class="input-field" />
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div>
        <label class="label">Location Name</label>
        <input v-model="form.location_name" class="input-field" />
      </div>
      <div>
        <label class="label">Latitude</label>
        <input type="number" step="0.000001" v-model.number="form.latitude" class="input-field" />
      </div>
      <div>
        <label class="label">Longitude</label>
        <input type="number" step="0.000001" v-model.number="form.longitude" class="input-field" />
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div>
        <label class="label">Risk Level</label>
        <input type="number" v-model.number="form.risk_level" min="1" max="10" class="input-field" />
      </div>
      <div>
        <label class="label">Estimated Recovery Days</label>
        <input type="number" v-model.number="form.predicted_recovery_days" min="0" class="input-field" />
      </div>
      <div>
        <label class="label">Issued At</label>
        <input type="datetime-local" v-model="form.predicted_at" class="input-field" />
      </div>
    </div>

    <div>
      <label class="label">Select Location on Map</label>
      <div id="map_edit" class="map-box mb-2"></div>
    </div>

    <div>
      <label class="label">Affected Areas</label>
      <input v-model="form.affected_areas" class="input-field" />
    </div>

    <div class="form-actions">
      <router-link to="/predictions" class="cancel-btn">Cancel</router-link>
      <button type="submit" class="submit-btn">Update Disaster Risk</button>
    </div>
  </form>
</div>
```

  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import api from '../services/api'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const id = route.params.id

const form = ref({
  disaster_type: '',
  description: '',
  severity: '',
  location_name: '',
  latitude: 14.5995,
  longitude: 120.9842,
  risk_level: null,
  predicted_recovery_days: null,
  predicted_at: '',
  valid_until: '',
  affected_areas: ''
})

let map, marker

async function load() {
  try {
    const res = await api.get(`/disaster-predictions/${id}`)
    Object.assign(form.value, res.data)
  } catch (e) {
    console.error('Failed to load prediction', e)
  }
}

onMounted(async () => {
  await load()
  const lat = parseFloat(form.value.latitude) || 14.5995
  const lng = parseFloat(form.value.longitude) || 120.9842

  map = L.map('map_edit').setView([lat, lng], 11)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)

  marker = L.marker([lat, lng], { draggable: true }).addTo(map)

  marker.on('dragend', () => {
    const pos = marker.getLatLng()
    form.value.latitude = parseFloat(pos.lat.toFixed(6))
    form.value.longitude = parseFloat(pos.lng.toFixed(6))
  })

  map.on('click', e => {
    marker.setLatLng(e.latlng)
    form.value.latitude = parseFloat(e.latlng.lat.toFixed(6))
    form.value.longitude = parseFloat(e.latlng.lng.toFixed(6))
  })

  map.invalidateSize()
})

watch(() => [form.value.latitude, form.value.longitude], ([lat, lng]) => {
  if (marker) marker.setLatLng([lat || 0, lng || 0])
})

async function submit() {
  try {
    await api.put(`/disaster-predictions/${id}`, { ...form.value })
    router.push({ name: 'Predictions' })
  } catch (e) {
    console.error('Update failed', e)
    alert('Update failed')
  }
}
</script>

<style scoped>
.container { max-width: 900px; margin: 0 auto; padding: 20px; }
.header { display:flex; justify-content:space-between; align-items:center; margin-bottom:25px; }
.header h1 { font-size:2.5rem; font-weight:bold; background:linear-gradient(90deg,#f43f5e,#6366f1); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
.header p { color:#4b5563; margin-top:4px; }
.back-link { font-weight:500; color:#6366f1; display:flex; align-items:center; gap:5px; }
.back-link:hover { text-decoration:underline; }

.card { background:linear-gradient(135deg,#eef2ff,#ffffff); border-radius:12px; padding:30px; box-shadow:0 8px 25px rgba(0,0,0,0.1); }

.label { display:block; font-size:0.875rem; font-weight:500; color:#374151; margin-bottom:6px; }
.input-field { width:100%; padding:10px 14px; border:1px solid #d1d5db; border-radius:10px; outline:none; transition:0.3s; background:#fefeff; }
.input-field:focus { border-color:#6366f1; box-shadow:0 0 0 3px rgba(99,102,241,0.2); }

.form-actions { display:flex; justify:end; gap:12px; margin-top:16px; }
.cancel-btn { padding:10px 16px; border:1px solid #d1d5db; border-radius:10px; font-weight:500; color:#374151; text-align:center; }
.cancel-btn:hover { background:#f3f4f6; }
.submit-btn { background:linear-gradient(90deg,#6366f1,#f43f5e); color:#fff; padding:10px 16px; border-radius:10px; font-weight:500; transition:0.3s; }
.submit-btn:hover { opacity:0.9; }

.map-box { height:300px; border-radius:12px; box-shadow:0 4px 15px rgba(0,0,0,0.1); margin-bottom:10px; }
</style>
