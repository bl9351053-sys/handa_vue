<template>
  <div class="login-history-page">
    <div class="container">
      <div class="header">
        <button @click="$router.go(-1)" class="back-btn">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Settings
        </button>
        <h1 class="page-title">Login History</h1>
      </div>

      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Loading login history...</p>
      </div>

      <div v-else-if="error" class="error">
        <p>{{ error }}</p>
        <button @click="fetchLoginHistory" class="retry-btn">Retry</button>
      </div>

      <div v-else-if="loginHistory.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3>No Login History</h3>
        <p>Your login history will appear here.</p>
      </div>

      <div v-else class="history-container">
        <div class="history-stats">
          <div class="stat-card">
            <div class="stat-number">{{ loginHistory.length }}</div>
            <div class="stat-label">Total Logins</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ successfulLogins }}</div>
            <div class="stat-label">Successful</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ failedLogins }}</div>
            <div class="stat-label">Failed</div>
          </div>
        </div>

        <div class="history-list">
          <div class="history-header">
            <h2>Recent Login Activity</h2>
          </div>

          <div class="history-items">
            <div
              v-for="login in loginHistory"
              :key="login.id"
              class="history-item"
              :class="{ 'failed': !login.success }"
            >
              <div class="login-icon">
                <svg v-if="login.success" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>

              <div class="login-details">
                <div class="login-status">
                  <span class="status-badge" :class="{ 'success': login.success, 'failed': !login.success }">
                    {{ login.success ? 'Successful' : 'Failed' }}
                  </span>
                </div>
                <div class="login-time">{{ formatDateTime(login.created_at) }}</div>
                <div class="login-info">
                  <span v-if="login.ip_address">IP: {{ login.ip_address }}</span>
                  <span v-if="login.user_agent && login.user_agent.length > 50">
                    {{ login.user_agent.substring(0, 50) }}...
                  </span>
                  <span v-else-if="login.user_agent">{{ login.user_agent }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import AuthService from '../services/AuthService.js'

const loginHistory = ref([])
const loading = ref(true)
const error = ref(null)

const successfulLogins = computed(() => {
  return loginHistory.value.filter(login => login.success).length
})

const failedLogins = computed(() => {
  return loginHistory.value.filter(login => !login.success).length
})

const fetchLoginHistory = async () => {
  try {
    loading.value = true
    error.value = null
    const response = await AuthService.get('/login-history')
    loginHistory.value = response.data
  } catch (err) {
    console.error('Failed to fetch login history:', err)
    error.value = 'Failed to load login history. Please try again.'
  } finally {
    loading.value = false
  }
}

const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))

  if (diffInHours < 1) {
    return 'Just now'
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
  } else {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
}

onMounted(() => {
  fetchLoginHistory()
})
</script>

<style scoped>
.login-history-page {
  padding: 20px;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
}

.header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  color: #374151;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
}

.back-btn:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.back-btn svg {
  width: 16px;
  height: 16px;
}

.page-title {
  color: #333;
  font-size: 2rem;
  font-weight: bold;
  margin: 0;
}

.loading {
  text-align: center;
  padding: 50px;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4f46e5;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  background-color: #fee;
  border: 1px solid #fcc;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  color: #c33;
}

.retry-btn {
  background-color: #4f46e5;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;
}

.retry-btn:hover {
  background-color: #3730a3;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.empty-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 20px;
  color: #9ca3af;
}

.empty-icon svg {
  width: 100%;
  height: 100%;
}

.empty-state h3 {
  color: #374151;
  margin-bottom: 10px;
}

.empty-state p {
  color: #6b7280;
}

.history-container {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.history-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.stat-number {
  font-size: 2.5rem;
  font-weight: bold;
  color: #4f46e5;
  margin-bottom: 8px;
}

.stat-label {
  color: #6b7280;
  font-weight: 500;
}

.history-list {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.history-header {
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #4f46e5, #6366f1);
  color: white;
}

.history-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.history-items {
  max-height: 600px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.2s ease;
}

.history-item:hover {
  background-color: #f9fafb;
}

.history-item.failed {
  background-color: #fef2f2;
}

.history-item.failed:hover {
  background-color: #fee2e2;
}

.login-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  flex-shrink: 0;
}

.history-item:not(.failed) .login-icon {
  background-color: #d1fae5;
  color: #065f46;
}

.history-item.failed .login-icon {
  background-color: #fee2e2;
  color: #dc2626;
}

.login-icon svg {
  width: 20px;
  height: 20px;
}

.login-details {
  flex: 1;
}

.login-status {
  margin-bottom: 4px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-badge.success {
  background-color: #d1fae5;
  color: #065f46;
}

.status-badge.failed {
  background-color: #fee2e2;
  color: #dc2626;
}

.login-time {
  font-weight: 600;
  color: #374151;
  margin-bottom: 4px;
}

.login-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 0.875rem;
  color: #6b7280;
}

@media (max-width: 768px) {
  .login-history-page {
    padding: 10px;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .history-stats {
    grid-template-columns: 1fr;
  }

  .history-item {
    padding: 16px;
  }

  .login-details {
    flex: 1;
  }

  .login-info {
    font-size: 0.8rem;
  }
}
</style>
