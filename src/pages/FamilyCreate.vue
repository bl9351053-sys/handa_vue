<template>
  <div class="container">
    <div class="header">
      <div>
        <h1>Add Family</h1>
        <p>Create a new family record</p>
      </div>
      <router-link to="/families" class="back-link">
        <span class="arrow">&#8592;</span> Back to Families
      </router-link>
    </div>

```
<div class="card">
  <div v-if="generalError" class="error-message">
    <p>{{ generalError }}</p>
  </div>

  <form @submit.prevent="submit">
    <div class="form-row two-cols">
      <div class="form-group">
        <label>Family Head Name <span class="required">*</span></label>
        <input v-model="form.family_head_name" type="text" required />
        <p v-if="errors.family_head_name" class="error-text">{{ errors.family_head_name }}</p>
      </div>
      <div class="form-group">
        <label>Contact Number</label>
        <input v-model="form.contact_number" type="text" />
        <p v-if="errors.contact_number" class="error-text">{{ errors.contact_number }}</p>
      </div>
    </div>

    <div class="form-group">
      <label>Address <span class="required">*</span></label>
      <textarea v-model="form.address" rows="3" required></textarea>
      <p v-if="errors.address" class="error-text">{{ errors.address }}</p>
    </div>

    <div class="form-row three-cols">
      <div class="form-group">
        <label>Total Members <span class="required">*</span></label>
        <input v-model.number="form.total_members" type="number" min="1" required />
        <p v-if="errors.total_members" class="error-text">{{ errors.total_members }}</p>
      </div>
      <div class="form-group">
        <label>Evacuation Area</label>
        <select v-model="form.evacuation_area_id">
          <option value="">Not assigned</option>
          <option v-for="area in evacuationAreas" :key="area.id" :value="area.id">{{ area.name }}</option>
        </select>
        <p v-if="errors.evacuation_area_id" class="error-text">{{ errors.evacuation_area_id }}</p>
      </div>
      <div class="form-group">
        <label>Status <span class="required">*</span></label>
        <select v-model="form.status" required>
          <option value="pending">Pending</option>
          <option value="evacuated">Evacuated</option>
          <option value="returned">Returned</option>
        </select>
        <p v-if="errors.status" class="error-text">{{ errors.status }}</p>
      </div>
    </div>

    <div class="form-group">
      <label>Special Needs</label>
      <textarea v-model="form.special_needs" rows="2" placeholder="e.g., Elderly members, Pregnant women, Persons with disabilities"></textarea>
      <p v-if="errors.special_needs" class="error-text">{{ errors.special_needs }}</p>
    </div>

    <div class="members-section">
      <h3>Family Members (Optional)</h3>
      <div v-for="(member, index) in form.members" :key="index" class="member-card">
        <input v-model="member.name" type="text" placeholder="Name" required />
        <input v-model.number="member.age" type="number" min="0" placeholder="Age" />
        <select v-model="member.gender">
          <option value="">Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        <button type="button" @click="removeMember(index)" class="remove-btn">Remove</button>
      </div>
      <button type="button" @click="addMember" class="add-btn">+ Add Member</button>
      <p class="note">You can leave members blank if you want to add them later.</p>
    </div>

    <div class="form-actions">
      <router-link to="/families" class="cancel-btn">Cancel</router-link>
      <button type="submit" :disabled="submitting" class="submit-btn">
        <span v-if="!submitting">Create Family</span>
        <span v-else>Creating...</span>
      </button>
    </div>
  </form>
</div>
  </div>
</template>

<script setup>
import { reactive, ref, inject, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const baseUrl = inject('baseUrl', '')

const form = reactive({
  family_head_name: '',
  contact_number: '',
  address: '',
  total_members: 1,
  evacuation_area_id: '',
  status: 'pending',
  special_needs: '',
  members: []
})

const errors = reactive({})
const generalError = ref('')
const submitting = ref(false)
const evacuationAreas = ref([])

onMounted(async () => {
  await fetchEvacuationAreas()
})

async function fetchEvacuationAreas() {
  try {
    const res = await axios.get(`${baseUrl}/evacuation-areas`)
    evacuationAreas.value = res.data?.data || res.data || []
  } catch (err) {
    console.error('Failed to fetch evacuation areas:', err)
  }
}

function addMember() {
  form.members.push({ name: '', age: null, gender: '' })
}

function removeMember(index) {
  form.members.splice(index, 1)
}

async function submit() {
  submitting.value = true
  generalError.value = ''
  Object.keys(errors).forEach(k => delete errors[k])

  try {
    const payload = {
      family_head_name: form.family_head_name,
      contact_number: form.contact_number || null,
      address: form.address,
      total_members: form.total_members,
      evacuation_area_id: form.evacuation_area_id || null,
      status: form.status,
      special_needs: form.special_needs || null,
      members: form.members.filter(m => m.name)
    }
    await axios.post(`${baseUrl}/families`, payload)
    router.push('/families')
  } catch (err) {
    if (err.response?.status === 422) {
      Object.assign(errors, err.response.data.errors || {})
    } else if (err.response?.data?.message) {
      generalError.value = err.response.data.message
    } else {
      generalError.value = 'Failed to create family. Please try again.'
    }
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}
.card {
  background: linear-gradient(135deg, #f9f9ff, #ffffff);
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.08);
}

.header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}
.header h1 {
  font-size: 2rem;
  margin: 0;
  background: linear-gradient(90deg, #4f46e5, #06b6d4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.header p {
  color: #374151;
  margin-top: 4px;
}
.back-link {
  color: #4f46e5;
  text-decoration: none;
  font-weight: 500;
}
.back-link:hover { text-decoration: underline; }

.error-message {
  background-color: #fee2e2;
  border-left: 4px solid #f87171;
  color: #b91c1c;
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 20px;
}
.error-text {
  color: #b91c1c;
  font-size: 0.875rem;
  margin-top: 4px;
}

.form-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 20px;
}
.two-cols > .form-group { flex: 1 1 45%; }
.three-cols > .form-group { flex: 1 1 30%; }
.form-group { display: flex; flex-direction: column; }
label { margin-bottom: 6px; font-weight: 500; }

input, select, textarea {
  padding: 10px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;
}
input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 2px rgba(79,70,229,0.2);
}

.members-section h3 {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 15px;
}
.member-card {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  background-color: #f3f4f6;
  padding: 15px;
  border-radius: 8px;
  align-items: center;
  margin-bottom: 10px;
}
.member-card input, .member-card select { flex: 1 1 22%; }
.remove-btn {
  background-color: #dc2626;
  color: #fff;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  flex: 1 1 15%;
}
.remove-btn:hover { background-color: #b91c1c; }
.add-btn {
  background-color: #16a34a;
  color: #fff;
  border: none;
  padding: 10px 15px;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 5px;
}
.add-btn:hover { background-color: #15803d; }
.note {
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 5px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 25px;
}
.cancel-btn {
  background: none;
  border: 1px solid #d1d5db;
  padding: 10px 20px;
  border-radius: 6px;
  text-decoration: none;
  color: #111827;
}
.cancel-btn:hover { background-color: #f3f4f6; }
.submit-btn {
  background-color: #4f46e5;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
}
.submit-btn:hover { background-color: #4338ca; }
.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .two-cols > .form-group, .three-cols > .form-group { flex: 1 1 100%; }
  .member-card { flex-direction: column; align-items: stretch; }
  .member-card input, .member-card select, .remove-btn { flex: 1 1 100%; }
}
</style>
