<template>
  <div class="admin-layout">
    <div class="admin-container">
      <AdminSidebar />
      <main class="admin-main-content">
        <div class="content-wrapper">
          <router-view />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import AdminSidebar from '@/components/AdminSidebar.vue';
</script>

<style scoped>
.admin-layout { display: flex; flex-direction: column; min-height: 100vh; background-color: #f5f5f5; }
.admin-container { display: flex; flex: 1; }
.admin-main-content { flex: 1; padding: 20px; overflow-y: auto; }
.content-wrapper { max-width: 1200px; margin: 0 auto; }
@media (max-width: 768px) { .admin-container { flex-direction: column; } .admin-main-content { padding: 10px; } }
</style>
