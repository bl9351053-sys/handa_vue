<template>
  <div class="container">
    <div class="header mb-6">
      <h1 class="text-3xl font-bold gradient-text">Facility Report</h1>
    </div>

    <div class="flex items-center justify-between mb-4">
      <div>
        <button class="btn-submit" @click="fetchFacilities">Refresh</button>
        <button class="btn-submit ml-2" @click="downloadCSV">Download CSV</button>
      </div>
      <div>
        <span v-if="loading">Loading...</span>
        <span v-if="error" class="text-red-600">{{ error }}</span>
      </div>
    </div>
```
<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
  <div class="info-box purple">
    <p class="label">Total Facilities</p>
    <p class="value">{{ summary.total }}</p>
  </div>
  <div class="info-box green">
    <p class="label">By Status</p>
    <p class="value" v-for="(count, status) in summary.by_status" :key="status">{{ status }}: {{ count }}</p>
  </div>
  <div class="info-box indigo">
    <p class="label">By Type</p>
    <p class="value" v-for="(count, type) in summary.by_type" :key="type">{{ type }}: {{ count }}</p>
  </div>
</div>

<div class="card">
  <table class="w-full table-auto border-collapse">
    <thead>
      <tr>
        <th class="th">Name</th>
        <th class="th">Type</th>
        <th class="th">Status</th>
        <th class="th">Address</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="facility in facilities" :key="facility.id">
        <td class="td">{{ facility.name }}</td>
        <td class="td">{{ facility.type }}</td>
        <td class="td">{{ facility.status }}</td>
        <td class="td">{{ facility.address }}</td>
      </tr>
    </tbody>
  </table>
</div>
```

  </div>
</template>

<script setup>
</script>

<script setup>
import { reactive, toRefs, onMounted } from 'vue'
import axios from 'axios'

const state = reactive({
  facilities: [],
  summary: { total:0, by_status:{}, by_type:{} },
  loading: false,
  error: null,
})

async function fetchFacilities() {
  state.loading = true
  state.error = null
  try {
    const res = await axios.get('http://localhost:8000/api/reports/facility', { params: { json: 1 } })
    state.facilities = res.data.facilities || []
    state.summary = res.data.summary || { total:0, by_status:{}, by_type:{} }
  } catch (e) {
    console.error(e)
    state.error = e.message || 'Failed to load facilities.'
  } finally {
    state.loading = false
  }
}

async function downloadCSV() {
  try {
    const res = await axios.get('http://localhost:8000/api/reports/facility', { params: { format: 'csv' }, responseType: 'blob' })
    const blob = new Blob([res.data], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `facility_report_${new Date().toISOString().slice(0,19).replace(/[:T]/g,'_')}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)
  } catch (e) {
    console.error('CSV download failed', e)
    state.error = 'Failed to download CSV.'
  }
}

onMounted(fetchFacilities)

const { facilities, summary, loading, error } = toRefs(state)
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
