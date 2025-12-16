<template>
  <div class="page-container">
    <div class="content-wrapper">
      <div class="header">
        <div>
          <h1 class="title">Create Facility</h1>
          <p class="subtitle">Add a new emergency facility to monitor</p>
        </div>
        <router-link to="/facilities" class="back-link">
          <svg xmlns="http://www.w3.org/2000/svg" class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Facilities
        </router-link>
      </div>

```
  <div class="card">
    <div v-if="generalError" class="error-box">{{ generalError }}</div>

    <form @submit.prevent="submit" class="form">
      <div class="row">
        <div class="form-group">
          <label>Name <span class="required">*</span></label>
          <input v-model="form.name" type="text" required />
          <p v-if="errors.name" class="error-text">{{ errors.name }}</p>
        </div>
        <div class="form-group">
          <label>Type <span class="required">*</span></label>
          <input v-model="form.type" type="text" placeholder="Hospital, Fire Station, etc." required />
          <p v-if="errors.type" class="error-text">{{ errors.type }}</p>
        </div>
      </div>

      <div class="form-group">
        <label>Address <span class="required">*</span></label>
        <textarea v-model="form.address" rows="3" required></textarea>
        <p v-if="errors.address" class="error-text">{{ errors.address }}</p>
      </div>

      <div class="row">
        <div class="form-group">
          <label>Latitude</label>
          <input v-model.number="form.latitude" type="number" step="0.00000001" readonly />
        </div>
        <div class="form-group">
          <label>Longitude</label>
          <input v-model.number="form.longitude" type="number" step="0.00000001" readonly />
        </div>
      </div>

      <div class="form-group">
        <label>Click on the map to set location</label>
        <div ref="mapContainer" class="map-container"></div>
        <p class="map-note">Latitude and longitude will update automatically when you click on the map.</p>
      </div>

      <div class="row">
        <div class="form-group">
          <label>Status <span class="required">*</span></label>
          <select v-model="form.status" required>
            <option value="operational">Operational</option>
            <option value="limited">Limited</option>
            <option value="offline">Offline</option>
            <option value="emergency">Emergency</option>
          </select>
        </div>
        <div class="form-group">
          <label>Staff Count <span class="required">*</span></label>
          <input v-model.number="form.staff_count" type="number" min="0" required />
        </div>
        <div class="form-group">
          <label>Contact Number</label>
          <input v-model="form.contact_number" type="text" />
        </div>
      </div>

      <div class="form-group">
        <label>Resources</label>
        <textarea v-model="form.resources" rows="2" placeholder="e.g., Ambulances: 5, Beds: 100"></textarea>
      </div>

      <div class="form-group">
        <label>Notes</label>
        <textarea v-model="form.notes" rows="3"></textarea>
      </div>

      <div class="form-actions">
        <router-link to="/facilities" class="btn-cancel">Cancel</router-link>
        <button type="submit" :disabled="submitting" class="btn-submit">
          <span v-if="!submitting">Create Facility</span>
          <span v-else>Creating...</span>
        </button>
      </div>
    </form>
  </div>
</div>
```

  </div>
</template>

<script setup>
import { reactive, ref, onMounted, nextTick, inject } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const router = useRouter()
const baseUrl = inject('baseUrl', '')

const mapContainer = ref(null)
const form = reactive({
  name: '', type: '', address: '',
  latitude: null, longitude: null,
  status: 'operational', staff_count: 0,
  contact_number: '', resources: '', notes: ''
})
const errors = reactive({})
const generalError = ref('')
const submitting = ref(false)

let map = null
let marker = null

onMounted(async () => {
  await nextTick()
  const defaultLat = 12.8797, defaultLng = 121.7740
  map = L.map(mapContainer.value, { center: [defaultLat, defaultLng], zoom: 6 })
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors', maxZoom: 19 }).addTo(map)

  map.on('click', e => {
    form.latitude = parseFloat(e.latlng.lat.toFixed(6))
    form.longitude = parseFloat(e.latlng.lng.toFixed(6))
    if (marker) marker.setLatLng([form.latitude, form.longitude])
    else marker = L.marker([form.latitude, form.longitude]).addTo(map)
  })
})

async function submit() {
  submitting.value = true
  generalError.value = ''
  Object.keys(errors).forEach(k => delete errors[k])

  try {
    await axios.post(`${baseUrl}/facilities`, { ...form })
    router.push('/facilities')
  } catch (err) {
    if (err.response?.status === 422) Object.assign(errors, err.response.data.errors || {})
    else generalError.value = err.response?.data?.message || 'Failed to create facility. Please try again.'
  } finally { submitting.value = false }
}
</script>


<style scoped>
.page-container {
  min-height: 100vh;
  background: #f5f6fa;
  padding: 30px;
}

.content-wrapper {
  max-width: 800px;
  margin: auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 35px;
}

.title {
  font-size: 32px;
  font-weight: 700;
  color: #222;
}

.subtitle {
  color: #666;
  margin-top: 5px;
}

.back-link {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #4f46e5;
  font-weight: 500;
  text-decoration: none;
  transition: 0.2s;
}

.back-link:hover {
  color: #3730a3;
}

.icon {
  width: 16px;
  height: 16px;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}

.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.row {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

@media(min-width: 768px) {
  .row {
    flex-direction: row;
  }
}

.form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: 600;
  margin-bottom: 6px;
  color: #333;
}

.required {
  color: #dc2626;
}

input, select, textarea {
  padding: 10px 14px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 14px;
  transition: 0.2s;
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
}

.error-text {
  font-size: 13px;
  color: #b91c1c;
  margin-top: 4px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  border-top: 1px solid #eee;
  padding-top: 15px;
}

.btn-cancel {
  padding: 10px 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  text-decoration: none;
  color: #333;
  transition: 0.2s;
}

.btn-cancel:hover {
  background: #f3f3f3;
}

.btn-submit {
  padding: 10px 22px;
  background: #4f46e5;
  color: white;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}

.btn-submit:hover {
  background: #3730a3;
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-box {
  background: #ffe8e8;
  border-left: 4px solid #e11d48;
  padding: 12px 16px;
  border-radius: 8px;
  color: #b91c1c;
}

.map-container { width: 100%; height: 350px; border-radius: 12px; border: 1px solid #ccc; margin-top: 8px; }
.map-note { font-size: 0.875rem; color: #555; margin-top: 4px; }
</style>
