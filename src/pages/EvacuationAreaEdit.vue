<template>
  <div class="container mt-4">
    <div class="row">
      <div class="col-md-8 mx-auto">
        <h1 class="mb-4">Edit Evacuation Area</h1>

        <div v-if="successMessage" class="alert alert-success alert-dismissible fade show" role="alert">
          {{ successMessage }}
          <button type="button" class="btn-close" @click="successMessage = ''"></button>
        </div>
        <div v-if="errorMessage" class="alert alert-danger alert-dismissible fade show" role="alert">
          {{ errorMessage }}
          <button type="button" class="btn-close" @click="errorMessage = ''"></button>
        </div>

        <div v-if="loading" class="text-center">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <form v-else @submit.prevent="handleSubmit" class="bg-white p-4 rounded shadow-sm">
          <div class="row">
            <div class="col-md-6 mb-3">
              <label for="name" class="form-label">Name *</label>
              <input
                id="name"
                v-model="form.name"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.name }"
                required
              >
              <small v-if="errors.name" class="text-danger">{{ errors.name }}</small>
            </div>
            <div class="col-md-6 mb-3">
              <label for="status" class="form-label">Status *</label>
              <select
                id="status"
                v-model="form.status"
                class="form-select"
                :class="{ 'is-invalid': errors.status }"
                required
              >
                <option value="">Select Status</option>
                <option value="available">Available</option>
                <option value="full">Full</option>
                <option value="closed">Closed</option>
                <option value="maintenance">Maintenance</option>
              </select>
              <small v-if="errors.status" class="text-danger">{{ errors.status }}</small>
            </div>
          </div>

          <div class="mb-3">
            <label for="address" class="form-label">Address *</label>
            <input
              id="address"
              v-model="form.address"
              type="text"
              class="form-control"
              :class="{ 'is-invalid': errors.address }"
              required
            >
            <small v-if="errors.address" class="text-danger">{{ errors.address }}</small>
          </div>

          <div class="row">
            <div class="col-md-6 mb-3">
              <label for="capacity" class="form-label">Capacity *</label>
              <input
                id="capacity"
                v-model.number="form.capacity"
                type="number"
                class="form-control"
                :class="{ 'is-invalid': errors.capacity }"
                min="0"
                required
              >
              <small v-if="errors.capacity" class="text-danger">{{ errors.capacity }}</small>
            </div>
            <div class="col-md-6 mb-3">
              <label for="current_occupancy" class="form-label">Current Occupancy *</label>
              <input
                id="current_occupancy"
                v-model.number="form.current_occupancy"
                type="number"
                class="form-control"
                :class="{ 'is-invalid': errors.current_occupancy }"
                min="0"
                required
              >
              <small v-if="errors.current_occupancy" class="text-danger">{{ errors.current_occupancy }}</small>
            </div>
          </div>

          <div class="row">
            <div class="col-md-6 mb-3">
              <label for="latitude" class="form-label">Latitude</label>
              <input
                id="latitude"
                v-model.number="form.latitude"
                type="number"
                class="form-control"
                step="0.0001"
                placeholder="0.0000"
                @change="updateMap"
              >
            </div>
            <div class="col-md-6 mb-3">
              <label for="longitude" class="form-label">Longitude</label>
              <input
                id="longitude"
                v-model.number="form.longitude"
                type="number"
                class="form-control"
                step="0.0001"
                placeholder="0.0000"
                @change="updateMap"
              >
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label">Location Map (Click to update coordinates)</label>
            <div id="map-edit" style="height: 300px; border-radius: 5px; border: 1px solid #ddd;"></div>
            <small class="text-muted d-block mt-2">Click on the map to update location coordinates</small>
          </div>

          <div class="row">
            <div class="col-md-6 mb-3">
              <label for="contact_person" class="form-label">Contact Person</label>
              <input
                id="contact_person"
                v-model="form.contact_person"
                type="text"
                class="form-control"
              >
            </div>
            <div class="col-md-6 mb-3">
              <label for="contact_number" class="form-label">Contact Number</label>
              <input
                id="contact_number"
                v-model="form.contact_number"
                type="text"
                class="form-control"
              >
            </div>
          </div>

          <div class="mb-3">
            <label for="facilities" class="form-label">Facilities</label>
            <textarea
              id="facilities"
              v-model="form.facilities"
              class="form-control"
              rows="3"
              placeholder="List available facilities (water, food, medical, etc.)"
            ></textarea>
          </div>

          <div class="d-flex gap-2">
            <button type="submit" class="btn btn-primary" :disabled="submitting">
              <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
              {{ submitting ? 'Updating...' : 'Update' }}
            </button>
            <router-link :to="`/evacuation-areas/${$route.params.id}`" class="btn btn-secondary">Cancel</router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import axios from 'axios'
import { useRoute, useRouter } from 'vue-router'
import L from 'leaflet'

const route = useRoute()
const router = useRouter()

const form = ref({
  name: '',
  address: '',
  latitude: null,
  longitude: null,
  capacity: 0,
  current_occupancy: 0,
  status: '',
  facilities: '',
  contact_person: '',
  contact_number: ''
})

const errors = ref({})
const successMessage = ref('')
const errorMessage = ref('')
const loading = ref(false)
const submitting = ref(false)
let map = null
let marker = null

const API_URL = 'http://127.0.0.1:8000/api'

const fetchArea = async () => {
  loading.value = true
  try {
    const response = await axios.get(`${API_URL}/evacuation-areas/${route.params.id}`)
    Object.assign(form.value, response.data)
    loading.value = false
    await nextTick()
    initMap()
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Failed to fetch evacuation area'
    console.error(error)
  } finally {
    loading.value = false
  }
}

const initMap = () => {
  if (map) return

  const mapContainer = document.getElementById('map-edit')
  if (!mapContainer) {
    console.warn('Map container not found')
    return
  }

  const defaultLat = form.value.latitude || 12.8797
  const defaultLng = form.value.longitude || 121.7740

  map = L.map('map-edit').setView([defaultLat, defaultLng], 13)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map)

  map.on('click', (e) => {
    const { lat, lng } = e.latlng
    form.value.latitude = parseFloat(lat.toFixed(4))
    form.value.longitude = parseFloat(lng.toFixed(4))
    updateMapMarker(lat, lng)
  })

  if (form.value.latitude && form.value.longitude) {
    updateMapMarker(form.value.latitude, form.value.longitude)
  }
}

const updateMap = () => {
  if (form.value.latitude && form.value.longitude) {
    map.setView([form.value.latitude, form.value.longitude], 13)
    updateMapMarker(form.value.latitude, form.value.longitude)
  }
}

const updateMapMarker = (lat, lng) => {
  if (marker) {
    marker.setLatLng([lat, lng])
  } else {
    marker = L.marker([lat, lng]).addTo(map)
  }
}

const handleSubmit = async () => {
  errors.value = {}
  submitting.value = true

  try {
    const token = localStorage.getItem('token')
    await axios.put(`${API_URL}/evacuation-areas/${route.params.id}`, form.value, {
      headers: { Authorization: `Bearer ${token}` }
    })

    successMessage.value = 'Evacuation area updated successfully!'
    setTimeout(() => {
      router.push({
        name: 'EvacuationAreaShow',
        params: { id: route.params.id },
        query: { success: 'Area updated successfully' }
      })
    }, 1500)
  } catch (error) {
    if (error.response?.status === 422) {
      errors.value = error.response.data.errors || {}
    }
    errorMessage.value = error.response?.data?.message || 'Failed to update evacuation area'
    console.error(error)
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchArea()
})
</script>

<style scoped>
.form-control.is-invalid,
.form-select.is-invalid {
  border-color: #dc3545;
}

.text-danger {
  color: #dc3545;
}
</style>
