<template>
  <div class="container">
    <div class="header flex justify-between items-center mb-6">
      <div>
        <h1>Disaster Risk</h1>
        <p>Manage disasters</p>
      </div>
      <router-link to="/predictions/create" class="add-btn">+ Add Prediction</router-link>
    </div>

```
<div class="card overflow-x-auto">
  <table class="predictions-table">
    <thead>
      <tr>
        <th>Location</th>
        <th>Disaster Type</th>
        <th>Risk Level</th>
        <th>Recovery Days</th>
        <th>Severity</th>
        <th>Valid Until</th>
        <th>Issued At</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="p in predictions" :key="p.id">
        <td>
          <div class="font-medium text-gray-900">{{ p.location_name || 'N/A' }}</div>
          <div class="text-sm text-gray-500">{{ p.latitude }}, {{ p.longitude }}</div>
        </td>
        <td>
          <div class="font-medium">{{ p.disaster_type }}</div>
          <div class="text-sm text-gray-500">{{ p.description?.slice(0, 80) }}</div>
        </td>
        <td>{{ p.risk_level ?? 'N/A' }}/10</td>
        <td>{{ p.predicted_recovery_days ? '~' + p.predicted_recovery_days + ' days' : 'N/A' }}</td>
        <td>{{ p.severity ? p.severity.charAt(0).toUpperCase() + p.severity.slice(1) : 'N/A' }}</td>
        <td class="text-sm text-gray-500">{{ formatDate(p.valid_until) }}</td>
        <td class="text-sm text-gray-500">{{ formatDate(p.predicted_at) }}</td>
        <td>
          <router-link :to="`/predictions/${p.id}`" class="view-btn">View</router-link>
          <router-link :to="`/predictions/${p.id}/edit`" class="edit-btn">Edit</router-link>
          <button @click="remove(p.id)" class="delete-btn">Delete</button>
        </td>
      </tr>
      <tr v-if="predictions.length === 0">
        <td colspan="6" class="p-4 text-center text-gray-500">No predictions found</td>
      </tr>
    </tbody>
  </table>
</div>
```

  </div>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue'
import axios from 'axios'

const baseUrl = inject('baseUrl', '')
const predictions = ref([])

function formatDate(dt) {
  if (!dt) return 'N/A'
  try { return new Date(dt).toLocaleString() } catch { return dt }
}

async function load() {
  try {
    const res = await axios.get(`${baseUrl}/disaster-predictions`)
    predictions.value = res.data?.data || res.data || []
  } catch (e) {
    console.error('Failed to load predictions', e)
  }
}

async function remove(id) {
  if (!confirm('Delete this prediction?')) return
  try {
    await axios.delete(`${baseUrl}/disaster-predictions/${id}`)
    await load()
  } catch (e) {
    console.error('Delete failed', e)
    alert('Delete failed')
  }
}

onMounted(load)
</script>

<style scoped>
.container { max-width: 900px; margin: 0 auto; padding: 20px; }

.header { display:flex; justify-content:space-between; align-items:center; margin-bottom:25px; }
.header h1 { font-size:2.25rem; font-weight:bold; background:linear-gradient(90deg,#4f46e5,#06b6d4); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
.header p { color:#374151; margin-top:4px; }
.add-btn { background:#4f46e5; color:#fff; padding:10px 16px; border-radius:8px; font-weight:500; transition:0.2s; }
.add-btn:hover { background:#4338ca; }

.card { background:linear-gradient(135deg, #f9f9ff, #ffffff); border-radius:12px; padding:20px; box-shadow:0 6px 20px rgba(0,0,0,0.08); overflow-x:auto; }

.predictions-table { width:100%; border-collapse:collapse; }
.predictions-table th, .predictions-table td { padding:12px; text-align:left; border-bottom:1px solid #e5e7eb; }
.predictions-table th { font-size:0.75rem; color:#6b7280; text-transform:uppercase; letter-spacing:0.05em; }

.view-btn { color:#4f46e5; margin-right:8px; font-weight:500; }
.edit-btn { color:#16a34a; margin-right:8px; font-weight:500; }
.delete-btn { color:#dc2626; font-weight:500; background:none; border:none; cursor:pointer; }
.delete-btn:hover { text-decoration:underline; }
</style>
