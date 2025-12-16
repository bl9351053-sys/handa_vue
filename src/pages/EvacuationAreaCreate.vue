<template>
  <div class="container">
    <div class="header">
      <div>
        <h1>Create Evacuation Area</h1>
        <p>Add a new evacuation area</p>
      </div>
      <router-link to="/evacuation-areas" class="back-link">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M15 19l-7-7 7-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Back
      </router-link>
    </div>

```
<div class="card">
  <form @submit.prevent="submit">
    <div class="form-row">
      <div class="form-group">
        <label>Name <span class="required">*</span></label>
        <input v-model="form.name" type="text" required>
        <p v-if="errors.name" class="error">{{ errors.name }}</p>
      </div>

      <div class="form-group">
        <label>Status <span class="required">*</span></label>
        <select v-model="form.status" required>
          <option value="">Select Status</option>
          <option value="available">Available</option>
          <option value="full">Full</option>
          <option value="closed">Closed</option>
          <option value="maintenance">Maintenance</option>
        </select>
        <p v-if="errors.status" class="error">{{ errors.status }}</p>
      </div>
    </div>

    <div class="form-group">
      <label>Address <span class="required">*</span></label>
      <input v-model="form.address" type="text" required>
      <p v-if="errors.address" class="error">{{ errors.address }}</p>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label>Capacity <span class="required">*</span></label>
        <input v-model.number="form.capacity" type="number" required min="0">
        <p v-if="errors.capacity" class="error">{{ errors.capacity }}</p>
      </div>

      <div class="form-group">
        <label>Current Occupancy <span class="required">*</span></label>
        <input v-model.number="form.current_occupancy" type="number" required min="0">
        <p v-if="errors.current_occupancy" class="error">{{ errors.current_occupancy }}</p>
      </div>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label>Contact Person</label>
        <input v-model="form.contact_person" type="text" placeholder="Name of contact person">
        <p v-if="errors.contact_person" class="error">{{ errors.contact_person }}</p>
      </div>

      <div class="form-group">
        <label>Contact Number</label>
        <input v-model="form.contact_number" type="text" placeholder="Phone number">
        <p v-if="errors.contact_number" class="error">{{ errors.contact_number }}</p>
      </div>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label>Latitude</label>
        <input v-model.number="form.latitude" type="number" step="0.0001" placeholder="0.0000">
        <p v-if="errors.latitude" class="error">{{ errors.latitude }}</p>
      </div>

      <div class="form-group">
        <label>Longitude</label>
        <input v-model.number="form.longitude" type="number" step="0.0001" placeholder="0.0000">
        <p v-if="errors.longitude" class="error">{{ errors.longitude }}</p>
      </div>
    </div>

    <div class="form-group">
      <label>Facilities</label>
      <textarea v-model="form.facilities" rows="3" placeholder="List facilities, one per line or comma-separated"></textarea>
      <p v-if="errors.facilities" class="error">{{ errors.facilities }}</p>
    </div>

    <div class="form-group">
      <label>Location Map (Click to set coordinates)</label>
      <div ref="mapContainer" class="map-container"></div>
      <p class="map-note">Click on the map to set location coordinates</p>
    </div>

    <div class="form-actions">
      <router-link to="/evacuation-areas" class="btn-cancel">Cancel</router-link>
      <button type="submit" class="btn-submit" :disabled="submitting">
        <span v-if="!submitting">Create Area</span>
        <span v-else>Creating...</span>
      </button>
    </div>
  </form>
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
  name: '', address: '', latitude: null, longitude: null,
  capacity: 0, current_occupancy: 0, status: '',
  contact_person: '', contact_number: '', facilities: ''
})
const errors = reactive({})
const submitting = ref(false)

let map = null
let marker = null

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

onMounted(async () => {
  await nextTick()
  const defaultLat = 12.8797, defaultLng = 121.7740
  map = L.map(mapContainer.value, { center: [defaultLat, defaultLng], zoom: 6 })
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors', maxZoom: 19 }).addTo(map)

  map.on('click', e => {
    form.latitude = parseFloat(e.latlng.lat.toFixed(4))
    form.longitude = parseFloat(e.latlng.lng.toFixed(4))
    if (marker) marker.setLatLng([form.latitude, form.longitude])
    else marker = L.marker([form.latitude, form.longitude]).addTo(map)
  })
})

async function submit() {
  submitting.value = true
  Object.keys(errors).forEach(k => delete errors[k])
  try {
    const token = localStorage.getItem('token');
    console.log('Token from localStorage:', token);
    console.log('Authorization header will be:', `Bearer ${token}`);
    
    const response = await axios.post(`${baseUrl}/evacuation-areas`, { ...form })
    console.log('Success response:', response.data);
    router.push('/evacuation-areas')
  } catch (err) {
    console.error('Full error:', err);
    console.error('Error status:', err.response?.status);
    console.error('Error data:', err.response?.data);
    console.error('Error headers:', err.response?.config?.headers);
    
    if (err.response?.status === 422) {
      Object.assign(errors, err.response.data.errors || {})
    } else if (err.response?.status === 401) {
      errors.auth = 'Unauthorized. Please login again.'
      localStorage.removeItem('token');
      router.push('/login');
    }
  } finally { submitting.value = false }
}
</script>

<style scoped>
/* Container */
.container {
  max-width: 900px;
  margin: 40px auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: #f4f7f9;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.header h1 {
  font-size: 2.5rem;
  margin: 0;
  color: #1a202c;
}

.header p {
  margin-top: 5px;
  color: #555;
}

.back-link {
  display: flex;
  align-items: center;
  gap: 5px;
  text-decoration: none;
  color: #5a67d8;
  font-weight: 500;
}

.back-link:hover {
  color: #434190;
}

/* Card */
.card {
  background: #ffffff;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}

/* Form Rows */
.form-row {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

/* Form Groups */
.form-group {
  flex: 1 1 300px;
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
}

label {
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
}

input, select {
  padding: 10px 14px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: all 0.3s ease;
}

input:focus, select:focus {
  border-color: #5a67d8;
  box-shadow: 0 0 0 3px rgba(90,103,216,0.2);
}

.required {
  color: #e53e3e;
}

.error {
  color: #e53e3e;
  font-size: 0.875rem;
  margin-top: 4px;
}

/* Map */
.map-container {
  width: 100%;
  height: 350px;
  border-radius: 12px;
  border: 1px solid #ccc;
  margin-top: 8px;
}

.map-note {
  font-size: 0.875rem;
  color: #555;
  margin-top: 4px;
}

/* Actions */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 20px;
  border-top: 1px solid #e2e8f0;
  padding-top: 15px;
}

.btn-cancel {
  padding: 10px 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: #fff;
  color: #333;
  text-decoration: none;
  font-weight: 500;
  transition: background 0.3s ease;
}

.btn-cancel:hover {
  background: #f1f5f9;
}

.btn-submit {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  background: #5a67d8;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s ease;
}

.btn-submit:hover {
  background: #434190;
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
