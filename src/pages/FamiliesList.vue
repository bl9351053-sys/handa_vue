<template>
  <div class="container">
    <div class="header">
      <div>
        <h1>Families</h1>
        <p>Manage evacuated families and members</p>
      </div>
      <router-link to="/families/create" class="add-btn">
        <span class="plus">+</span> Add Family
      </router-link>
    </div>

```
<div v-if="generalError" class="error-message">
  <p>{{ generalError }}</p>
</div>

<div v-if="loading" class="loading-card">
  <div class="loading-content">
    <div class="spinner"></div>
    <span>Loading families...</span>
  </div>
</div>

<div v-else class="card">
  <table>
    <thead>
      <tr>
        <th>Family Head</th>
        <th>Members</th>
        <th>Evacuation Area</th>
        <th>Status</th>
        <th>Evacuated At</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="family in families" :key="family.id" class="hover-row">
        <td>
          <div class="name">{{ family.family_head_name }}</div>
          <div class="contact">{{ family.contact_number || 'No contact' }}</div>
        </td>
        <td>{{ family.total_members }}</td>
        <td>{{ family.evacuation_area?.name || 'Not assigned' }}</td>
        <td>
          <span :class="getStatusBadge(family.status)">{{ capitalizeStatus(family.status) }}</span>
        </td>
        <td>{{ formatDate(family.evacuated_at) }}</td>
        <td class="actions">
          <router-link :to="`/families/${family.id}`" class="view-btn">View</router-link>
          <router-link :to="`/families/${family.id}/edit`" class="edit-btn">Edit</router-link>
          <button @click="deleteFamily(family.id)" class="delete-btn">Delete</button>
        </td>
      </tr>
      <tr v-if="families.length === 0">
        <td colspan="6" class="empty">No families found.</td>
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
const families = ref([])
const generalError = ref('')
const loading = ref(true)

onMounted(() => fetchFamilies())

async function fetchFamilies() {
  loading.value = true
  generalError.value = ''
  try {
    const res = await axios.get(`${baseUrl}/families`)
    families.value = res.data?.data || res.data || []
  } catch (err) {
    generalError.value = 'Failed to load families. Please try again.'
    console.error('Fetch families error:', err)
  } finally {
    loading.value = false
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

function formatDate(date) {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

async function deleteFamily(id) {
  if (!confirm('Are you sure you want to delete this family?')) return
  try {
    await axios.delete(`${baseUrl}/families/${id}`)
    families.value = families.value.filter(f => f.id !== id)
  } catch (err) {
    generalError.value = 'Failed to delete family. Please try again.'
    console.error('Delete family error:', err)
  }
}
</script>

<style scoped>
.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}
.card {
  background: linear-gradient(145deg, #ffffff, #f0f4ff);
  border-radius: 15px;
  padding: 20px;
  overflow-x: auto;
  box-shadow: 0 6px 20px rgba(0,0,0,0.12);
  transition: all 0.3s ease;
}

.header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}
.header h1 {
  font-size: 2.2rem;
  margin: 0;
  background: linear-gradient(90deg, #4f46e5, #06b6d4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.header p {
  color: #374151;
  margin-top: 5px;
  font-weight: 500;
}
.add-btn {
  background: linear-gradient(90deg, #06b6d4, #4f46e5);
  color: #fff;
  text-decoration: none;
  padding: 10px 16px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  transition: all 0.3s ease;
}
.add-btn .plus {
  margin-right: 6px;
  font-size: 1.2rem;
}
.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(0,0,0,0.2);
}

.error-message {
  background-color: #fee2e2;
  border-left: 4px solid #f43f5e;
  color: #b91c1c;
  padding: 12px 16px;
  border-radius: 6px;
  margin-bottom: 20px;
  font-weight: 500;
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
}

.loading-card {
  background-color: #fff;
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
}
.loading-content {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  font-weight: 500;
  color: #374151;
}
.spinner {
  border: 4px solid #e0e7ff;
  border-top: 4px solid #4f46e5;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 700px;
}
th, td {
  padding: 14px 12px;
  text-align: left;
}
th {
  font-weight: 700;
  font-size: 0.9rem;
  text-transform: uppercase;
  color: #6d28d9;
  border-bottom: 3px solid #c7d2fe;
  background: linear-gradient(90deg, #e0e7ff, #f0f4ff);
}
td {
  font-size: 0.95rem;
  color: #1f2937;
  border-bottom: 1px solid #e5e7eb;
}
.hover-row:hover {
  background-color: #f0f9ff;
  transform: scale(1.01);
  transition: all 0.3s ease;
}

.status-evacuated {
  background-color: #d9f99d;
  color: #166534;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  box-shadow: 0 1px 4px rgba(0,0,0,0.12);
}
.status-returned {
  background-color: #bfdbfe;
  color: #1e40af;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  box-shadow: 0 1px 4px rgba(0,0,0,0.12);
}
.status-pending {
  background-color: #fef08a;
  color: #78350f;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  box-shadow: 0 1px 4px rgba(0,0,0,0.12);
}
.status-unknown {
  background-color: #f3f4f6;
  color: #374151;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;

}

.actions a, .actions button {

  margin-right: 10px;
  font-size: 0.9rem;
  background: none;
  border: none;
  cursor: pointer;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
}
.view-btn { color: #4f46e5; }
.view-btn:hover { text-decoration: underline; transform: scale(1.05); }
.edit-btn { color: #059669; }
.edit-btn:hover { text-decoration: underline; transform: scale(1.05); }
.delete-btn { color: #dc2626; }
.delete-btn:hover { text-decoration: underline; transform: scale(1.05); }

.empty {
  text-align: center;
  color: #6b7280;
  padding: 20px;
  font-style: italic;
}

@media (max-width: 768px) {
  table {
    display: block;
    overflow-x: auto;
  }
}
</style>
