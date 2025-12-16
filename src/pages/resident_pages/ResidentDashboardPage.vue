<template>
  <div class="dashboard-page">
    <div class="dashboard-header">
      <h1>Dashboard</h1>
      <p>Welcome, {{ userDisplayName }}!</p>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner-large"></div>
      <p>Loading dashboard...</p>
    </div>

    <div v-else-if="errorMessage" class="error-state">
      <div class="alert alert-error">
        <strong>Error:</strong> {{ errorMessage }}
      </div>
      <div class="error-actions">
        <button @click="fetchDashboard" class="btn btn-secondary">Retry</button>
        <button @click="useMockData" class="btn btn-secondary">Use sample data</button>
      </div>
    </div>

    <div v-else class="dashboard-content">
      <div class="stats-grid">
        <div class="stat-card blue">
          <div class="stat-icon">🏠</div>
          <div>
            <p class="stat-label">Evacuation Areas</p>
            <p class="stat-value">{{ dashboardData.total_evacuation_areas }}</p>
          </div>
        </div>

        <div class="stat-card purple">
          <div class="stat-icon">👨‍👩‍👧‍👦</div>
          <div>
            <p class="stat-label">Families Evacuated</p>
            <p class="stat-value">{{ dashboardData.families_evacuated }}</p>
          </div>
        </div>

        <div class="stat-card teal">
          <div class="stat-icon">👥</div>
          <div>
            <p class="stat-label">Total People</p>
            <p class="stat-value">{{ dashboardData.total_people }}</p>
          </div>
        </div>

        <div class="stat-card green">
          <div class="stat-icon">✅</div>
          <div>
            <p class="stat-label">Available Areas</p>
            <p class="stat-value">{{ dashboardData.available_areas }}</p>
          </div>
        </div>

        <div class="stat-card red">
          <div class="stat-icon">❌</div>
          <div>
            <p class="stat-label">Full Areas</p>
            <p class="stat-value">{{ dashboardData.full_areas }}</p>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>Emergency Alerts</h2>
        <div v-if="dashboardData.emergency_alerts.length" class="alerts-list">
          <div v-for="alert in dashboardData.emergency_alerts.slice(0,3)" :key="alert.id" class="alert-item">
            <div class="severity-bar" :class="`sev-${alert.severity || 'medium'}`"></div>
            <div>
              <h4>{{ alert.title }}</h4>
              <p>{{ alert.description }}</p>
              <span>{{ formatDate(alert.created_at) }}</span>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">No emergency alerts</div>
      </div>

      <div class="section">
        <h2>Recent Disaster Updates</h2>
        <div v-if="dashboardData.recent_disaster_updates.length" class="list">
          <div v-for="update in dashboardData.recent_disaster_updates.slice(0,3)" :key="update.id" class="list-item green-border">
            <h4>{{ update.title }}</h4>
            <p>{{ update.description }}</p>
            <span>{{ formatDate(update.created_at) }}</span>
          </div>
          <button v-if="dashboardData.recent_disaster_updates.length > 3" @click="viewAllUpdates" class="btn btn-primary">View All</button>
        </div>
        <div v-else class="empty-state">No recent disaster updates</div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { residentDashboardService, residentEmergencyAlertsService, residentPredictionsService } from '../../services/residentService'

const router = useRouter()
const loading = ref(false)
const errorMessage = ref('')
const userDisplayName = ref('Resident')

const dashboardData = reactive({
  total_evacuation_areas: 0,
  families_evacuated: 0,
  total_people: 0,
  available_areas: 0,
  full_areas: 0,
  emergency_alerts: [],
  recent_disaster_updates: [],
  active_predictions: []
})

onMounted(() => {
  const user = JSON.parse(localStorage.getItem('resident_user') || '{}')
  userDisplayName.value = user.name || 'Resident'
  fetchDashboard()
})

const fetchDashboard = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const d = (await residentDashboardService.getDashboard()).data
    dashboardData.total_evacuation_areas = d.totalEvacuationAreas || 0
    dashboardData.families_evacuated = d.totalFamilies || 0
    dashboardData.total_people = d.totalPeople || 0
    dashboardData.available_areas = d.availableAreas || 0
    dashboardData.full_areas = d.fullAreas || 0
    dashboardData.recent_disaster_updates = d.recentUpdates || []

    dashboardData.emergency_alerts = (await residentEmergencyAlertsService.getEmergencyAlerts()).data.alerts || []
    dashboardData.active_predictions = (await residentPredictionsService.getDisasterPredictions()).data.predictions || []
  } catch {
    errorMessage.value = 'Failed to load dashboard data'
  } finally {
    loading.value = false
  }
}

const useMockData = () => {
  dashboardData.emergency_alerts = [{ id:1, title:'Typhoon Warning', description:'Severe typhoon expected', severity:'high', created_at:new Date() }]
}

const formatDate = d => new Date(d).toLocaleString()
const viewAllUpdates = () => router.push({ name:'ResidentDisasterUpdates' })

</script>

<style scoped>
.dashboard-page {
  padding: 32px;
  margin-left: 250px;
  min-height: 100vh;
  background: #f7f8fb;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  color: #1f2937;
}

.dashboard-header h1 {
  font-size: 30px;
  font-weight: 700;
}

.dashboard-header p {
  color: #6b7280;
  margin-top: 4px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 18px;
  margin-top: 24px;
}

.stat-card {
  background: #ffffff;
  padding: 18px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  border: 1px solid #eef0f4;
  transition: 0.25s ease;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.08);
}

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.blue .stat-icon {
  background: #eef2ff;
  color: #4338ca;
}

.purple .stat-icon {
  background: #f3e8ff;
  color: #6b21a8;
}

.teal .stat-icon {
  background: #ecfeff;
  color: #0f766e;
}

.green .stat-icon {
  background: #ecfdf5;
  color: #047857;
}

.red .stat-icon {
  background: #fef2f2;
  color: #991b1b;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
  text-transform: uppercase;
}

.stat-value {
  font-size: 26px;
  font-weight: 700;
  margin-top: 2px;
}

.section {
  background: #ffffff;
  margin-top: 28px;
  padding: 22px;
  border-radius: 18px;
  border: 1px solid #eef0f4;
}

.section h2 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
}

.alert-item {
  display: flex;
  gap: 14px;
  padding: 14px;
  border-radius: 14px;
  background: #fafafa;
  margin-bottom: 12px;
  border: 1px solid #f0f0f0;
}

.severity-bar {
  width: 6px;
  border-radius: 6px;
}

.sev-high {
  background: #ef4444;
}

.sev-medium {
  background: #f59e0b;
}

.sev-low {
  background: #22c55e;
}

.alert-item h4 {
  font-size: 15px;
  font-weight: 600;
}

.alert-item p {
  font-size: 13px;
  color: #4b5563;
  margin: 4px 0;
}

.alert-item span {
  font-size: 11px;
  color: #9ca3af;
}

.list-item {
  padding: 14px;
  border-radius: 14px;
  background: #fafafa;
  margin-bottom: 12px;
  border: 1px solid #f0f0f0;
}

.green-border {
  border-left: 4px solid #22c55e;
}

.yellow-border {
  border-left: 4px solid #f59e0b;
}

.list-item h4 {
  font-size: 15px;
  font-weight: 600;
}

.list-item p {
  font-size: 13px;
  color: #4b5563;
  margin: 4px 0;
}

.list-item span {
  font-size: 11px;
  color: #9ca3af;
}

.btn {
  margin-top: 12px;
  padding: 10px 18px;
  border-radius: 12px;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary {
  background: #2563eb;
  color: white;
}

.btn-primary:hover {
  background: #1d4ed8;
}

.btn-secondary {
  background: #e5e7eb;
  color: #374151;
}

.loading-state {
  text-align: center;
  padding: 80px;
  color: #6b7280;
}

.spinner-large {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 4px solid #e5e7eb;
  border-top-color: #2563eb;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-state {
  text-align: center;
  color: #9ca3af;
  padding: 24px;
}

@media (max-width: 1000px) {
  .dashboard-page {
    margin-left: 0;
  }
}

</style>
