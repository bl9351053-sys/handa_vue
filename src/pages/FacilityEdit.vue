<template>
  <div class="page-container">
    <div class="content-wrapper">
      <div class="header">
        <div>
          <h1 class="title">Edit Facility</h1>
          <p class="subtitle">Update facility information</p>
        </div>
        <router-link to="/facilities" class="back-link">
          <svg xmlns="http://www.w3.org/2000/svg" class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Facilities
        </router-link>
      </div>

```
  <div v-if="loading" class="loading-card">
    <div class="loading-content">
      <div class="spinner"></div>
      <span>Loading facility...</span>
    </div>
  </div>

  <div v-else-if="generalError" class="error-card">
    <p>{{ generalError }}</p>
  </div>

  <div v-else class="card">
    <form @submit.prevent="submit" class="form-container">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="label">Name <span class="text-red-500">*</span></label>
          <input v-model="form.name" type="text" required class="input-field" />
          <p v-if="errors.name" class="error-text">{{ errors.name }}</p>
        </div>
        <div>
          <label class="label">Type <span class="text-red-500">*</span></label>
          <input v-model="form.type" type="text" placeholder="Hospital, Fire Station, etc." class="input-field" />
          <p v-if="errors.type" class="error-text">{{ errors.type }}</p>
        </div>
      </div>

      <div>
        <label class="label">Address <span class="text-red-500">*</span></label>
        <textarea v-model="form.address" rows="3" class="input-field"></textarea>
        <p v-if="errors.address" class="error-text">{{ errors.address }}</p>
      </div>

      <div>
        <label class="label">Location <span class="text-red-500">*</span></label>
        <div id="map-container" class="map-container"></div>
        <p class="map-hint">Click on the map to set the facility location</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="label">Latitude</label>
          <input v-model.number="form.latitude" type="number" step="0.00000001" class="input-field" />
          <p v-if="errors.latitude" class="error-text">{{ errors.latitude }}</p>
        </div>
        <div>
          <label class="label">Longitude</label>
          <input v-model.number="form.longitude" type="number" step="0.00000001" class="input-field" />
          <p v-if="errors.longitude" class="error-text">{{ errors.longitude }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label class="label">Status <span class="text-red-500">*</span></label>
          <select v-model="form.status" class="input-field">
            <option value="operational">Operational</option>
            <option value="limited">Limited</option>
            <option value="offline">Offline</option>
            <option value="emergency">Emergency</option>
          </select>
          <p v-if="errors.status" class="error-text">{{ errors.status }}</p>
        </div>
        <div>
          <label class="label">Staff Count <span class="text-red-500">*</span></label>
          <input v-model.number="form.staff_count" type="number" min="0" class="input-field" />
          <p v-if="errors.staff_count" class="error-text">{{ errors.staff_count }}</p>
        </div>
        <div>
          <label class="label">Contact Number</label>
          <input v-model="form.contact_number" type="text" class="input-field" />
          <p v-if="errors.contact_number" class="error-text">{{ errors.contact_number }}</p>
        </div>
      </div>

      <div>
        <label class="label">Resources</label>
        <textarea v-model="form.resources" rows="2" placeholder="e.g., Ambulances: 5, Beds: 100, Medical supplies" class="input-field"></textarea>
        <p v-if="errors.resources" class="error-text">{{ errors.resources }}</p>
      </div>

      <div>
        <label class="label">Notes</label>
        <textarea v-model="form.notes" rows="3" class="input-field"></textarea>
        <p v-if="errors.notes" class="error-text">{{ errors.notes }}</p>
      </div>

      <div class="form-actions">
        <router-link to="/facilities" class="cancel-btn">Cancel</router-link>
        <button type="submit" :disabled="submitting" class="submit-btn">
          <span v-if="!submitting">Update Facility</span>
          <span v-else>Updating...</span>
        </button>
      </div>
    </form>
  </div>
</div>
```

  </div>
</template>

<script setup>
import { reactive, ref, inject, onMounted, nextTick } from 'vue'
import axios from 'axios'
import { useRouter, useRoute } from 'vue-router'
import L from 'leaflet'

const router = useRouter()
const route = useRoute()
const baseUrl = inject('baseUrl', '')
const facilityId = route.params.id

const form = reactive({
  name: '',
  type: '',
  address: '',
  latitude: null,
  longitude: null,
  status: 'operational',
  staff_count: 0,
  contact_number: '',
  resources: '',
  notes: ''
})

const errors = reactive({})
const generalError = ref('')
const submitting = ref(false)
const loading = ref(true)
let map = null
let marker = null

onMounted(async () => {
  await fetchFacility()
  await nextTick()
  initializeMap()
})

async function fetchFacility() {
  try {
    const res = await axios.get(`${baseUrl}/facilities/${facilityId}`)
    const facility = res.data?.data || res.data
    Object.keys(form).forEach(k => { if (facility[k] !== undefined) form[k] = facility[k] })
  } catch (err) {
    generalError.value = 'Failed to load facility. Please try again.'
    console.error(err)
  } finally { loading.value = false }
}

function initializeMap() {
  const container = document.getElementById('map-container')
  if (!container) return

  // Default coordinates (center of map)
  const defaultLat = form.latitude || 14.5994
  const defaultLng = form.longitude || 120.9842

  map = L.map('map-container').setView([defaultLat, defaultLng], 13)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map)

  // Add marker if coordinates exist
  if (form.latitude && form.longitude) {
    addMarker(form.latitude, form.longitude)
  }

  // Handle map clicks to set location
  map.on('click', (e) => {
    form.latitude = parseFloat(e.latlng.lat.toFixed(8))
    form.longitude = parseFloat(e.latlng.lng.toFixed(8))
    addMarker(form.latitude, form.longitude)
  })
}

function addMarker(lat, lng) {
  if (marker) {
    map.removeLayer(marker)
  }
  marker = L.marker([lat, lng]).addTo(map)
  map.setView([lat, lng], 13)
}

async function submit() {
  submitting.value = true
  generalError.value = ''
  Object.keys(errors).forEach(k => delete errors[k])

  try {
    const payload = { ...form }
    await axios.put(`${baseUrl}/facilities/${facilityId}`, payload)
    router.push('/facilities')
  } catch (err) {
    if (err.response?.status === 422) Object.assign(errors, err.response.data.errors || {})
    else generalError.value = err.response?.data?.message || 'Failed to update facility.'
  } finally { submitting.value = false }
}
</script>

<style scoped>
.page-container { min-height: 100vh; background: #f0f4f8; padding: 30px; font-family: 'Inter', sans-serif; }
.content-wrapper { max-width: 900px; margin: 0 auto; }

.header { display:flex; justify-content:space-between; align-items:center; margin-bottom:30px; }
.title { font-size:2.5rem; font-weight:700; background:linear-gradient(90deg,#6366f1,#4f46e5); background-clip:text; -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
.subtitle { font-size:1rem; color:#4b5563; margin-top:4px; }
.back-link { display:flex; align-items:center; gap:6px; font-weight:500; color:#6366f1; text-decoration:none; transition:0.3s; }
.back-link:hover { color:#4338ca; transform:translateX(-3px); }
.icon { width:20px; height:20px; }

.card { background: rgba(255,255,255,0.98); padding: 30px; border-radius: 25px; box-shadow: 0 15px 35px rgba(0,0,0,0.1); transition:all 0.3s ease; }
.card:hover { transform: translateY(-3px); box-shadow:0 20px 45px rgba(0,0,0,0.15); }

.label { display:block; font-size:0.875rem; font-weight:500; color:#374151; margin-bottom:6px; }
.input-field { width:100%; padding:10px 12px; border:1px solid #d1d5db; border-radius:8px; outline:none; transition:0.2s; }
.input-field:focus { border-color:#4f46e5; box-shadow:0 0 0 2px rgba(79,70,229,0.2); }

.error-text { color:#b91c1c; font-size:0.875rem; margin-top:4px; }

.map-container { width: 100%; height: 400px; border-radius: 8px; border: 1px solid #d1d5db; margin-bottom: 12px; z-index: 1; }
.map-hint { color: #6b7280; font-size: 0.875rem; margin-top: 6px; }

.form-actions { display:flex; justify-content:end; gap:12px; margin-top:16px; }
.cancel-btn { padding:10px 16px; border:1px solid #d1d5db; border-radius:8px; font-weight:500; color:#374151; text-align:center; }
.cancel-btn:hover { background:#f9fafb; }
.submit-btn { background:#4f46e5; color:#fff; padding:10px 16px; border-radius:8px; font-weight:500; transition:0.2s; }
.submit-btn:hover { background:#4338ca; }
.submit-btn:disabled { opacity:0.6; cursor:not-allowed; }
</style>
