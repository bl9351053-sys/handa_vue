<template>
  <div class="container">
    <div class="header">
      <h1 class="title">🚨 Emergency Alerts</h1>
      <router-link to="/emergency-alerts/create" class="btn-create">+ Create Alert</router-link>
    </div>

    <div v-if="loading" class="loading">Loading alerts…</div>
    <div v-if="error" class="alert-error">{{ error }}</div>

    <div v-if="!loading && alerts.length > 0" class="alerts-grid">
      <div v-for="alert in alerts" :key="alert.id" class="alert-card" :class="alert.severity">
        <div class="alert-header">
          <h3>{{ alert.title }}</h3>
          <div class="alert-badges">
            <span class="badge severity" :class="alert.severity">{{ alert.severity.toUpperCase() }}</span>
            <span class="badge status" :class="alert.status">{{ alert.status.toUpperCase() }}</span>
          </div>
        </div>

        <div class="alert-content">
          <p class="description">{{ alert.description }}</p>
          <div class="alert-meta">
            <span class="area">📍 {{ alert.area }}</span>
            <span class="date">{{ formatDate(alert.created_at) }}</span>
          </div>
        </div>

        <div class="alert-actions">
          <router-link :to="`/emergency-alerts/${alert.id}`" class="btn-view">View</router-link>
          <router-link :to="`/emergency-alerts/${alert.id}/edit`" class="btn-edit">Edit</router-link>
        </div>
      </div>
    </div>

    <div v-if="!loading && alerts.length === 0" class="empty-state">
      <div class="empty-icon">🚨</div>
      <h3>No Emergency Alerts</h3>
      <p>Create your first emergency alert to get started.</p>
      <router-link to="/emergency-alerts/create" class="btn-create">Create Alert</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const alerts = ref([]);
const loading = ref(false);
const error = ref(null);

const loadAlerts = async () => {
  loading.value = true;
  error.value = null;
  try {
    const res = await axios.get('/emergency-alerts');
    alerts.value = res.data.alerts || res.data;
  } catch (e) {
    console.error(e);
    error.value = 'Failed to load emergency alerts';
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString();
};

onMounted(loadAlerts);
</script>

<style>
.container { max-width: 1200px; margin: 20px auto; padding: 0 16px; font-family: Arial, sans-serif; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.title { font-size: 28px; font-weight: bold; color: #333; }
.btn-create { padding: 10px 20px; background: #dc3545; color: white; border-radius: 6px; text-decoration: none; font-weight: 500; }
.btn-create:hover { background: #c82333; }
.loading { text-align: center; padding: 40px; color: #555; font-size: 18px; }
.alert-error { background: #ffe5e5; color: #b30000; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; }

.alerts-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; }
.alert-card { background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden; transition: transform 0.2s; }
.alert-card:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,0.15); }
.alert-card.high { border-left: 4px solid #dc3545; }
.alert-card.medium { border-left: 4px solid #ffc107; }
.alert-card.low { border-left: 4px solid #28a745; }

.alert-header { padding: 16px 20px; background: #f8f9fa; border-bottom: 1px solid #e9ecef; }
.alert-header h3 { margin: 0 0 8px 0; font-size: 18px; color: #333; }
.alert-badges { display: flex; gap: 8px; }
.badge { padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; text-transform: uppercase; }
.badge.severity.low { background: #28a745; color: white; }
.badge.severity.medium { background: #ffc107; color: #333; }
.badge.severity.high { background: #dc3545; color: white; }
.badge.status.active { background: #007bff; color: white; }
.badge.status.inactive { background: #6c757d; color: white; }

.alert-content { padding: 16px 20px; }
.description { margin: 0 0 12px 0; color: #555; line-height: 1.5; }
.alert-meta { display: flex; justify-content: space-between; font-size: 14px; color: #666; }
.area { font-weight: 500; }
.date { font-style: italic; }

.alert-actions { padding: 16px 20px; background: #f8f9fa; border-top: 1px solid #e9ecef; display: flex; gap: 10px; }
.btn-view { padding: 6px 12px; background: #007bff; color: white; border-radius: 4px; text-decoration: none; font-size: 14px; }
.btn-view:hover { background: #0056b3; }
.btn-edit { padding: 6px 12px; background: #ffc107; color: #333; border-radius: 4px; text-decoration: none; font-size: 14px; }
.btn-edit:hover { background: #e0a800; }

.empty-state { text-align: center; padding: 60px 20px; }
.empty-icon { font-size: 64px; margin-bottom: 20px; }
.empty-state h3 { font-size: 24px; color: #333; margin-bottom: 10px; }
.empty-state p { color: #666; margin-bottom: 20px; }

@media (max-width: 768px) {
  .alerts-grid { grid-template-columns: 1fr; }
  .header { flex-direction: column; gap: 15px; align-items: flex-start; }
  .alert-meta { flex-direction: column; gap: 4px; }
}
</style>
