<template>
  <div class="content-wrapper px-3 pt-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="mb-0">Evacuation Areas</h1>

      <router-link to="/evacuation-areas/create" class="btn btn-primary d-flex align-items-center gap-2">
        <i class="bi bi-plus-circle fs-5"></i>
        Add Evacuation Area
      </router-link>
    </div>

    <div v-if="successMessage" class="alert alert-success alert-dismissible fade show">
      {{ successMessage }}
      <button type="button" class="btn-close" @click="successMessage = ''"></button>
    </div>

    <div v-if="errorMessage" class="alert alert-danger alert-dismissible fade show">
      {{ errorMessage }}
      <button type="button" class="btn-close" @click="errorMessage = ''"></button>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border"></div>
    </div>

    <div v-else-if="areas.length > 0" class="row g-4">
      <div v-for="area in areas" :key="area.id" class="col-md-6 col-lg-4">
        <div class="card h-100 shadow-sm">
          <div class="card-body">
            <h5 class="card-title">{{ area.name }}</h5>
            <p class="text-muted small">{{ area.address }}</p>

            <span :class="['badge', getStatusClass(area.status)]">{{ area.status }}</span>

            <div class="mt-3">
              <div class="d-flex justify-content-between">
                <small>Occupancy</small>
                <small>{{ area.current_occupancy }} / {{ area.capacity }}</small>
              </div>

              <div class="progress" style="height: 18px;">
                <div
                  class="progress-bar"
                  :class="getOccupancyClass(area)"
                  :style="{ width: getOccupancyPercent(area) + '%' }"
                >
                  {{ getOccupancyPercent(area) }}%
                </div>
              </div>
            </div>

            <p class="small mt-3 mb-3">
              <strong>Contact:</strong> {{ area.contact_person || 'N/A' }}<br>
              <strong>Phone:</strong> {{ area.contact_number || 'N/A' }}<br>
              <strong>Families:</strong> {{ area.families_count || 0 }}
            </p>

            <div class="d-flex gap-2 mt-3">
              <router-link :to="`/evacuation-areas/${area.id}`" class="btn btn-sm btn-info flex-grow-1">
                View
              </router-link>

              <router-link :to="`/evacuation-areas/${area.id}/edit`" class="btn btn-sm btn-warning flex-grow-1">
                Edit
              </router-link>

              <button @click="deleteArea(area.id)" class="btn btn-sm btn-danger">
                <i class="bi bi-trash fs-6"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="alert alert-info text-center">No evacuation areas found.</div>
  </div>
</template>

<style scoped>
.content-wrapper {
  width: 100%;
}

.card {
  transition: 0.2s ease;
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0px 6px 15px rgba(0,0,0,0.2);
}
</style>


<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRoute } from 'vue-router'

const areas = ref([])
const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const route = useRoute()

const API_URL = 'http://127.0.0.1:8000/api'

const fetchAreas = async () => {
  loading.value = true
  try {
    const response = await axios.get(`${API_URL}/evacuation-areas`)
    areas.value = response.data
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Failed to fetch evacuation areas'
    console.error(error)
  } finally {
    loading.value = false
  }
}

const deleteArea = async (id) => {
  if (!confirm('Are you sure you want to delete this evacuation area?')) return

  try {
    const token = localStorage.getItem('token')
    await axios.delete(`${API_URL}/evacuation-areas/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    successMessage.value = 'Evacuation area deleted successfully'
    await fetchAreas()
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

const getOccupancyPercent = (area) => {
  if (area.capacity === 0) return 0
  return Math.round((area.current_occupancy / area.capacity) * 100)
}

const getOccupancyClass = (area) => {
  const percent = getOccupancyPercent(area)
  if (percent >= 90) return 'bg-danger'
  if (percent >= 70) return 'bg-warning'
  return 'bg-success'
}

onMounted(() => {
  if (route.query.success) {
    successMessage.value = route.query.success
  }
  fetchAreas()
})
</script>

<style scoped>
.card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

.progress {
  background-color: #e9ecef;
}
</style>
