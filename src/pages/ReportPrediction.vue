<template>
  <div class="container">
    <div class="header mb-6">
      <h1 class="text-3xl font-bold gradient-text">Disaster Report</h1>
    </div>

      <div class="card mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select v-model="filters.severity" class="input-field">
            <option value="">All Severities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <input v-model="filters.disaster_type" placeholder="Disaster Type" class="input-field" />
          <button class="btn-submit" @click="fetchPredictions">Filter</button>
          <div class="flex justify-end">
            <button class="btn-submit" @click="downloadCSV">Download CSV</button>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-between mb-4">
        <div></div>
        <div>
          <span v-if="loading">Loading...</span>
          <span v-if="error" class="text-red-600">{{ error }}</span>
        </div>
      </div>


<div class="card">
  <table class="w-full table-auto border-collapse">
    <thead>
      <tr>
        <th class="th">Disaster Type</th>
        <th class="th">Severity</th>
        <th class="th">Location</th>
        <th class="th">Issued At</th>
        <th class="th">Valid Until</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="p in predictions" :key="p.id">
        <td class="td">{{ p.disaster_type }}</td>
        <td class="td">{{ p.severity }}</td>
        <td class="td">{{ p.location_name || 'N/A' }}</td>
        <td class="td">{{ formatDate(p.predicted_at) }}</td>
        <td class="td">{{ formatDate(p.valid_until) }}</td>
      </tr>
    </tbody>
  </table>
</div>

<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
  <div class="info-box purple">
    <p class="label">Total Disasters</p>
    <p class="value">{{ summary.total }}</p>
  </div>
  <div class="info-box green">
    <p class="label">By Severity</p>
    <p class="value" v-for="(count, severity) in summary.by_severity" :key="severity">{{ severity }}: {{ count }}</p>
  </div>
  <div class="info-box indigo">
    <p class="label">Active Disaster Risks</p>
    <p class="value">{{ summary.active }}</p>
  </div>
</div>
```

  </div>
</template>

<script setup>
import { reactive, toRefs, onMounted } from 'vue'
import axios from 'axios'

const state = reactive({
  predictions: [],
  summary: { total:0, by_severity:{}, active:0 },
  filters: { severity: '', disaster_type: '' },
  loading: false,
  error: null,
})

function formatDate(dt) { return dt ? new Date(dt).toLocaleString() : 'N/A' }

async function fetchPredictions() {
  state.loading = true
  state.error = null
  try {
    const params = { ...state.filters, json: 1 }
    const res = await axios.get('http://localhost:8000/api/reports/prediction', { params })
    state.predictions = res.data.predictions || []
    state.summary = res.data.summary || { total:0, by_severity:{}, active:0 }
  } catch (e) {
    console.error(e)
    state.error = e.message || 'Failed to load predictions.'
  } finally {
    state.loading = false
  }
}

async function downloadCSV() {
  const params = { ...state.filters, format: 'csv' }
  try {
    const res = await axios.get('http://localhost:8000/api/reports/prediction', { params, responseType: 'blob' })
    const blob = new Blob([res.data], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `prediction_report_${new Date().toISOString().slice(0,19).replace(/[:T]/g,'_')}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)
  } catch (e) {
    console.error('CSV download failed', e)
    state.error = 'Failed to download CSV.'
  }
}

onMounted(fetchPredictions)

const { predictions, summary, filters, loading, error } = toRefs(state)
</script>

<style scoped>
.container { max-width: 1100px; margin:0 auto; padding:20px; }
.gradient-text { background: linear-gradient(90deg,#6366f1,#f43f5e); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
.card { background:#fff; border-radius:12px; padding:20px; box-shadow:0 4px 12px rgba(0,0,0,0.08); margin-bottom:20px; }
.info-box { padding:15px; border-radius:12px; }
.info-box.purple { background:#f3e8ff; color:#7c3aed; }
.info-box.green { background:#d1fae5; color:#059669; }
.info-box.indigo { background:#e0e7ff; color:#4338ca; }
table { width:100%; border-collapse:collapse; }
.th, .td { padding:8px; border:1px solid #e5e7eb; text-align:left; }
</style>
