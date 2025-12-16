<template>
  <div class="settings-page">
    <div class="container">
      <h1 class="page-title">User Settings</h1>

      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Loading user information...</p>
      </div>

      <div v-else-if="error" class="error">
        <p>{{ error }}</p>
        <button @click="fetchUserInfo" class="retry-btn">Retry</button>
      </div>

      <div v-else-if="user" class="user-info-card">
        <div class="card-header">
          <h2>User Information</h2>
        </div>

        <div class="card-body">
          <div class="info-row">
            <label>Name:</label>
            <span>{{ user.name }}</span>
          </div>

          <div class="info-row" v-if="user.email">
            <label>Email:</label>
            <span>{{ user.email }}</span>
          </div>

          <div class="info-row" v-if="user.gov_id">
            <label>Government ID:</label>
            <span>{{ user.gov_id }}</span>
          </div>

          <div class="info-row" v-if="user.phone_number">
            <label>Phone Number:</label>
            <span>{{ user.phone_number }}</span>
          </div>

          <div class="info-row">
            <label>Registration Date:</label>
            <span>{{ formatDate(user.created_at) }}</span>
          </div>

          <div class="info-row">
            <label>Last Updated:</label>
            <span>{{ formatDate(user.updated_at) }}</span>
          </div>
        </div>

        <div class="card-actions">
          <button @click="$router.push({ name: 'LoginHistory' })" class="action-btn primary">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            View Login History
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AuthService from '../services/AuthService.js'

const user = ref(null)
const loading = ref(true)
const error = ref(null)

const fetchUserInfo = async () => {
  try {
    loading.value = true
    error.value = null
    const response = await AuthService.get('/user')
    user.value = response.data
  } catch (err) {
    console.error('Failed to fetch user info:', err)
    error.value = 'Failed to load user information. Please try again.'
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  fetchUserInfo()
})
</script>

<style scoped>
.settings-page {
  padding: 20px;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.container {
  max-width: 800px;
  margin: 0 auto;
}

.page-title {
  color: #333;
  margin-bottom: 30px;
  font-size: 2rem;
  font-weight: bold;
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

.user-info-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  background: linear-gradient(135deg, #4f46e5, #6366f1);
  color: white;
  padding: 20px;
}

.card-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.card-body {
  padding: 30px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #e5e7eb;
}

.info-row:last-child {
  border-bottom: none;
}

.info-row label {
  font-weight: 600;
  color: #374151;
  min-width: 150px;
}

.info-row span {
  color: #6b7280;
  text-align: right;
}

.card-actions {
  padding: 20px 30px;
  background-color: #f9fafb;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.action-btn.primary {
  background-color: #4f46e5;
  color: white;
}

.action-btn.primary:hover {
  background-color: #3730a3;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
}

.action-btn svg {
  width: 18px;
  height: 18px;
}

@media (max-width: 768px) {
  .settings-page {
    padding: 10px;
  }

  .info-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }

  .info-row span {
    text-align: left;
  }

  .card-actions {
    padding: 15px 20px;
    justify-content: center;
  }

  .action-btn {
    padding: 10px 20px;
    font-size: 13px;
  }
}
</style>
