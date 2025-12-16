<template>
  <div class="families-list">
    <div class="card">
      <div class="card-header">👨‍👩‍👧‍👦 Families Currently in Evacuation Areas</div>
      <div class="card-body">
        <div v-if="loading" class="center">Loading families…</div>
        <div v-else-if="error" class="center error">{{ error }}</div>


    <div v-else>
      <div v-if="families.length">
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Family Name</th>
                <th>Members</th>
                <th>Contact Number</th>
                <th>Evacuation Area</th>
                <th>Special Needs</th>
                <th>Checked In</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="f in families" :key="f.id">
                <td><strong>{{ f.family_head_name }}</strong></td>
                <td>{{ f.total_members }}</td>
                <td>{{ f.contact_number }}</td>
                <td>
                  <router-link
                    v-if="getAreaId(f)"
                    :to="`/resident_pages/evacuation-areas/${getAreaId(f)}`"
                    class="text-link"
                  >
                    {{ getAreaName(f) }}
                  </router-link>
                  <span v-else class="muted">-</span>
                </td>
                <td>{{ f.special_needs || 'None' }}</td>
                <td>{{ formatDate(f.checked_in_at) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="meta && meta.total" class="mt-3 muted">Total: {{ meta.total }}</div>
      </div>
      <div v-else class="muted">No families currently in evacuation areas.</div>
    </div>
  </div>
</div>
```

  </div>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue';

const residentAxios = inject('residentAxios', null);
let axiosFallback = null;

const families = ref([]);
const loading = ref(true);
const error = ref('');
const meta = ref(null);

function formatDate(value) {
  if (!value) return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  try {
    const d = new Date(value);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch { return String(value); }
}

function getAreaName(f) {
  return f.evacuation_area?.name || f.evacuationArea?.name || 'Unknown';
}

function getAreaId(f) {
  return f.evacuation_area?.id || f.evacuationArea?.id || null;
}

async function fetchFamilies() {
  loading.value = true;
  error.value = '';
  try {
    if (!axiosFallback) {
      const mod = await import('axios');
      axiosFallback = mod.default || mod;
    }
    const http = residentAxios || axiosFallback;
    const res = await http.get('/families');
    const payload = res.data || res;
    if (payload.families) {
      families.value = payload.families.data || payload.families || [];
      meta.value = payload.families || null;
    } else if (Array.isArray(payload)) {
      families.value = payload;
    } else if (payload.data && Array.isArray(payload.data)) {
      families.value = payload.data;
      meta.value = payload || null;
    } else {
      families.value = payload.families || payload;
    }
  } catch (e) {
    console.error('Failed to load families', e);
    error.value = e.response?.data?.message || e.message || 'Failed to load families';
  } finally { loading.value = false; }
}

onMounted(fetchFamilies);
</script>

<style scoped>
/* Container */
.families-list {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: #f4f6fb;
}

/* Card */
.card {
  background: #ffffff;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s, box-shadow 0.2s;
}
.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
}
.card-header {
  font-weight: 700;
  font-size: 1.4rem;
  margin-bottom: 20px;
  color: #2a3f5f;
  border-left: 6px solid #667eea;
  padding-left: 12px;
}

/* Table */
.table-responsive {
  overflow-x: auto;
}
.table {
  width: 100%;
  border-collapse: collapse;
  min-width: 700px;
}
.table th, .table td {
  padding: 12px 15px;
  border-bottom: 1px solid #e2e8f0;
  text-align: left;
}
.table th {
  background: #eef2f7;
  color: #2a3f5f;
  font-weight: 600;
  text-transform: uppercase;
}
.table tr:nth-child(even) {
  background: #f9fafc;
}
.table tr:hover {
  background-color: #e6f0ff;
  transition: 0.2s;
  cursor: pointer;
}

/* Text & Links */
.center { text-align: center; padding: 1rem; font-size: 1.05rem; color: #4b5563; }
.error { color: #d32f2f; font-weight: 600; }
.muted { color: #6b7280; font-size: 0.875rem; }
.text-link {
  color: #4f46e5;
  text-decoration: none;
  font-weight: 500;
}
.text-link:hover { 
  color: #3730a3;
  text-decoration: underline; 
}

/* Buttons */
.btn {
  padding: 8px 16px;
  border-radius: 8px;
  color: #fff;
  background: #4f46e5;
  font-weight: 500;
  text-align: center;
  display: inline-block;
  transition: background 0.3s, transform 0.2s;
}
.btn:hover {
  background: #3730a3;
  transform: translateY(-2px);
}

/* Spacing */
.mt-3 { margin-top: 12px; }

/* Responsive */
@media (max-width: 768px) {
  .table { min-width: 100%; }
}
</style>
