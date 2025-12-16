<template>
  <div class="register-family">
    <div class="header-controls">
      <router-link :to="`/resident_pages/evacuation-areas/${id}`" class="btn btn-secondary">← Back to Area</router-link>
    </div>

    <div class="card">
      <div class="card-header">👥 Register My Family</div>
      <div class="card-body">
        <div v-if="!id" class="alert alert-danger" style="margin-bottom: 1rem;">
          ⚠️ <strong>Debug:</strong> No evacuation area ID found in route params. Route params: {{ JSON.stringify(route.params) }}
        </div>

        <p class="intro-text">Please provide your family information to register at this evacuation area.</p>

        <!-- Success Message -->
        <div v-if="successMessage" class="success-msg">
          ✅ {{ successMessage }}
        </div>

        <!-- Server Error -->
        <div v-if="serverError" class="error-box">
          ❌ {{ serverError }}
        </div>

        <!-- Registration Form -->
        <form @submit.prevent="submit" class="form">
          <div class="form-row">
            <label for="family_head_name">Family Head Name *</label>
            <input 
              id="family_head_name"
              v-model="form.family_head_name" 
              type="text"
              placeholder="e.g., Juan Dela Cruz"
              required
            />
            <div v-if="errors.family_head_name" class="error-msg">
              {{ errors.family_head_name[0] }}
            </div>
          </div>

          <div class="form-row">
            <label for="total_members">Total Family Members *</label>
            <input 
              id="total_members"
              v-model.number="form.total_members" 
              type="number" 
              min="1"
              placeholder="e.g., 4"
              required
            />
            <div v-if="errors.total_members" class="error-msg">
              {{ errors.total_members[0] }}
            </div>
            <div class="hint">Including yourself</div>
          </div>

          <div class="form-row">
            <label for="contact_number">Contact Number *</label>
            <input 
              id="contact_number"
              v-model="form.contact_number" 
              type="text"
              placeholder="e.g., +63 9XX XXX XXXX"
              required
            />
            <div v-if="errors.contact_number" class="error-msg">
              {{ errors.contact_number[0] }}
            </div>
          </div>

          <div class="form-row">
            <label for="address">Current Address</label>
            <input 
              id="address"
              v-model="form.address" 
              type="text"
              placeholder="Your residential address"
            />
            <div v-if="errors.address" class="error-msg">
              {{ errors.address[0] }}
            </div>
          </div>

          <div class="form-row">
            <label for="special_needs">Special Needs / Medical Conditions</label>
            <input 
              id="special_needs"
              v-model="form.special_needs" 
              type="text"
              placeholder="e.g., Wheelchair accessible, Oxygen support, etc."
            />
            <div v-if="errors.special_needs" class="error-msg">
              {{ errors.special_needs[0] }}
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary" :disabled="submitting">
              {{ submitting ? 'Registering...' : '✓ Register Family' }}
            </button>
            <router-link :to="`/resident_pages/evacuation-areas/${id}`" class="btn btn-secondary">
              Cancel
            </router-link>
          </div>
        </form>
      </div>
    </div>

    <div class="card mt-2">
      <div class="card-header">ℹ️ Information</div>
      <div class="card-body">
        <ul class="info-list">
          <li>Your family information will be securely recorded</li>
          <li>You will receive a confirmation with your family ID</li>
          <li>The evacuation center staff will be notified of your arrival</li>
          <li>Contact the center at the provided number if you have questions</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const id = ref(null);

import { residentEvacuationService } from '@/services/residentService';

const form = ref({
  family_head_name: '',
  total_members: 1,
  contact_number: '',
  address: '',
  special_needs: ''
});

const errors = ref({});
const serverError = ref('');
const successMessage = ref('');
const submitting = ref(false);

watch(
  () => route.params.id,
  (newId) => {
    console.debug('[RegisterFamily] route.params.id changed to:', newId);
    id.value = newId;
  },
  { immediate: true }
);

onMounted(() => {
  console.debug('[RegisterFamily] Component mounted');
  console.debug('[RegisterFamily] route.path:', route.path);
  console.debug('[RegisterFamily] route.name:', route.name);
  console.debug('[RegisterFamily] route.params:', route.params);
  console.debug('[RegisterFamily] route.params.id:', route.params.id);
  console.debug('[RegisterFamily] id ref:', id.value);
});


async function submit() {
  console.debug('[RegisterFamily] submit called with id:', id.value);
  
  if (!id.value) {
    serverError.value = 'Invalid evacuation area ID';
    console.error('[RegisterFamily] No ID available:', { 
      idRef: id.value, 
      routeParams: route.params,
      routePath: route.path
    });
    return;
  }

  submitting.value = true;
  errors.value = {};
  serverError.value = '';
  successMessage.value = '';

  try {
    console.debug('[RegisterFamily] Registering family with service:', form.value);
    const response = await residentEvacuationService.registerEvacuation(id.value, form.value);
    
    console.debug('[RegisterFamily] success', response.data);
    
    successMessage.value = response.data.message || 'Family registered successfully!';
    
    setTimeout(() => {
      router.push(`/resident_pages/evacuation-areas/${id.value}`);
    }, 1500);
  } catch (e) {
    console.error('[RegisterFamily] submission error', e);
    
    if (e.response && e.response.status === 422) {
      errors.value = e.response.data.errors || e.response.data || {};
      console.debug('[RegisterFamily] validation errors', errors.value);
    } else {
      serverError.value = e.response?.data?.message || e.message || 'Failed to register family';
    }
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
.register-family {
  padding: 1rem;
  max-width: 700px;
  margin: 0 auto;
}

.header-controls {
  margin-bottom: 1.5rem;
  display: flex;
  gap: 0.5rem;
}

.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
  overflow: hidden;
}

.card-header {
  padding: 1rem;
  font-weight: 700;
  border-bottom: 1px solid #e6edf3;
  background: linear-gradient(180deg, #f8fafc 0%, #eef2f6 100%);
  font-size: 1.1rem;
}

.card-body {
  padding: 1.5rem;
}

/* Alerts */
.alert {
  padding: 12px;
  border-radius: 6px;
  border-left: 4px solid;
}

.alert-danger {
  background: #fff1f2;
  color: #7f1d1d;
  border-color: #ef4444;
}

/* Intro Text */
.intro-text {
  color: #666;
  margin-bottom: 1rem;
  line-height: 1.6;
}

/* Messages */
.success-msg {
  background: #ecfdf5;
  color: #065f46;
  padding: 12px;
  border-radius: 6px;
  border-left: 4px solid #10b981;
  margin-bottom: 1rem;
  font-weight: 500;
}

.error-box {
  background: #fff1f2;
  color: #7f1d1d;
  padding: 12px;
  border-radius: 6px;
  border-left: 4px solid #ef4444;
  margin-bottom: 1rem;
  font-weight: 500;
}

/* Form */
.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-row label {
  display: block;
  font-weight: 600;
  color: #374151;
  font-size: 0.95rem;
}

.form-row input {
  width: 100%;
  padding: 10px;
  border: 1px solid #e6edf3;
  border-radius: 6px;
  font-size: 0.95rem;
  font-family: inherit;
  transition: border-color 200ms ease, box-shadow 200ms ease;
}

.form-row input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-row input::placeholder {
  color: #999;
}

.hint {
  font-size: 0.85rem;
  color: #666;
  margin-top: 2px;
}

.error-msg {
  color: #b00020;
  font-size: 0.85rem;
  margin-top: 2px;
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: 8px;
  margin-top: 1.5rem;
}

/* Buttons */
.btn {
  padding: 10px 12px;
  border-radius: 6px;
  color: white;
  text-decoration: none;
  border: none;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  transition: background 200ms ease, opacity 200ms ease;
  flex: 1;
  text-align: center;
  display: inline-block;
}

.btn:hover {
  opacity: 0.9;
}

.btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.btn-primary {
  background: #667eea;
}

.btn-secondary {
  background: #6c757d;
}

.mt-2 {
  margin-top: 1rem;
}

/* Info List */
.info-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-list li {
  padding-left: 24px;
  position: relative;
  color: #666;
  line-height: 1.6;
  font-size: 0.95rem;
}

.info-list li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #10b981;
  font-weight: 700;
}

/* Responsive */
@media (max-width: 600px) {
  .register-family {
    padding: 0.75rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>
