<template>
  <div class="container">
    <div class="header flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold gradient-text">Evacuation Report</h1>
    </div>

      <div class="flex items-center justify-between mb-4">
        <div>
          <button class="btn-submit" @click="fetchReport">Refresh</button>
          <button class="btn-submit ml-2" @click="downloadCSV">Download CSV</button>
        </div>
        <div>
          <span v-if="loading">Loading...</span>
          <span v-if="error" class="text-red-600">{{ error }}</span>
        </div>
      </div>


<div class="card mb-6">
  <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
    <input v-model="filters.status" placeholder="Status" class="input-field" />
    <select v-model="filters.evacuation_area_id" class="input-field">
      <option value="">All Areas</option>
      <option v-for="area in evacuationAreas" :key="area.id" :value="area.id">{{ area.name }}</option>
    </select>
    <input type="date" v-model="filters.date_from" class="input-field" />
    <input type="date" v-model="filters.date_to" class="input-field" />
    <button @click="fetchReport" class="btn-submit col-span-1 md:col-span-1">Filter</button>
  </div>
</div>

<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
  <div class="info-box purple">
    <p class="label">Total Families</p>
    <p class="value">{{ summary.total_families }}</p>
  </div>
  <div class="info-box green">
    <p class="label">Total Evacuees</p>
    <p class="value">{{ summary.total_evacuees }}</p>
  </div>
</div>

<div class="card">
  <table class="w-full table-auto border-collapse">
    <thead>
      <tr>
        <th class="th">Family Head</th>
        <th class="th">Contact</th>
        <th class="th">Address</th>
        <th class="th">Members</th>
        <th class="th">Evacuation Area</th>
        <th class="th">Status</th>
        <th class="th">Evacuated At</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="family in families" :key="family.id">
        <td class="td">{{ family.family_head_name }}</td>
        <td class="td">{{ family.contact_number }}</td>
        <td class="td">{{ family.address }}</td>
        <td class="td">{{ family.total_members }}</td>
        <td class="td">{{ family.evacuation_area?.name || 'N/A' }}</td>
        <td class="td">{{ family.status }}</td>
        <td class="td">{{ formatDate(family.evacuated_at) }}</td>
      </tr>
    </tbody>
  </table>
</div>
```

  </div>
</template>

<script setup>
import { reactive, toRefs, onMounted } from 'vue'
import axios from 'axios'

const state = reactive({
  families: [],
  evacuationAreas: [],
  summary: { total_families: 0, total_evacuees: 0 },
  filters: { status: '', evacuation_area_id: '', date_from: '', date_to: '' },
  loading: false,
  error: null,
})

function formatDate(dt) { return dt ? new Date(dt).toLocaleString() : 'N/A' }

async function fetchReport() {
  state.loading = true
  state.error = null
  try {
    const params = { ...state.filters, json: 1 }
    const res = await axios.get('http://localhost:8000/api/reports/evacuation', { params })
    state.families = res.data.data || []
    state.summary = res.data.summary || { total_families: 0, total_evacuees: 0 }
  } catch (e) {
    console.error(e)
    state.error = e.message || 'Failed to load evacuation report.'
  } finally {
    state.loading = false
  }
}

async function loadAreas() {
  try {
    const res = await axios.get('http://localhost:8000/api/evacuation-areas')
    state.evacuationAreas = res.data || []
  } catch (e) {
    console.warn('Failed to load areas', e)
  }
}

async function downloadCSV() {
  const params = { ...state.filters, format: 'csv' }
  try {
    const res = await axios.get('http://localhost:8000/api/reports/evacuation', { params, responseType: 'blob' })
    const blob = new Blob([res.data], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `evacuation_report_${new Date().toISOString().slice(0,19).replace(/[:T]/g,'_')}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)
  } catch (e) {
    console.error('CSV download failed', e)
    state.error = 'Failed to download CSV.'
  }
}

onMounted(async () => {
  await loadAreas()
  await fetchReport()
})

const { families, evacuationAreas, summary, filters, loading, error } = toRefs(state)
</script>

<style scoped>
.container { max-width: 1100px; margin:0 auto; padding:20px; }
.gradient-text { background: linear-gradient(90deg,#6366f1,#f43f5e); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
.card { background:#fff; border-radius:12px; padding:20px; box-shadow:0 4px 12px rgba(0,0,0,0.08); margin-bottom:20px; }
.input-field { border:1px solid #d1d5db; border-radius:8px; padding:8px; width:100%; }
.btn-submit { background:#4f46e5; color:#fff; padding:8px 12px; border-radius:8px; }
.info-box { padding:15px; border-radius:12px; }
.info-box.purple { background:#f3e8ff; color:#7c3aed; }
.info-box.green { background:#d1fae5; color:#059669; }
table { width:100%; border-collapse:collapse; }
.th, .td { padding:8px; border:1px solid #e5e7eb; text-align:left; }
</style>
