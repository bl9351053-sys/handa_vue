<template>
  <div class="resident-dashboard">
    <header class="header">
      <h1>Dashboard</h1>
      
    </header>

    <div v-if="loading" class="center">Loading dashboard…</div>
    <div v-else-if="error" class="center error">Error: {{ error }}</div>

    <div v-else>
      <!-- Overview Stats -->
      <div class="card overview-card">
        <div class="card-header">📊 Dashboard Overview</div>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">🏢</div>
            <div class="stat-info">
              <h3>{{ data.totalEvacuationAreas ?? 0 }}</h3>
              <p>Total Evacuation Areas</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">👨‍👩‍👧‍👦</div>
            <div class="stat-info">
              <h3>{{ data.totalFamilies ?? 0 }}</h3>
              <p>Families Evacuated</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">👥</div>
            <div class="stat-info">
              <h3>{{ data.totalPeople ?? 0 }}</h3>
              <p>Total People</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">✅</div>
            <div class="stat-info">
              <h3>{{ data.availableAreas ?? 0 }}</h3>
              <p>Available Areas</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🚫</div>
            <div class="stat-info">
              <h3>{{ data.fullAreas ?? 0 }}</h3>
              <p>Full Areas</p>
            </div>
          </div>
        </div>
      </div>

         <EmergencyAlerts />

      <!-- Two Columns: Recent Updates & Active Predictions -->
      <section class="two-col">
        <div class="card">
          <div class="card-header">🚨 Recent Disaster Updates</div>
          <div v-if="(data.recentUpdates || []).length === 0" class="muted">No recent disaster updates.</div>
          <ul v-else class="list">
            <li v-for="update in (data.recentUpdates || []).slice(0, 3)" :key="update.id">
              <strong>{{ update.disaster_type ?? 'Update' }}</strong>
              <div class="muted">{{ formatDate(update.issued_at) }} — {{ update.summary ?? (update.description ?? '') }}</div>
            </li>
          </ul>
          <router-link :to="{ name: 'ResidentDisasterUpdates' }" class="btn btn-primary full-width">View All Updates</router-link>
        </div>

        <div class="card">
          <div class="card-header">🔮 Active Disaster</div>
          <div v-if="(data.activePredictions || []).length === 0" class="muted">No active predictions.</div>
          <ul v-else class="list">
            <li v-for="pred in (data.activePredictions || []).slice(0, 3)" :key="pred.id">
              <strong>{{ pred.disaster_type ?? 'Prediction' }} — Risk {{ pred.risk_level ?? '-' }}</strong>
              <div class="muted">Issued: {{ formatDate(pred.issued_at ?? pred.created_at) }}</div>
            </li>
          </ul>
          <router-link :to="{ name: 'ResidentDisasterPredictions' }" class="btn btn-primary full-width">View All Predictions</router-link>
        </div>
      </section>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, inject } from 'vue';
import axios from 'axios';
import EmergencyAlerts from '../../components/resident_components/EmergencyAlerts.vue';

const loading = ref(true);
const error = ref(null);
const data = ref({});

const residentAxios = inject('residentAxios', null);
const injectedAdminBase = inject('baseUrl', null);

function formatDate(d) {
  if (!d) return '';
  try { return new Date(d).toLocaleString(); } 
  catch { return d; }
}

async function fetchDashboard() {
  loading.value = true;
  error.value = null;
  try {
    const http = residentAxios || axios;
    const url = residentAxios ? '/dashboard' : (injectedAdminBase || 'http://127.0.0.1:8000/api') + '/dashboard';
    const res = await http.get(url);
    data.value = res.data || {};
  } catch (e) { error.value = e.message || 'Failed to fetch'; }
  finally { loading.value = false; }
}

function handleRefresh() { fetchDashboard(); }

onMounted(() => {
  fetchDashboard();
  window.addEventListener('resident-dashboard-refresh', handleRefresh);
});

onBeforeUnmount(() => {
  window.removeEventListener('resident-dashboard-refresh', handleRefresh);
});
</script>

<style scoped>
/* Container */
.resident-dashboard {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
}
.header h1 { margin: 0 0 0.25rem 0; font-size: 2rem; }
.subtitle { color: #666; margin-bottom: 1.5rem; }
.center { text-align: center; padding: 2rem 0; font-size: 1.1rem; }
.error { color: #b00020; }

/* Card */
.card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.08);
  margin-bottom: 1.5rem;
  transition: transform 0.2s, box-shadow 0.2s;
}
.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.12);
}
.card-header {
  font-weight: 600;
  margin-bottom: 15px;
  font-size: 1.1rem;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px,1fr));
  gap: 1rem;
}
.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 18px 12px;
  border-radius: 12px;
  background: linear-gradient(135deg,#f5f7fa,#e0eafc);
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  transition: transform 0.2s;
}
.stat-card:hover { transform: translateY(-3px); }
.stat-icon { font-size: 2rem; margin-bottom: 8px; }
.stat-info h3 { margin: 0; font-size: 1.5rem; font-weight: 700; }
.stat-info p { margin: 4px 0 0 0; font-size: 0.9rem; color: #555; }

/* Two Column Section */
.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}
@media(max-width: 900px) { .two-col { grid-template-columns: 1fr; } }

/* List Styling */
.list { list-style: none; padding: 0; margin: 0; }
.list li { padding: 0.6rem 0; border-bottom: 1px solid #eee; }
.muted { color: #666; font-size: 0.875rem; margin-top: 2px; }

/* Buttons */
.btn { display: inline-block; padding: 10px 18px; border-radius: 8px; text-decoration: none; text-align: center; font-weight: 500; transition: background 0.3s; }
.btn-primary { background-color: #007bff; color: #fff; }
.btn-primary:hover { background-color: #0069d9; }
.full-width { width: 100%; margin-top: 12px; }

/* Responsive */
@media(max-width: 500px){
  .stat-card { padding: 16px 10px; }
  .stat-info h3 { font-size: 1.25rem; }
}
</style>
