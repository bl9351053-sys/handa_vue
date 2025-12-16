<template>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div>
        <h1>Family Details</h1>
        <p>View family information</p>
      </div>
      <router-link to="/families" class="back-link">
        <span class="arrow">&#8592;</span> Back to Families
      </router-link>
    </div>

```
<div v-if="loading" class="loading-card">
  <div class="spinner"></div>
  <span>Loading family...</span>
</div>

<div v-else-if="generalError" class="error-card">
  <p>{{ generalError }}</p>
</div>

<div v-else class="space-y-6">
  <div class="card">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2>{{ family.family_head_name }}</h2>
        <p>Family Head</p>
      </div>
      <div :class="getStatusBadge(family.status)" class="status-badge">
        {{ capitalizeStatus(family.status) }}
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div class="info-col">
        <div class="info-item">
          <p class="label">Contact Number</p>
          <p class="value">{{ family.contact_number || 'Not provided' }}</p>
        </div>
        <div class="info-item">
          <p class="label">Address</p>
          <p class="value">{{ family.address }}</p>
        </div>
        <div class="info-item">
          <p class="label">Total Members</p>
          <p class="value">{{ family.total_members }} people</p>
        </div>
        <div class="info-item">
          <p class="label">Evacuation Area</p>
          <p class="value">{{ family.evacuation_area?.name || 'Not assigned' }}</p>
        </div>
      </div>

      <div class="info-col">
        <div class="info-item">
          <p class="label">Evacuated At</p>
          <p class="value">{{ formatDate(family.evacuated_at) || 'Not evacuated' }}</p>
        </div>
        <div class="info-item">
          <p class="label">Created At</p>
          <p class="value">{{ formatDate(family.created_at) || 'N/A' }}</p>
        </div>
        <div class="info-item">
          <p class="label">Updated At</p>
          <p class="value">{{ formatDate(family.updated_at) || 'N/A' }}</p>
        </div>
      </div>
    </div>

    <div v-if="family.special_needs" class="special-needs">
      <h3>Special Needs</h3>
      <div class="special-card">
        <p>{{ family.special_needs }}</p>
      </div>
    </div>
  </div>

  <div v-if="family.evacuees" class="card">
    <h3>Family Members ({{ family.evacuees.length }})</h3>
    <div v-if="family.evacuees.length > 0" class="table-container">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Age</th>
            <th>Gender</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="member in family.evacuees" :key="member.id">
            <td>{{ member.name }}</td>
            <td>{{ member.age || 'N/A' }}</td>
            <td>{{ capitalizeStatus(member.gender || 'N/A') }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="empty">No individual members registered yet</div>
  </div>

  <div class="actions">
    <router-link :to="`/families/${family.id}/edit`" class="edit-btn">Edit</router-link>
    <button @click="deleteFamily" class="delete-btn">Delete</button>
  </div>
</div>
```

  </div>
</template>

<script setup>
import { ref, inject, onMounted } from 'vue'
import axios from 'axios'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const baseUrl = inject('baseUrl', '')
const familyId = route.params.id

const family = ref({})
const generalError = ref('')
const loading = ref(true)

onMounted(async () => fetchFamily())

async function fetchFamily() {
  try {
    const res = await axios.get(`${baseUrl}/families/${familyId}`)
    family.value = res.data?.data || res.data
  } catch (err) {
    generalError.value = 'Failed to load family. Please try again.'
  } finally {
    loading.value = false
  }
}

async function deleteFamily() {
  if (!confirm('Are you sure you want to delete this family?')) return
  try {
    await axios.delete(`${baseUrl}/families/${familyId}`)
    router.push('/families')
  } catch {
    generalError.value = 'Failed to delete family. Please try again.'
  }
}

function getStatusBadge(status) {
  const badges = {
    evacuated: 'status-evacuated',
    returned: 'status-returned',
    pending: 'status-pending'
  }
  return badges[status] || 'status-unknown'
}

function capitalizeStatus(status) {
  return status ? status.charAt(0).toUpperCase() + status.slice(1) : ''
}

function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit' })
}
</script>

<style scoped>
.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}
.header h1 {
  font-size: 2.5rem;
  font-weight: bold;
  background: linear-gradient(90deg,#4f46e5,#06b6d4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.header p { color: #374151; margin-top: 4px; }
.back-link { font-weight: 500; color:#4f46e5; display:flex; align-items:center; gap:5px; }
.back-link:hover { text-decoration:underline; }

.card {
  background: linear-gradient(135deg, #f9f9ff, #ffffff);
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.08);
}

.loading-card, .error-card {
  background:#fff;
  padding:40px;
  border-radius:12px;
  text-align:center;
  box-shadow:0 4px 15px rgba(0,0,0,0.05);
  display:flex; flex-direction:column; align-items:center; gap:10px;
}
.spinner {
  border:4px solid #e5e7eb;
  border-top:4px solid #4f46e5;
  border-radius:50%;
  width:36px; height:36px;
  animation:spin 1s linear infinite;
}
@keyframes spin { 0%{transform:rotate(0deg);}100%{transform:rotate(360deg);} }
.error-card p { color:#b91c1c; }

.status-badge {
  padding:6px 14px;
  border-radius:9999px;
  font-weight:600;
  color:#fff;
}
.status-evacuated { background:#16a34a; }
.status-returned { background:#3b82f6; }
.status-pending { background:#facc15; }
.status-unknown { background:#6b7280; }

.info-col { display:flex; flex-direction:column; gap:12px; }
.info-item { border-bottom:1px solid #e5e7eb; padding-bottom:8px; }
.label { font-size:0.75rem; text-transform:uppercase; color:#6b7280; }
.value { font-weight:500; color:#111827; font-size:1rem; }

.special-needs h3 { font-weight:600; margin-bottom:6px; }
.special-card { background:#fef9c3; border:1px solid #fde68a; border-radius:8px; padding:12px; color:#78350f; }

.table-container { overflow-x:auto; }
table { width:100%; border-collapse:collapse; }
thead { background:#f3f4f6; }
th, td { padding:12px 15px; text-align:left; }
th { font-size:0.75rem; color:#6b7280; text-transform:uppercase; }
tbody tr:hover { background:#f9fafb; }

.empty { padding:20px; text-align:center; color:#6b7280; }

.actions { display:flex; justify:end; gap:15px; margin-top:15px; }
.edit-btn { background:#4f46e5; color:#fff; padding:10px 20px; border-radius:8px; font-weight:500; }
.edit-btn:hover { background:#4338ca; }
.delete-btn { background:#dc2626; color:#fff; padding:10px 20px; border-radius:8px; font-weight:500; }
.delete-btn:hover { background:#b91c1c; }

@media(max-width:768px){
  .header{flex-direction:column;align-items:flex-start;gap:10px;}
  .grid{grid-template-columns:1fr;}
}
</style>
