<template>
  <div class="container mt-4">
    <div class="row">
      <div class="col-md-8 mx-auto">
        <router-link to="/evacuation-areas" class="btn btn-secondary mb-3">
          <i class="bi bi-arrow-left"></i> Back
        </router-link>

        <div v-if="errorMessage" class="alert alert-danger alert-dismissible fade show" role="alert">
          {{ errorMessage }}
          <button type="button" class="btn-close" @click="errorMessage = ''"></button>
        </div>

        <div v-if="loading" class="text-center">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <div v-else-if="area" class="bg-white p-4 rounded shadow-sm">
          <div class="d-flex justify-content-between align-items-start mb-4">
            <div>
              <h1 class="mb-2">{{ area.name }}</h1>
              <p class="text-muted mb-0">{{ area.address }}</p>
            </div>
            <div>
              <router-link :to="`/evacuation-areas/${area.id}/edit`" class="btn btn-warning btn-sm">
                <i class="bi bi-pencil"></i> Edit
              </router-link>
            </div>
          </div>

          <div class="row mb-4">
            <div class="col-md-6">
              <div class="card">
                <div class="card-body">
                  <h6 class="card-title text-muted">Status</h6>
                  <span :class="['badge', getStatusClass(area.status), 'fs-6']">
                    {{ area.status }}
                  </span>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="card">
                <div class="card-body">
                  <h6 class="card-title text-muted">Occupancy</h6>
                  <p class="card-text">{{ area.current_occupancy }} / {{ area.capacity }} persons</p>
                  <div class="progress" style="height: 20px;">
                    <div
                      class="progress-bar"
                      :class="getOccupancyClass(area)"
                      :style="{ width: getOccupancyPercent(area) + '%' }"
                    >
                      {{ getOccupancyPercent(area) }}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="card mb-4">
            <div class="card-header bg-light">
              <h6 class="mb-0">Contact Information</h6>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6">
                  <strong>Contact Person:</strong>
                  <p>{{ area.contact_person || 'Not provided' }}</p>
                </div>
                <div class="col-md-6">
                  <strong>Phone Number:</strong>
                  <p>{{ area.contact_number || 'Not provided' }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="card mb-4">
            <div class="card-header bg-light">
              <h6 class="mb-0">Location</h6>
            </div>
            <div class="card-body">
              <div v-if="area.latitude && area.longitude">
                <div id="map-view" style="height: 300px; border-radius: 5px; margin-bottom: 15px;"></div>
                <p class="text-muted small">
                  <strong>Latitude:</strong> {{ area.latitude }}<br>
                  <strong>Longitude:</strong> {{ area.longitude }}
                </p>
              </div>
              <div v-else class="alert alert-info mb-0">
                No location coordinates provided
              </div>
            </div>
          </div>

          <div class="card mb-4">
            <div class="card-header bg-light">
              <h6 class="mb-0">Facilities</h6>
            </div>
            <div class="card-body">
              <p v-if="area.facilities" class="mb-0">{{ area.facilities }}</p>
              <p v-else class="text-muted mb-0">No facilities listed</p>
            </div>
          </div>

          <div class="card mb-4">
            <div class="card-header bg-light">
              <h6 class="mb-0">Evacuated Families</h6>
            </div>
            <div class="card-body">
              <div v-if="area.families && area.families.length > 0">
                <div class="table-responsive">
                  <table class="table table-striped table-hover">
                    <thead>
                      <tr>
                        <th>Family Head Name</th>
                        <th>Members</th>
                        <th>Contact Number</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="family in area.families" :key="family.id">
                        <td>{{ getFamilyHeadName(family) }}</td>
                        <td>{{ family.evacuees ? family.evacuees.length : 0 }}</td>
                        <td>{{ getFamilyContact(family) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div v-else class="text-muted">
                No families currently evacuated in this area
              </div>
            </div>
          </div>

          <div class="row text-muted small">
            
            <div class="col-md-6">
              <p v-if="area.created_at" class="mb-0">
                <strong>Created:</strong> {{ formatDate(area.created_at) }}
              </p>
            </div>
          </div>

          <div class="d-flex gap-2 mt-4">
            <router-link :to="`/evacuation-areas/${area.id}/edit`" class="btn btn-warning">
              <i class="bi bi-pencil"></i> Edit
            </router-link>
            <button @click="deleteArea" class="btn btn-danger">
              <i class="bi bi-trash"></i> Delete
            </button>
            <router-link to="/evacuation-areas" class="btn btn-secondary">
              <i class="bi bi-list"></i> Back to List
            </router-link>
          </div>
        </div>

        <div v-else class="alert alert-warning">
          Evacuation area not found
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRoute, useRouter } from 'vue-router'
import L from 'leaflet'

const route = useRoute()
const router = useRouter()

const area = ref(null)
const loading = ref(false)
const errorMessage = ref('')
let map = null

const API_URL = 'http://127.0.0.1:8000/api'

const fetchArea = async () => {
  loading.value = true
  try {
    const response = await axios.get(`${API_URL}/evacuation-areas/${route.params.id}`)
    area.value = response.data
    setTimeout(() => {
      initMap()
    }, 100)
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Failed to fetch evacuation area'
    console.error(error)
  } finally {
    loading.value = false
  }
}

const initMap = () => {
  if (!area.value || !area.value.latitude || !area.value.longitude) return
  if (map) return

  const mapContainer = document.getElementById('map-view')
  if (!mapContainer) return

  map = L.map('map-view').setView([area.value.latitude, area.value.longitude], 13)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map)

  L.marker([area.value.latitude, area.value.longitude])
    .bindPopup(area.value.name)
    .addTo(map)
    .openPopup()
}

const deleteArea = async () => {
  if (!confirm('Are you sure you want to delete this evacuation area?')) return

  try {
    const token = localStorage.getItem('token')
    await axios.delete(`${API_URL}/evacuation-areas/${area.value.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    router.push('/evacuation-areas?success=Area deleted successfully')
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Failed to delete evacuation area'
    console.error(error)
  }
}

const getStatusClass = (status) => {
  const statusMap = {
    available: 'bg-success',
    full: 'bg-warning',
    closed: 'bg-danger',
    maintenance: 'bg-secondary'
  }
  return statusMap[status] || 'bg-secondary'
}

const getOccupancyPercent = (areaData) => {
  if (areaData.capacity === 0) return 0
  return Math.round((areaData.current_occupancy / areaData.capacity) * 100)
}

const getOccupancyClass = (areaData) => {
  const percent = getOccupancyPercent(areaData)
  if (percent >= 90) return 'bg-danger'
  if (percent >= 70) return 'bg-warning'
  return 'bg-success'
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getFamilyHeadName = (family) => {
  if (family.family_head_name) {
    return family.family_head_name
  }

  if (family.evacuees && family.evacuees.length > 0) {
    const head = family.evacuees.find(evacuee =>
      evacuee.relationship && evacuee.relationship.toLowerCase().includes('head')
    )
    if (head) {
      return `${head.first_name} ${head.last_name}`
    }
    return `${family.evacuees[0].first_name} ${family.evacuees[0].last_name}`
  }

  return 'Unknown'
}

const getFamilyContact = (family) => {
  return family.contact_number || 'N/A'
}

onMounted(() => {
  fetchArea()
})
</script>

<style scoped>
.card {
  border: 1px solid #ddd;
  transition: box-shadow 0.2s;
}

.card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.badge {
  padding: 0.5rem 1rem;
}
</style>
