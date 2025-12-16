<template>
  <div class="register-page">
    <div class="register-card">
      <div class="register-header">
        <h1>HANDA</h1>
        <p class="subtitle">Hazard Alert and Navigation for Disasters & Assistance</p>
        <h2>Create an Account</h2>
        <p class="instruction">Register to access the admin panel</p>
      </div>

      <div v-if="generalError" class="error-box">
        <p>{{ generalError }}</p>
      </div>

      <form @submit.prevent="submit" class="register-form">
        <div class="form-group">
          <label for="name">Name</label>
          <input id="name" v-model="form.name" required placeholder="Your full name" />
          <p v-if="errors.name" class="error-text">{{ errors.name }}</p>
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input id="email" type="email" v-model="form.email" placeholder="you@example.com" />
          <p v-if="errors.email" class="error-text">{{ errors.email }}</p>
        </div>

        <div class="form-group">
          <label for="gov_id">Government ID</label>
          <input id="gov_id" v-model="form.gov_id" required placeholder="123456789012" />
          <p v-if="errors.gov_id" class="error-text">{{ errors.gov_id }}</p>
        </div>

        <div class="form-group">
          <label for="phone_number">Phone Number</label>
          <input id="phone_number" v-model="form.phone_number" required placeholder="+63xxxxxxxxxx" />
          
          <p v-if="errors.phone_number" class="error-text">{{ errors.phone_number }}</p>
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input id="password" type="password" v-model="form.password" required placeholder="********" />
          <p v-if="errors.password" class="error-text">{{ errors.password }}</p>
        </div>

        <div class="form-group">
          <label for="password_confirmation">Confirm Password</label>
          <input id="password_confirmation" type="password" v-model="form.password_confirmation" required placeholder="********" />
        </div>

        <div class="form-extra">
          <label class="checkbox-label">
            <input type="checkbox" v-model="form.remember" />
            Keep me signed in
          </label>
        </div>

        <button type="submit" :disabled="submitting" class="btn-register">
          <span v-if="!submitting">Create Account</span>
          <span v-else>Creating...</span>
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
  name: '',
  email: '',
  gov_id: '',
  phone_number: '',
  password: '',
  password_confirmation: '',
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
    const payload = {
      name: form.name,
      email: form.email || null,
      gov_id: form.gov_id,
      phone_number: form.phone_number || null,
      password: form.password,
      password_confirmation: form.password_confirmation
    }

    const res = await axios.post((baseUrl || '') + '/register', payload)
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
      generalError.value = 'Registration failed. Please try again.'
    }
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
/* Page background */
.register-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #1e3a8a, #1e40af, #2563eb);
  padding: 50px 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* Card */
.register-card {
  width: 100%;
  max-width: 420px;
  background: rgba(255,255,255,0.95);
  border-radius: 20px;
  padding: 40px 30px;
  box-shadow: 0 15px 35px rgba(0,0,0,0.3);
}

/* Header */
.register-header h1 {
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
  margin-bottom: 15px;
}

.register-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  text-align: center;
  color: #111827;
  margin-bottom: 5px;
}

.instruction {
  font-size: 0.9rem;
  text-align: center;
  color: #6b7280;
  margin-bottom: 20px;
}

/* Form styles */
.register-form .form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
}

.register-form label {
  font-weight: 500;
  margin-bottom: 5px;
  color: #374151;
}

.register-form input {
  padding: 12px 15px;
  font-size: 1rem;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  outline: none;
  transition: all 0.2s ease-in-out;
}

.register-form input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
}

.hint-text {
  font-size: 0.8rem;
  color: #6b7280;
  margin-top: 2px;
}

/* Checkbox */
.form-extra {
  display: flex;
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

/* Buttons */
.btn-register {
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

.btn-register:hover {
  background: #1e40af;
}

.btn-register:disabled {
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
