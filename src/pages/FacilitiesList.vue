<template>
  <div class="page-container">
    <div class="content-wrapper">

      <div class="header">
        <div>
          <h1 class="title">Facilities</h1>
          <p class="subtitle">Monitor emergency facilities and resources</p>
        </div>

        <router-link to="/facilities/create" class="btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" class="icon" fill="none"
               viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 4v16m8-8H4" />
          </svg>
          Add Facility
        </router-link>
      </div>

      <div v-if="generalError" class="error-box">
        {{ generalError }}
      </div>

      <div v-if="loading" class="loading-box">
        <div class="loader"></div>
        <p>Loading facilities...</p>
      </div>

      <div v-else class="card">
        <div class="table-wrapper">
          <table class="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Status</th>
                <th>Staff</th>
                <th>Last Checked</th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="facility in facilities" :key="facility.id">
                <td>
                  <div class="name-text">{{ facility.name }}</div>
                  <div class="subtext">
                    {{ (facility.address || '').substring(0, 40) }}
                    {{ facility.address?.length > 40 ? '...' : '' }}
                  </div>
                </td>

                <td>{{ facility.type }}</td>

                <td>
                  <span :class="['badge', getStatusBadge(facility.status)]">
                    {{ capitalizeStatus(facility.status) }}
                  </span>
                </td>

                <td>{{ facility.staff_count }}</td>

                <td class="subtext">{{ formatDate(facility.last_checked) }}</td>

                <td class="actions">
                  <router-link :to="`/facilities/${facility.id}`" class="action view">View</router-link>
                  <router-link :to="`/facilities/${facility.id}/edit`" class="action edit">Edit</router-link>
                  <button @click="deleteFacility(facility.id)" class="action delete">Delete</button>
                </td>
              </tr>

              <tr v-if="facilities.length === 0">
                <td colspan="6" class="empty-data">No facilities found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  </div>
</template>



<script setup>
import { ref, onMounted, inject } from 'vue'
import axios from 'axios'

const baseUrl = inject('baseUrl', '')

const facilities = ref([])
const loading = ref(false)
const generalError = ref('')

onMounted(async () => {
  await fetchFacilities()
})

async function fetchFacilities() {
  loading.value = true
  generalError.value = ''
  try {
    const res = await axios.get(`${baseUrl}/facilities`)
    facilities.value = res.data?.data || res.data || []
  } catch (err) {
    generalError.value = 'Failed to load facilities. Please try again.'
    console.error('Fetch facilities error:', err)
  } finally {
    loading.value = false
  }
}

function getStatusBadge(status) {
  const badges = {
    operational: 'bg-green-100 text-green-800',
    limited: 'bg-yellow-100 text-yellow-800',
    offline: 'bg-gray-100 text-gray-800',
    emergency: 'bg-red-100 text-red-800'
  }
  return badges[status] || 'bg-gray-100 text-gray-800'
}

function capitalizeStatus(status) {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

function formatDate(date) {
  if (!date) return 'Never'
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

async function deleteFacility(id) {
  if (!confirm('Are you sure you want to delete this facility?')) return
  
  try {
    await axios.delete(`${baseUrl}/facilities/${id}`)
    facilities.value = facilities.value.filter(f => f.id !== id)
  } catch (err) {
    generalError.value = 'Failed to delete facility. Please try again.'
    console.error('Delete facility error:', err)
  }
}
</script>
<style scoped>
.page-container {
  min-height: 100vh;
  background: #f5f6fa;
  padding: 30px;
}

.content-wrapper {
  max-width: 1200px;
  margin: auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 35px;
}

.title {
  font-size: 34px;
  font-weight: 700;
  color: #222;
}

.subtitle {
  color: #666;
  margin-top: 5px;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #4f46e5;
  color: white;
  padding: 12px 22px;
  border-radius: 10px;
  font-weight: 500;
  text-decoration: none;
  transition: 0.2s;
  box-shadow: 0 3px 6px rgba(0,0,0,0.12);
}

.btn-primary:hover {
  background: #4338ca;
}

.icon {
  width: 18px;
  height: 18px;
}

.error-box {
  background: #ffe8e8;
  border-left: 4px solid #e11d48;
  padding: 15px;
  color: #b91c1c;
  margin-bottom: 20px;
  border-radius: 8px;
}

.loading-box {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
  text-align: center;
}

.loader {
  width: 30px;
  height: 30px;
  border: 4px solid #ddd;
  border-top-color: #4f46e5;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: auto;
  margin-bottom: 10px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e5e5;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  overflow: hidden;
}

.table-wrapper {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table thead {
  background: #f8f9fb;
}

.table th {
  padding: 14px;
  font-size: 13px;
  text-transform: uppercase;
  color: #666;
  font-weight: 600;
  border-bottom: 1px solid #ddd;
}

.table td {
  padding: 16px;
  border-bottom: 1px solid #eee;
  color: #333;
}

.name-text {
  font-weight: bold;
  color: #222;
}

.subtext {
  font-size: 13px;
  color: #666;
}

.badge {
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.bg-green { background: #d1fae5; color: #065f46; }
.bg-yellow { background: #fef3c7; color: #92400e; }
.bg-gray { background: #e5e7eb; color: #374151; }
.bg-red { background: #fee2e2; color: #991b1b; }

.actions {
  text-align: center;
}

.action {
  margin: 0 7px;
  cursor: pointer;
  font-weight: 600;
  text-decoration: none;
  transition: 0.2s;
}

.action.view { color: #4f46e5; }
.action.view:hover { color: #3730a3; }

.action.edit { color: #059669; }
.action.edit:hover { color: #047857; }

.action.delete { color: #dc2626; }
.action.delete:hover { color: #b91c1c; }

.empty-data {
  padding: 40px;
  text-align: center;
  color: #777;
}
</style>

