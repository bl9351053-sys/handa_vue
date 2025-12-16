<template>
  <div class="page-container">
    <div class="content-wrapper">
      <!-- Header -->
      <div class="header">
        <div>
          <h1 class="title">Facility Details</h1>
          <p class="subtitle">View facility information</p>
        </div>
        <router-link to="/facilities" class="back-link">
          <svg xmlns="http://www.w3.org/2000/svg" class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Facilities
        </router-link>
      </div>

```
  <!-- Loading -->
  <div v-if="loading" class="loading-card">
    <div class="loading-content">
      <div class="spinner"></div>
      <span>Loading facility...</span>
    </div>
  </div>

  <!-- Error -->
  <div v-else-if="generalError" class="error-card">
    <p>{{ generalError }}</p>
  </div>

  <!-- Facility Content -->
  <div v-else class="facility-card">
    <div class="facility-header">
      <div>
        <h2>{{ facility.name }}</h2>
        <p class="type">{{ facility.type }}</p>
      </div>
      <div :class="['status-badge', statusBadgeClass(facility.status)]">
        {{ statusLabel(facility.status) }}
      </div>
    </div>

    <!-- Info Grid -->
    <div class="info-grid">
      <div class="info-column">
        <div class="info-item">
          <p class="label">Address</p>
          <p class="value">{{ facility.address }}</p>
        </div>
        <div class="info-item">
          <p class="label">Staff Count</p>
          <p class="value">{{ facility.staff_count }} personnel</p>
        </div>
        <div class="info-item">
          <p class="label">Contact Number</p>
          <p class="value">{{ facility.contact_number || 'Not provided' }}</p>
        </div>
        <div class="info-item">
          <p class="label">Location Coordinates</p>
          <p class="value">
            {{ hasCoordinates ? formatCoord(facility.latitude) + ', ' + formatCoord(facility.longitude) : 'Not provided' }}
          </p>
        </div>
      </div>

      <div class="info-column">
        <div class="info-item" v-if="facility.last_checked">
          <p class="label">Last Checked</p>
          <p class="value">{{ formatDate(facility.last_checked) }}</p>
        </div>
        <div class="info-item">
          <p class="label">Resources</p>
          <p class="value">{{ facility.resources || 'None listed' }}</p>
        </div>
        <div class="info-item">
          <p class="label">Notes</p>
          <p class="value">{{ facility.notes || 'No notes' }}</p>
        </div>
      </div>
    </div>

    <!-- Map Section -->
    <div v-if="hasCoordinates" class="map-section">
      <h3>Location Map</h3>
      <div id="map"></div>
    </div>

    <!-- Actions -->
    <div class="actions">
      <router-link :to="`/facilities/${facility.id}/edit`" class="btn edit">Edit</router-link>
      <button @click="deleteFacility" class="btn delete">Delete</button>
    </div>
  </div>
</div>
```

  </div>
</template>

<script setup>
import { ref, inject, onMounted, nextTick, computed } from 'vue'
import axios from 'axios'
import { useRouter, useRoute } from 'vue-router'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

let map = null

const router = useRouter()
const route = useRoute()
const baseUrl = inject('baseUrl', '')
const facilityId = route.params.id

const facility = ref({})
const generalError = ref('')
const loading = ref(true)

const hasCoordinates = computed(() => {
  const lat = Number(facility.value.latitude)
  const lng = Number(facility.value.longitude)
  return Number.isFinite(lat) && Number.isFinite(lng)
})

function formatCoord(val) {
  const n = Number(val)
  return Number.isFinite(n) ? n.toFixed(6) : ''
}

async function fetchFacility() {
  try {
    const res = await axios.get(`${baseUrl}/facilities/${facilityId}`)
    facility.value = res.data?.data || res.data
  } catch (err) {
    generalError.value = 'Failed to load facility. Please try again.'
    console.error('Fetch facility error:', err)
  } finally {
    loading.value = false
  }
}

function initializeMap() {
  if (!hasCoordinates.value) return
  if (typeof window === 'undefined') return

  if (map) {
    map.remove()
    map = null
  }

  // Fix icon paths for bundlers
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
  })

  map = L.map('map').setView([Number(facility.value.latitude), Number(facility.value.longitude)], 13)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map)
  L.marker([Number(facility.value.latitude), Number(facility.value.longitude)])
    .bindPopup(facility.value.name || '')
    .addTo(map)
}

onMounted(async () => {
  await fetchFacility()
  if (hasCoordinates.value) {
    await nextTick()
    initializeMap()
  }
})

async function deleteFacility() {
  if (confirm('Are you sure you want to delete this facility? This action cannot be undone.')) {
    try {
      await axios.delete(`${baseUrl}/facilities/${facilityId}`)
      router.push('/facilities')
    } catch (err) {
      generalError.value = 'Failed to delete facility. Please try again.'
      console.error('Delete facility error:', err)
    }
  }
}

function statusLabel(status) {
  const labels = {
    operational: 'Operational',
    limited: 'Limited Capacity',
    offline: 'Offline',
    emergency: 'Emergency'
  }
  return labels[status] || status
}

function statusBadgeClass(status) {
  const classes = {
    operational: 'bg-green-500',
    limited: 'bg-yellow-500',
    offline: 'bg-gray-500',
    emergency: 'bg-red-500'
  }
  return classes[status] || 'bg-gray-500'
}

function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.page-container { min-height: 100vh; background: #f0f4f8; padding: 30px; font-family: 'Inter', sans-serif; }
.content-wrapper { max-width: 900px; margin: 0 auto; }

.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
.title { font-size: 2.5rem; font-weight: 700; background: linear-gradient(90deg,#6366f1,#4f46e5); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.subtitle { font-size: 1rem; color: #4b5563; margin-top: 4px; }
.back-link { display: flex; align-items: center; gap: 6px; font-weight: 500; color: #6366f1; text-decoration: none; transition: 0.3s; }
.back-link:hover { color: #4338ca; transform: translateX(-3px); }
.icon { width: 20px; height: 20px; }

.loading-card { background: rgba(255,255,255,0.95); padding: 40px; border-radius: 20px; box-shadow: 0 15px 35px rgba(0,0,0,0.12); text-align: center; margin-bottom: 20px; backdrop-filter: blur(5px); }
.loading-content { display: inline-flex; align-items: center; gap: 12px; font-weight: 500; color: #4b5563; }
.spinner { width: 32px; height: 32px; border: 4px solid #e0e7ff; border-top: 4px solid #6366f1; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

.error-card { background: rgba(254,226,226,0.95); color: #b91c1c; padding: 20px; border-left: 6px solid #f43f5e; border-radius: 15px; font-weight: 500; margin-bottom: 20px; box-shadow: 0 8px 25px rgba(0,0,0,0.08); backdrop-filter: blur(3px); }

.facility-card { background: rgba(255,255,255,0.98); padding: 30px; border-radius: 25px; box-shadow: 0 15px 35px rgba(0,0,0,0.1); transition: all 0.3s ease; }
.facility-card:hover { transform: translateY(-4px); box-shadow: 0 20px 45px rgba(0,0,0,0.15); }

.facility-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
.facility-header h2 { font-size: 2rem; font-weight: 700; color: #1f2937; }
.facility-header .type { color: #6b7280; margin-top: 2px; font-weight: 500; }

.status-badge { padding: 7px 18px; border-radius: 9999px; font-weight: 600; color: #fff; font-size: 0.875rem; text-align: center; box-shadow: 0 4px 10px rgba(0,0,0,0.15); transition: transform 0.2s; }
.status-badge:hover { transform: scale(1.05); }
.bg-green-500 { background: linear-gradient(90deg,#34d399,#059669); }
.bg-yellow-500 { background: linear-gradient(90deg,#facc15,#ca8a04); }
.bg-gray-500 { background: linear-gradient(90deg,#9ca3af,#6b7280); }
.bg-red-500 { background: linear-gradient(90deg,#f87171,#b91c1c); }

.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 25px; }
.info-column { display: flex; flex-direction: column; gap: 18px; }
.info-item { border-bottom: 1px solid #e5e7eb; padding-bottom: 12px; }
.label { font-size: 0.75rem; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
.value { font-size: 1rem; font-weight: 500; color: #1f2937; white-space: pre-wrap; }

.map-section { margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px; }
.map-section h3 { font-weight: 600; margin-bottom: 10px; color: #1f2937; }
#map { width: 100%; height: 420px; border-radius: 20px; border: 1px solid #d1d5db; }

.actions { display: flex; justify-content: flex-end; gap: 16px; margin-top: 25px; }
.btn { padding: 12px 24px; border-radius: 15px; font-weight: 600; font-size: 0.95rem; border: none; cursor: pointer; transition: all 0.3s ease; }
.btn.edit { background: linear-gradient(90deg,#6366f1,#4f46e5); color: #fff; }
.btn.edit:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(99,102,241,0.35); }
.btn.delete { background: linear-gradient(90deg,#ef4444,#b91c1c); color: #fff; }
.btn.delete:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(239,68,68,0.35); }

@media (max-width: 768px) {
  .info-grid { grid-template-columns: 1fr; }
  .facility-header { flex-direction: column; align-items: flex-start; gap: 10px; }
}
</style>
