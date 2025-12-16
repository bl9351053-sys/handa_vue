<template>
  <div class="container">
    <div class="header">
      <div>
        <h1>Edit Family</h1>
        <p>Update family information</p>
      </div>
      <router-link to="/families" class="back-link">
        <span class="arrow">&#8592;</span> Back to Families
      </router-link>
    </div>

```
<div v-if="loading" class="loading-card">
  <div class="spinner"></div>
  <span>Loading family...</span>
    </div>
    <div v-else class="card">
  <div v-if="generalError" class="error-card mb-6">
    <p>{{ generalError }}</p>
  </div>

  <form @submit.prevent="submit" class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label class="label">Family Head Name <span class="text-red-500">*</span></label>
        <input v-model="form.family_head_name" type="text" required class="input-field" />
        <p v-if="errors.family_head_name" class="error-text">{{ errors.family_head_name }}</p>
      </div>
      <div>
        <label class="label">Contact Number</label>
        <input v-model="form.contact_number" type="text" class="input-field" />
        <p v-if="errors.contact_number" class="error-text">{{ errors.contact_number }}</p>
      </div>
    </div>
    <div>
      <label class="label">Address <span class="text-red-500">*</span></label>
      <textarea v-model="form.address" rows="3" required class="input-field"></textarea>
      <p v-if="errors.address" class="error-text">{{ errors.address }}</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div>
        <label class="label">Total Members <span class="text-red-500">*</span></label>
        <input v-model.number="form.total_members" type="number" required min="1" class="input-field" />
        <p v-if="errors.total_members" class="error-text">{{ errors.total_members }}</p>
      </div>
      <div>
        <label class="label">Evacuation Area</label>
        <select v-model="form.evacuation_area_id" class="input-field">
          <option value="">Not assigned</option>
          <option v-for="area in evacuationAreas" :key="area.id" :value="area.id">{{ area.name }}</option>
        </select>
        <p v-if="errors.evacuation_area_id" class="error-text">{{ errors.evacuation_area_id }}</p>
      </div>
      <div>
        <label class="label">Status <span class="text-red-500">*</span></label>
        <select v-model="form.status" required class="input-field">
          <option value="pending">Pending</option>
          <option value="evacuated">Evacuated</option>
          <option value="returned">Returned</option>
        </select>
        <p v-if="errors.status" class="error-text">{{ errors.status }}</p>
      </div>
    </div>
    <div>
      <label class="label">Special Needs</label>
      <textarea v-model="form.special_needs" rows="2" class="input-field"></textarea>
      <p v-if="errors.special_needs" class="error-text">{{ errors.special_needs }}</p>
    </div>
    <div class="family-members">
      <h3>Family Members</h3>
      <div id="members-wrapper" class="space-y-3 mb-4">
        <div v-for="(member, index) in form.members" :key="index" class="member-card">
          <input v-model="member.name" type="text" placeholder="Name" required class="member-input" />
          <input v-model.number="member.age" type="number" placeholder="Age" min="0" class="member-input" />
          <select v-model="member.gender" class="member-input">
            <option value="">Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          <button type="button" @click="removeMember(index, member.id)" class="remove-btn">Remove</button>
        </div>
      </div>
      <button type="button" @click="addMember" class="add-btn">+ Add Member</button>
    </div>
    <div class="form-actions">
      <router-link to="/families" class="cancel-btn">Cancel</router-link>
      <button type="submit" :disabled="submitting" class="submit-btn">
        <span v-if="!submitting">Update Family</span>
        <span v-else>Updating...</span>
      </button>
    </div>
  </form>
</div>
```

  </div>
</template>

<script setup>
import { reactive, ref, inject, onMounted } from 'vue'
import axios from 'axios'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const baseUrl = inject('baseUrl', '')
const familyId = route.params.id

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
const loading = ref(true)
const evacuationAreas = ref([])
const deletedMemberIds = ref([])

onMounted(async () => {
  await Promise.all([fetchFamily(), fetchEvacuationAreas()])
})

async function fetchFamily() {
  try {
    const res = await axios.get(`${baseUrl}/families/${familyId}`)
    const family = res.data?.data || res.data
    Object.assign(form, family)
  } catch (err) {
    generalError.value = 'Failed to load family. Please try again.'
  } finally {
    loading.value = false
  }
}

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

function removeMember(index, memberId) {
  if (memberId) deletedMemberIds.value.push(memberId)
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
      members: form.members,
      deleted_ids: deletedMemberIds.value.join(',')
    }
    await axios.put(`${baseUrl}/families/${familyId}`, payload)
    router.push('/families')
  } catch (err) {
    if (err.response?.status === 422) Object.assign(errors, err.response.data.errors || {})
    else generalError.value = err.response?.data?.message || 'Failed to update family. Please try again.'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.container { max-width: 900px; margin: 0 auto; padding: 20px; }
.header { display:flex; justify-content:space-between; align-items:center; margin-bottom:25px; }
.header h1 { font-size:2.5rem; font-weight:bold; background:linear-gradient(90deg,#4f46e5,#06b6d4); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
.header p { color:#374151; margin-top:4px; }
.back-link { font-weight:500; color:#4f46e5; display:flex; align-items:center; gap:5px; }
.back-link:hover { text-decoration:underline; }

.card { background:linear-gradient(135deg, #f9f9ff, #ffffff); border-radius:12px; padding:30px; box-shadow:0 6px 20px rgba(0,0,0,0.08); }
.loading-card, .error-card { background:#fff; padding:30px; border-radius:12px; text-align:center; box-shadow:0 4px 15px rgba(0,0,0,0.05); display:flex; flex-direction:column; align-items:center; gap:10px; }
.spinner { border:4px solid #e5e7eb; border-top:4px solid #4f46e5; border-radius:50%; width:36px; height:36px; animation:spin 1s linear infinite; }
@keyframes spin {0%{transform:rotate(0deg);}100%{transform:rotate(360deg);} }
.error-text { color:#b91c1c; font-size:0.875rem; margin-top:4px; }

.label { display:block; font-size:0.875rem; font-weight:500; color:#374151; margin-bottom:6px; }
.input-field { width:100%; padding:10px 12px; border:1px solid #d1d5db; border-radius:8px; outline:none; transition:0.2s; }
.input-field:focus { border-color:#4f46e5; box-shadow:0 0 0 2px rgba(79,70,229,0.2); }

.family-members h3 { font-weight:600; margin-bottom:8px; color:#111827; }
.member-card { display:grid; grid-template-columns:1fr 1fr 1fr auto; gap:8px; padding:10px; background:#f3f4f6; border-radius:8px; }
.member-input { width:100%; padding:8px; border:1px solid #d1d5db; border-radius:6px; outline:none; transition:0.2s; }
.member-input:focus { border-color:#4f46e5; box-shadow:0 0 0 2px rgba(79,70,229,0.2); }
.remove-btn { background:#dc2626; color:#fff; border:none; border-radius:6px; font-weight:500; cursor:pointer; transition:0.2s; }
.remove-btn:hover { background:#b91c1c; }
.add-btn { background:#16a34a; color:#fff; padding:10px 16px; border-radius:8px; font-weight:500; cursor:pointer; transition:0.2s; }
.add-btn:hover { background:#15803d; }

.form-actions { display:flex; justify:end; gap:12px; margin-top:16px; }
.cancel-btn { padding:10px 16px; border:1px solid #d1d5db; border-radius:8px; font-weight:500; color:#374151; text-align:center; }
.cancel-btn:hover { background:#f9fafb; }
.submit-btn { background:#4f46e5; color:#fff; padding:10px 16px; border-radius:8px; font-weight:500; transition:0.2s; }
.submit-btn:hover { background:#4338ca; }
.submit-btn:disabled { opacity:0.6; cursor:not-allowed; }
</style>
