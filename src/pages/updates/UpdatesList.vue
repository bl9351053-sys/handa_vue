<template>
  <div class="container">
    <header class="header">
      <h1>📋 Disaster Updates (Admin)</h1>
      <router-link to="/updates/create" class="btn-add">+ Add Update</router-link>
    </header>

<div v-if="loading" class="status-msg loading">Loading updates...</div>
<div v-else-if="error" class="status-msg error">{{ error }}</div>
<div v-else-if="updates.length" class="updates-list">
  <div v-for="u in updates" :key="u.id" class="update-card">
    <div class="update-info">
      <h3>{{ u.title }}</h3>
      <div class="meta">{{ u.source }} • {{ formatDate(u.issued_at) }}</div>
      <p>{{ u.description }}</p>
    </div>
    <div class="update-actions">
      <router-link :to="`/updates/${u.id}`" class="btn view">View</router-link>
      <router-link :to="`/updates/${u.id}/edit`" class="btn edit">Edit</router-link>
      <button @click="remove(u.id)" class="btn delete">Delete</button>
    </div>
  </div>
</div>
<div v-else class="status-msg no-updates">No updates found.</div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const updates = ref([]);
const loading = ref(false);
const error = ref(null);

const fetch = async () => {
  loading.value = true; error.value = null;
  try {
    const http = axios;  
    const res = await http.get('/updates');
    updates.value = Array.isArray(res.data) ? res.data : (res.data.data || []);
  } catch (e) {
    console.error(e); error.value = 'Failed to load updates';
  } finally { loading.value = false; }
};

const remove = async (id) => {
  if (!confirm('Delete this update?')) return;
  try {
    const http = axios;
    await http.delete(`/updates/${id}`);
    await fetch();
  } catch (e) { 
    console.error(e); 
    if (e.response?.status === 404) {
      alert('Update not found. It may have been deleted.');
    } else {
      alert('Failed to delete update');
    }
  }
};

const formatDate = (s) => s ? new Date(s).toLocaleString() : 'N/A';

onMounted(fetch);
</script>

<style>
.container {
  max-width: 900px;
  margin: 40px auto;
  padding: 0 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}
.header h1 {
  font-size: 2rem;
  font-weight: 700;
}
.btn-add {
  background-color: #28a745;
  color: #fff;
  text-decoration: none;
  padding: 10px 18px;
  border-radius: 8px;
  font-weight: 500;
  transition: background-color 0.3s;
}
.btn-add:hover {
  background-color: #218838;
}

.status-msg {
  text-align: center;
  margin: 20px 0;
  font-size: 1rem;
}
.status-msg.loading { color: #555; }
.status-msg.error { color: #c0392b; font-weight: 600; }
.status-msg.no-updates { color: #777; }

.updates-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.update-card {
  display: flex;
  justify-content: space-between;
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  transition: transform 0.2s, box-shadow 0.2s;
}
.update-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.12);
}

/* Update Info */
.update-info h3 {
  font-size: 1.25rem;
  margin-bottom: 6px;
}
.update-info .meta {
  font-size: 0.875rem;
  color: #777;
  margin-bottom: 10px;
}
.update-info p {
  color: #555;
  line-height: 1.5;
}

/* Update Actions */
.update-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.btn {
  padding: 8px 14px;
  border: none;
  border-radius: 6px;
  color: #fff;
  cursor: pointer;
  font-weight: 500;
  text-align: center;
  transition: background-color 0.3s;
  text-decoration: none;
}
.btn.view { background-color: #007bff; }
.btn.view:hover { background-color: #0069d9; }
.btn.edit { background-color: #ffc107; color: #222; }
.btn.edit:hover { background-color: #e0a800; }
.btn.delete { background-color: #dc3545; }
.btn.delete:hover { background-color: #c82333; }

/* Responsive */
@media(max-width: 700px){
  .update-card {
    flex-direction: column;
    gap: 15px;
  }
  .update-actions {
    flex-direction: row;
    justify-content: flex-start;
    gap: 10px;
  }
}
</style>
