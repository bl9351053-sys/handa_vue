<template>
  <div class="emergency-alerts">
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Loading alerts...</p>
    </div>

    <div v-else-if="error" class="error">
      <p>⚠️ Error loading alerts: {{ error }}</p>
    </div>

    <div v-else-if="alerts.length === 0" class="no-alerts">
      <p>✅ No alerts at the moment</p>
    </div>

    <div v-else class="alerts-container">
      <div v-for="alert in alerts" :key="alert.id" class="alert-card" :class="`severity-${alert.severity}`">
        <div class="alert-header">
          <h3 class="alert-title">{{ alert.title }}</h3>
          <span class="alert-severity" :class="`severity-${alert.severity}`">{{ alert.severity }}</span>
        </div>
        <p class="alert-description">{{ alert.description }}</p>
        <div class="alert-footer">
          <span class="alert-area">{{ alert.area }}</span>
          <span class="alert-time">{{ formatDate(alert.created_at) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, inject } from 'vue';
import axios from 'axios';

const alerts = ref([]);
const loading = ref(true);
const error = ref(null);
let intervalId = null;

const residentAxios = inject('residentAxios', null);

const fetchAlerts = async () => {
  try {
    loading.value = true;
    error.value = null;
    const http = residentAxios || axios;
    const response = await http.get('/emergency-alerts');
    // Sort by created_at descending
    alerts.value = (response.data.alerts || []).sort((a, b) =>
      new Date(b.created_at) - new Date(a.created_at)
    );
  } catch (err) {
    error.value = err.message || 'Failed to fetch alerts';
    console.error('Error fetching emergency alerts:', err);
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleString();
  } catch {
    return dateString;
  }
};

onMounted(() => {
  fetchAlerts();
  // Update every 60 seconds
  intervalId = setInterval(fetchAlerts, 60000);
});

onBeforeUnmount(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
});
</script>

<style scoped>
.emergency-alerts {
  margin-bottom: 2rem;
  padding: 1rem;
  animation: fadeIn 0.4s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Loading */
.loading {
  text-align: center;
  padding: 2rem;
  color: #444;
}

.spinner {
  border: 5px solid #e6e6e6;
  border-top: 5px solid #2575fc;
  border-radius: 50%;
  width: 45px;
  height: 45px;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Error */
.error {
  background: #ffe6e6;
  border-left: 6px solid #ff4d4d;
  padding: 1rem;
  border-radius: 10px;
  color: #991f1f;
  font-weight: 500;
}

/* No Alerts */
.no-alerts {
  background: #e7ffe7;
  border-left: 6px solid #2ecc71;
  padding: 1rem;
  border-radius: 10px;
  color: #145a32;
  font-weight: 500;
}

/* Alert Cards */
.alerts-container {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.alert-card {
  background: white;
  border-radius: 14px;
  padding: 1.5rem;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
  border-left: 6px solid #ccc;
  transition: 0.2s ease;
  position: relative;
}

.alert-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.12);
}

/* Severity Border Colors */
.alert-card.severity-high {
  border-left-color: #e74c3c;
}

.alert-card.severity-medium {
  border-left-color: #f39c12;
}

.alert-card.severity-low {
  border-left-color: #27ae60;
}

/* Header */
.alert-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.alert-title {
  font-size: 1.35rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

/* Severity Label */
.alert-severity {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: white;
}

.alert-severity.severity-high {
  background: #e74c3c;
}

.alert-severity.severity-medium {
  background: #f39c12;
}

.alert-severity.severity-low {
  background: #27ae60;
}

/* Description */
.alert-description {
  color: #555;
  margin-bottom: 1rem;
  line-height: 1.55;
  font-size: 0.98rem;
}

/* Footer */
.alert-footer {
  display: flex;
  justify-content: space-between;
  color: #777;
  font-size: 0.85rem;
  font-weight: 500;
}

.alert-area::before {
  content: "📍 ";
}

.alert-time::before {
  content: "⏱ ";
}

/* Responsive */
@media (max-width: 768px) {
  .alert-card {
    padding: 1.2rem;
  }

  .alert-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.4rem;
  }

  .alert-footer {
    flex-direction: column;
    gap: 0.3rem;
  }
}

</style>
