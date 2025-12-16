<template>
  <div class="container">
    <div class="header mb-6">
      <h1 class="text-3xl font-bold gradient-text">Reports</h1>
    </div>
    <div class="tabs mb-6">
      <router-link to="/reports/evacuation" class="tab">Evacuation Report</router-link>
      <router-link to="/reports/facility" class="tab">Facility Report</router-link>
      <router-link to="/reports/prediction" class="tab">Prediction Report</router-link>
    </div>
    <router-view></router-view>
  </div>
</template>

<script setup>

</script>

<style scoped>
.container { max-width: 1200px; margin: 0 auto; padding: 20px; }
.gradient-text { background: linear-gradient(90deg, #6366f1, #f43f5e); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.tabs { display: flex; gap: 10px; }
.tab { padding: 10px 20px; background: #f3f4f6; border-radius: 8px; text-decoration: none; color: #374151; transition: background 0.2s; }
.tab:hover { background: #e5e7eb; }
.tab.router-link-active { background: #6366f1; color: white; }
</style>
