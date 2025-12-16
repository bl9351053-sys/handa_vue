<template>
  <div class="updates-container">

    <div class="header-row">
      <h1 class="header-title">🚨 Disaster Updates</h1>
    </div>

    <div v-if="loading" class="loading">Loading disaster updates...</div>

    <div v-if="error" class="error-box">{{ error }}</div>

    <div v-if="!loading && !error && (!updates || updates.length === 0)" class="empty">
      No disaster updates available.
    </div>

    <div v-if="!loading && !error && updates && updates.length > 0" class="updates-list">

      <div 
        v-for="update in updates"
        :key="update.id"
        class="update-card"
        :class="update.severity"
        @click="goToDetail(update.id)"
      >

        <div class="update-header">
          <h3 class="update-title">{{ update.title }}</h3>

          <span class="badge" :class="update.severity || ''">
            {{ ucfirst(update.severity) }}
          </span>

          <span class="badge gray">
            {{ ucfirst(update.disaster_type) }}
          </span>
        </div>

        <p class="update-info">
          {{ update.source }} • {{ formatDate(update.issued_at) }}
          ({{ getTimeAgo(update.issued_at) }})
        </p>

        <p class="update-desc">{{ update.description }}</p>

        <button 
          @click.stop="goToDetail(update.id)"
          class="btn btn-blue btn-sm"
        >
          View Details
        </button>

      </div>
    </div>

    <div v-if="pagination" class="pagination">
      <button 
        v-if="pagination.current_page > 1"
        @click="fetchUpdates(pagination.current_page - 1)"
        class="btn btn-gray"
      >
        Previous
      </button>

      <span class="page-info">
        Page {{ pagination.current_page }} of {{ pagination.last_page }}
      </span>

      <button 
        v-if="pagination.current_page < pagination.last_page"
        @click="fetchUpdates(pagination.current_page + 1)"
        class="btn btn-gray"
      >
        Next
      </button>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { residentUpdatesService } from '../../services/residentService'

const router = useRouter()

const updates = ref([])
const loading = ref(false)
const error = ref(null)
const pagination = ref(null)

const fetchUpdates = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await residentUpdatesService.getDisasterUpdates()
    updates.value = response.data.data || response.data || []
    pagination.value = response.data.current_page
      ? {
          current_page: response.data.current_page,
          last_page: response.data.last_page
        }
      : null
  } catch (err) {
    error.value = 'Failed to load disaster updates.'
    updates.value = []
  } finally {
    loading.value = false
  }
}

const goToDetail = (id) => {
  router.push(`/resident_pages/disaster-updates/${id}`)
}

const formatDate = (d) => new Date(d).toLocaleString()

const getTimeAgo = (d) => {
  const seconds = (new Date() - new Date(d)) / 1000
  if (seconds < 60) return `${Math.floor(seconds)}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

const ucfirst = (s) => {
  const str = s || ''
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : ''
}

onMounted(fetchUpdates)
</script>

<style>
.updates-container {
  padding: 24px;
  min-height: 100vh;
  background: #f4f6fb;
  font-family: "Segoe UI", system-ui, sans-serif;
  color: #1f2937;
}

.header-title {
  font-size: 30px;
  font-weight: 800;
}

.updates-list {
  margin-top: 24px;
  display: grid;
  gap: 18px;
}

.update-card {
  position: relative;
  padding: 20px;
  border-radius: 18px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  box-shadow: 0 12px 30px rgba(0,0,0,0.08);
  transition: 0.3s ease;
  cursor: pointer;
  overflow: hidden;
}

.update-card::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  width: 6px;
  height: 100%;
  background: #cbd5e1;
}

.update-card:hover {
  transform: translateY(-6px) scale(1.01);
  box-shadow: 0 20px 45px rgba(0,0,0,0.15);
}

.update-card.critical {
  background: linear-gradient(135deg, #fff5f5, #ffffff);
}

.update-card.critical::before {
  background: #ef4444;
}

.update-card.high {
  background: linear-gradient(135deg, #fff7ed, #ffffff);
}

.update-card.high::before {
  background: #f97316;
}

.update-card.moderate {
  background: linear-gradient(135deg, #fffbeb, #ffffff);
}

.update-card.moderate::before {
  background: #facc15;
}

.update-card.low {
  background: linear-gradient(135deg, #eff6ff, #ffffff);
}

.update-card.low::before {
  background: #3b82f6;
}

.update-header {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.update-title {
  font-size: 19px;
  font-weight: 700;
  flex: 1;
}

.badge {
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}

.badge.critical {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

.badge.high {
  background: linear-gradient(135deg, #f97316, #ea580c);
  color: white;
}

.badge.moderate {
  background: linear-gradient(135deg, #facc15, #eab308);
  color: #422006;
}

.badge.low {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
}

.badge.gray {
  background: #e5e7eb;
  color: #374151;
}

.update-info {
  font-size: 13px;
  color: #6b7280;
  margin: 8px 0;
}

.update-desc {
  margin: 12px 0 16px;
  color: #374151;
  line-height: 1.6;
}

.btn {
  padding: 10px 16px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: 0.25s ease;
}

.btn-sm {
  padding: 8px 14px;
}

.btn-blue {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
}

.btn-blue:hover {
  transform: scale(1.05);
  box-shadow: 0 10px 22px rgba(37,99,235,0.35);
}

.btn-gray {
  background: #e5e7eb;
  color: #374151;
}

.btn-gray:hover {
  background: #d1d5db;
}

.pagination {
  margin-top: 28px;
  display: flex;
  justify-content: center;
  gap: 12px;
}

.page-info {
  font-size: 14px;
  color: #4b5563;
}

.loading,
.empty {
  text-align: center;
  padding: 30px;
  color: #6b7280;
}

.error-box {
  background: linear-gradient(135deg, #fee2e2, #fecaca);
  border: 1px solid #fca5a5;
  padding: 14px;
  border-radius: 14px;
  color: #991b1b;
}
</style>
