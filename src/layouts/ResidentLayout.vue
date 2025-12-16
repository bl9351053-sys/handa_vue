<template>
  <div class="resident-layout">
    <ResidentHeader />
    <div class="resident-container">
      <ResidentSidebar />
      <main class="resident-main-content">
        <div class="content-wrapper">
          <router-view />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import ResidentHeader from '../components/resident_components/ResidentHeader.vue';
import ResidentSidebar from '../components/resident_components/ResidentSidebar.vue';
</script>

<style scoped>
.resident-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.resident-container {
  display: flex;
  flex: 1;
  margin-top: 60px;
}

.resident-main-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .resident-container {
    flex-direction: column;
    margin-top: 0;
  }

  .resident-main-content {
    padding: 10px;
  }
}
</style>
