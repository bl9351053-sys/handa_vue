<template>
  <div class="container">
    <div class="header">
      <div>
        <h1>Create Disaster Risk</h1>
        <p>Add a new disaster risk</p>
      </div>
      <router-link to="/predictions" class="back-link">
        <span class="arrow">&#8592;</span> Back to Predictions
      </router-link>
    </div>

```
<div class="card">
  <form @submit.prevent="submit" class="space-y-6">
    <div>
      <label class="label">Disaster Type <span class="text-red-500">*</span></label>
      <input v-model="form.disaster_type" type="text" required class="input-field" />
      <p v-if="errors.disaster_type" class="error-text">{{ errors.disaster_type }}</p>
    </div>
    <div>
      <label class="label">Description</label>
      <textarea v-model="form.description" rows="3" class="input-field"></textarea>
      <p v-if="errors.description" class="error-text">{{ errors.description }}</p>
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
        <p v-if="errors.severity" class="error-text">{{ errors.severity }}</p>
      </div>
      <div>
        <label class="label">Valid Until</label>
        <input type="date" v-model="form.valid_until" class="input-field" />
        <p v-if="errors.valid_until" class="error-text">{{ errors.valid_until }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div>
        <label class="label">Location Name</label>
        <input v-model="form.location_name" class="input-field" />
        <p v-if="errors.location_name" class="error-text">{{ errors.location_name }}</p>
      </div>
      <div>
        <label class="label">Latitude</label>
        <input type="number" step="0.000001" v-model.number="form.latitude" class="input-field" />
        <p v-if="errors.latitude" class="error-text">{{ errors.latitude }}</p>
      </div>
      <div>
        <label class="label">Longitude</label>
        <input type="number" step="0.000001" v-model.number="form.longitude" class="input-field" />
        <p v-if="errors.longitude" class="error-text">{{ errors.longitude }}</p>
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
      <div id="map_create" class="h-72 mb-2 border border-gray-300 rounded-lg shadow-inner"></div>
    </div>

    <div>
      <label class="label">Affected Areas</label>
      <input v-model="form.affected_areas" class="input-field" />
    </div>

    <div class="form-actions">
      <router-link to="/predictions" class="cancel-btn">Cancel</router-link>
      <button type="submit" :disabled="submitting" class="submit-btn">
        <span v-if="!submitting">Create Disaster Risk</span>
        <span v-else>Creating...</span>
      </button>
    </div>
  </form>
</div>
```

  </div>
</template>

<script setup>
import { reactive, ref, onMounted, inject, watch } from 'vue'
import axios from 'axios'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useRouter } from 'vue-router'

const router = useRouter()
const baseUrl = inject('baseUrl', '')
const form = reactive({
  disaster_type: '',
  description: '',
  severity: '',
  location_name: '',
  risk_level: null,
  predicted_recovery_days: null,
  predicted_at: '',
  valid_until: '',
  affected_areas: '',
  latitude: 14.5995,   
  longitude: 120.9842
})
const errors = reactive({})
const submitting = ref(false)

let map, marker

onMounted(() => {
  map = L.map('map_create').setView([form.latitude, form.longitude], 11)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)

  marker = L.marker([form.latitude, form.longitude], { draggable: true }).addTo(map)
  marker.on('dragend', () => {
    const pos = marker.getLatLng()
    form.latitude = parseFloat(pos.lat.toFixed(6))
    form.longitude = parseFloat(pos.lng.toFixed(6))
  })

  map.on('click', e => {
    marker.setLatLng(e.latlng)
    form.latitude = parseFloat(e.latlng.lat.toFixed(6))
    form.longitude = parseFloat(e.latlng.lng.toFixed(6))
  })
})

watch(() => [form.latitude, form.longitude], ([lat, lng]) => {
  if (marker) marker.setLatLng([lat || 0, lng || 0])
})

async function submit() {
  submitting.value = true
  Object.keys(errors).forEach(k => delete errors[k])
  try {
    await axios.post(`${baseUrl}/disaster-predictions`, { ...form })
    router.push('/predictions')
  } catch (err) {
    if (err.response?.status === 422) Object.assign(errors, err.response.data.errors || {})
    else alert(err.response?.data?.message || 'Failed to create prediction.')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.container { max-width: 900px; margin: 0 auto; padding: 20px; }
.header { display:flex; justify-content:space-between; align-items:center; margin-bottom:25px; }
.header h1 { font-size:2.5rem; font-weight:bold; background:linear-gradient(90deg,#4f46e5,#06b6d4); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
.header p { color:#374151; margin-top:4px; }
.back-link { font-weight:500; color:#4f46e5; display:flex; align-items:center; gap:5px; }
.back-link:hover { text-decoration:underline; }

.card { background:linear-gradient(135deg,#f9f9ff,#ffffff); border-radius:12px; padding:30px; box-shadow:0 6px 20px rgba(0,0,0,0.08); }

.label { display:block; font-size:0.875rem; font-weight:500; color:#374151; margin-bottom:6px; }
.input-field { width:100%; padding:10px 12px; border:1px solid #d1d5db; border-radius:8px; outline:none; transition:0.2s; }
.input-field:focus { border-color:#4f46e5; box-shadow:0 0 0 2px rgba(79,70,229,0.2); }

.form-actions { display:flex; justify:end; gap:12px; margin-top:16px; }
.cancel-btn { padding:10px 16px; border:1px solid #d1d5db; border-radius:8px; font-weight:500; color:#374151; text-align:center; }
.cancel-btn:hover { background:#f9fafb; }
.submit-btn { background:#4f46e5; color:#fff; padding:10px 16px; border-radius:8px; font-weight:500; transition:0.2s; }
.submit-btn:hover { background:#4338ca; }
.submit-btn:disabled { opacity:0.6; cursor:not-allowed; }

#map_create {
  border-radius: 12px;
  width: 100%;
  height: 300px; 
}

.error-text { color:#b91c1c; font-size:0.875rem; margin-top:4px; }
</style>
