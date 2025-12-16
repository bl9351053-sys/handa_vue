<template>
  <div class="predictions-page">
    <div class="card">
      <div class="card-header">🔮 Disaster Risk & Recovery Estimates</div>

```
  
  <div v-if="loading" class="center py-8">Loading predictions...</div>
  <div v-if="error" class="center error p-3">{{ error }}</div>

  <div v-if="!loading && predictions.length > 0" class="table-container">
    <table class="table">
      <thead>
        <tr>
          <th>Location</th>
          <th>Disaster Type</th>
          <th>Risk Level</th>
          <th>Recovery Days</th>
          <th>Issued At</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in predictions" :key="p.id" :class="rowClass(p.risk_level)">
          <td>
            <strong>{{ p.location_name || 'Unknown' }}</strong><br>
            <small class="text-muted">{{ p.latitude || 'N/A' }}, {{ p.longitude || 'N/A' }}</small>
          </td>
          <td><span class="badge badge-info">{{ capitalize(p.disaster_type) }}</span></td>
          <td>
            <div class="risk-level-container">
              <span class="badge" :class="badgeClass(p.risk_level)">{{ p.risk_level }}/10</span>
              <div class="risk-bar-background mt-2">
                <div class="risk-bar-fill" :class="riskFillClass(p.risk_level)" :style="{ width: (p.risk_level || 0) * 10 + '%' }"></div>
              </div>
            </div>
          </td>
          <td>
            <span v-if="p.predicted_recovery_days">~{{ p.predicted_recovery_days }} days</span>
            <span v-else>N/A</span>
          </td>
          <td>{{ formatShortDate(p.predicted_at) }}</td>
          <td>
            <button class="btn btn-primary btn-small" @click.prevent="goToDetail(p.id)">View</button>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="mt-4 pagination-container" v-if="pagination">
      <button v-if="pagination.current_page > 1" @click="fetchPredictions(pagination.current_page - 1)" class="btn btn-secondary btn-small">Previous</button>
      <span class="mx-3">Page {{ pagination.current_page }} of {{ pagination.last_page }}</span>
      <button v-if="pagination.current_page < pagination.last_page" @click="fetchPredictions(pagination.current_page + 1)" class="btn btn-secondary btn-small">Next</button>
    </div>
  </div>

  <div v-if="!loading && predictions.length === 0" class="p-4 text-muted">No predictions available.</div>
</div>
```

  </div>
</template>

<script setup>
import { ref, inject, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const residentAxios = inject('residentAxios');
const router = useRouter();

const predictions = ref([]);
const loading = ref(false);
const error = ref(null);
const pagination = ref(null);

const fetchPredictions = async (page = 1) => {
  loading.value = true;
  error.value = null;
  try {
    const res = await residentAxios.get('/disaster-predictions', { params: { page } });
    if (res.data && res.data.data) {
      predictions.value = res.data.data.map(normalizePrediction);
      pagination.value = {
        current_page: res.data.current_page,
        last_page: res.data.last_page,
        total: res.data.total,
      };
    } else if (Array.isArray(res.data)) {
      predictions.value = res.data.map(normalizePrediction);
      pagination.value = null;
    }
  } catch (e) {
    console.error('[Pred] Fetch error', e);
    error.value = 'Failed to load predictions.';
  } finally {
    loading.value = false;
  }
};

function normalizePrediction(p) {
  const disaster_type = p.disaster_type ?? p.disasterType ?? p.type ?? '';
  const risk_level = p.risk_level ?? p.riskLevel ?? p.risk ?? 0;
  return { ...p, disaster_type, risk_level };
}

const goToDetail = (id) => router.push({ path: `/resident_pages/disaster-predictions/${id}` });

const formatShortDate = (s) => {
  if (!s) return 'N/A';
  try { return new Date(s).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }); } catch { return s; }
};

const capitalize = (s) => s ? (s.charAt(0).toUpperCase() + s.slice(1)) : '';

const badgeClass = (lvl) => {
  if (lvl >= 8) return 'badge-critical';
  if (lvl >= 6) return 'badge-high';
  if (lvl >= 4) return 'badge-medium';
  return 'badge-low';
};

const riskFillClass = (lvl) => {
  if (lvl >= 8) return 'risk-bar-critical';
  if (lvl >= 6) return 'risk-bar-high';
  if (lvl >= 4) return 'risk-bar-medium';
  return 'risk-bar-low';
};

const rowClass = (lvl) => {
  if (lvl >= 8) return 'risk-row-critical';
  if (lvl >= 6) return 'risk-row-high';
  return 'risk-row-normal';
};

onMounted(() => fetchPredictions(1));
</script>

<style scoped>
.predictions-page {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: #f4f6fb;
}

.card {
  background: #fff;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 8px 25px rgba(0,0,0,0.08);
  transition: transform 0.2s, box-shadow 0.2s;
}
.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 30px rgba(0,0,0,0.12);
}
.card-header {
  font-weight: 700;
  font-size: 1.4rem;
  margin-bottom: 20px;
  color: #2a3f5f;
  border-left: 6px solid #667eea;
  padding-left: 12px;
}

.info-box {
  background: #fff8e1;
  border-left: 5px solid #ffc107;
  padding: 12px 15px;
  border-radius: 8px;
  font-size: 0.95rem;
}

.center { text-align:center; font-size:1.05rem; color:#4b5563; }
.error { color:#d32f2f; font-weight:600; }
.text-muted { color:#6b7280; font-size:0.875rem; }

.table-container { overflow-x:auto; margin-top: 1rem; }
.table { width:100%; border-collapse: collapse; min-width: 700px; }
.table th, .table td { padding: 12px 15px; text-align: left; border-bottom:1px solid #e2e8f0; }
.table th { background:#eef2f7; color:#2a3f5f; font-weight:600; text-transform: uppercase; }
.table tr:nth-child(even) { background:#f9fafc; }
.table tr:hover { background-color:#e6f0ff; transition:0.2s; }

.badge { padding:4px 10px; border-radius:12px; color:#fff; font-size:0.85rem; font-weight:500; }
.badge-info { background:#4f46e5; }
.badge-critical { background:#d32f2f; }
.badge-high { background:#f97316; }
.badge-medium { background:#fbbf24; }
.badge-low { background:#10b981; }

.risk-level-container { display:flex; flex-direction:column; }
.risk-bar-background { width:100%; background:#e5e7eb; border-radius:8px; height:8px; }
.risk-bar-fill { height:8px; border-radius:8px; }
.risk-bar-critical { background:#d32f2f; }
.risk-bar-high { background:#f97316; }
.risk-bar-medium { background:#fbbf24; }
.risk-bar-low { background:#10b981; }

.risk-row-critical { background: rgba(211, 47, 47, 0.08); }
.risk-row-high { background: rgba(249, 115, 22, 0.08); }
.risk-row-normal:hover { background: #e6f0ff; }

.btn { padding:6px 14px; border-radius:8px; color:#fff; background:#4f46e5; font-weight:500; cursor:pointer; transition: background 0.3s, transform 0.2s; }
.btn:hover { background:#3730a3; transform: translateY(-2px); }
.btn-small { font-size:0.85rem; padding:4px 10px; }

.pagination-container { display:flex; align-items:center; justify-content:center; margin-top:16px; gap:10px; }

@media(max-width:768px) { .table { min-width:100%; } }
</style>
