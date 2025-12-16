<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <h1>HANDA</h1>
        <p class="subtitle">Hazard Alert and Navigation for Disasters & Assistance</p>
        <h2>Sign in to System‑E</h2>
        <p class="instruction">Enter your credentials to access the admin panel</p>
      </div>

      <div v-if="generalError" class="error-box">
        <p>{{ generalError }}</p>
      </div>

      <form @submit.prevent="submit" class="login-form">
        <div class="form-group">
          <label for="email">Email</label>
          <input id="email" name="email" type="email" v-model="form.email" placeholder="you@example.com" />
          <p v-if="errors.email" class="error-text">{{ errors.email }}</p>
        </div>

        <div class="form-group">
          <label for="gov_id">Government ID</label>
          <input id="gov_id" name="gov_id" v-model="form.gov_id" placeholder="123456789012" />
          <p v-if="errors.gov_id" class="error-text">{{ errors.gov_id }}</p>
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input id="password" type="password" name="password" v-model="form.password" placeholder="********" />
          <p v-if="errors.password" class="error-text">{{ errors.password }}</p>
        </div>

        <div class="form-extra">
          <label class="checkbox-label">
            <input type="checkbox" v-model="form.remember" />
            Remember me
          </label>
          <router-link to="/register" class="register-link">Create account</router-link>
        </div>

        <button type="submit" :disabled="submitting" class="btn-login">
          <span v-if="!submitting">Sign In</span>
          <span v-else>Loading...</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, inject } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const baseUrl = inject('baseUrl', '')

const form = reactive({
  email: '',
  gov_id: '',
  password: '',
  remember: false
})

const errors = reactive({})
const generalError = ref('')
const submitting = ref(false)

async function submit() {
  submitting.value = true
  generalError.value = ''
  Object.keys(errors).forEach(k => delete errors[k])

  try {
    const payload = {}
    const emailVal = (form.email || '').toString().trim()
    const govRaw = (form.gov_id || '').toString()
    const govDigits = govRaw.replace(/\D/g, '')

    if (!emailVal && !govDigits) {
      generalError.value = 'Please enter either Email or Government ID.'
      submitting.value = false
      return
    }

    if (govDigits) {
      if (govDigits.length !== 12) {
        errors.gov_id = 'Government ID must be 12 digits.'
        submitting.value = false
        return
      }
      payload.gov_id = govDigits
    } else if (emailVal) {
      payload.email = emailVal
    }
    payload.password = form.password
    payload.remember = form.remember

    const res = await axios.post((baseUrl || '') + '/login', payload)
    const token = res.data?.access_token || null
    if (token) {
      localStorage.setItem('token', token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }

    router.push({ name: 'Dashboard' })
  } catch (err) {
    if (err.response && err.response.status === 422) {
      const respErrors = err.response.data.errors || {}
      Object.assign(errors, respErrors)
    } else if (err.response && err.response.data && err.response.data.message) {
      generalError.value = err.response.data.message
    } else {
      generalError.value = 'Login failed. Please try again.'
    }
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
/* Page background */
.login-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background: linear-gradient(135deg, #1e3a8a, #2563eb);
  padding: 50px 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* Login card */
.login-card {
  width: 100%;
  max-width: 400px;
  background: #fff;
  border-radius: 20px;
  padding: 40px 30px;
  box-shadow: 0 15px 35px rgba(0,0,0,0.3);
}

/* Header */
.login-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #1e40af;
  text-align: center;
  margin-bottom: 5px;
}

.subtitle {
  text-align: center;
  font-size: 0.9rem;
  color: #4b5563;
  margin-bottom: 20px;
}

.login-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  text-align: center;
  margin-bottom: 5px;
}

.instruction {
  text-align: center;
  font-size: 0.9rem;
  color: #6b7280;
  margin-bottom: 20px;
}

/* Form styles */
.login-form .form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
}

.login-form label {
  font-weight: 500;
  margin-bottom: 5px;
  color: #374151;
}

.login-form input {
  padding: 12px 15px;
  font-size: 1rem;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  outline: none;
  transition: all 0.2s ease-in-out;
}

.login-form input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
}

/* Extra options */
.form-extra {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.9rem;
  color: #374151;
}

.register-link {
  font-size: 0.9rem;
  color: #2563eb;
  text-decoration: none;
}

.register-link:hover {
  text-decoration: underline;
}

/* Buttons */
.btn-login {
  width: 100%;
  padding: 12px;
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  background: #2563eb;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
}

.btn-login:hover {
  background: #1e40af;
}

.btn-login:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Errors */
.error-box {
  background-color: #fee2e2;
  color: #b91c1c;
  border-left: 4px solid #b91c1c;
  padding: 10px 15px;
  border-radius: 5px;
  margin-bottom: 15px;
}

.error-text {
  font-size: 0.85rem;
  color: #b91c1c;
  margin-top: 3px;
}
</style>
