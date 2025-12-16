<template>
  <nav class="bg-gradient-to-r from-indigo-700 to-indigo-900 text-white shadow sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo -->
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <i class="fa fa-shield text-white text-lg"></i>
          </div>
          <span class="hidden sm:block text-lg font-bold">System E</span>
        </div>

```
    <!-- Desktop Menu -->
    <div class="hidden md:flex items-center space-x-2 relative">
      <router-link
        v-for="item in mainItems"
        :key="item.name"
        :to="item.to"
        class="flex items-center gap-2 px-3 py-2 rounded-t-lg font-medium text-sm"
        :class="isActive(item.to) 
          ? 'bg-white/20 border-b-2 border-green-300 text-white' 
          : 'text-indigo-100 hover:bg-white/10 hover:text-white'"
      >
        <i :class="item.icon"></i>
        <span class="hidden lg:inline">{{ item.label }}</span>
      </router-link>

      <!-- Reports Dropdown -->
      <div class="relative" @mouseenter="showReports = true" @mouseleave="showReports = false">
        <button 
          class="flex items-center gap-2 px-3 py-2 rounded-t-lg font-medium text-sm text-indigo-100 hover:bg-white/10 hover:text-white"
        >
          <i class="fa fa-file"></i>
          <span class="hidden lg:inline">Reports</span>
          <i class="fa fa-caret-down ml-1 text-xs"></i>
        </button>
        <div v-show="showReports" class="absolute right-0 mt-2 w-48 bg-white/95 text-black rounded-md shadow-lg py-2 z-50">
          <router-link
            v-for="report in reportItems"
            :key="report.name"
            :to="report.to"
            class="block px-4 py-2 text-sm hover:bg-indigo-100 hover:text-indigo-900"
            :class="isActive(report.to) ? 'bg-indigo-100 text-indigo-900 font-semibold' : ''"
          >
            {{ report.label }}
          </router-link>
        </div>
      </div>
    </div>

    <!-- Mobile Menu Button -->
    <div class="md:hidden">
      <button @click="mobileMenuOpen = !mobileMenuOpen" class="p-2 rounded-md hover:bg-white/10 transition-colors">
        <i :class="mobileMenuOpen ? 'fa fa-times' : 'fa fa-bars'" class="text-xl"></i>
      </button>
    </div>

    <!-- Create quick action + Logout -->
    <div class="flex items-center ml-4">
      <router-link to="/updates/create" class="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium mr-3">
        <i class="fa fa-plus"></i>
        <span>Create Update</span>
      </router-link>

      <button
        @click="logout"
        class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/30 hover:bg-red-500/50 text-red-200 hover:text-white text-sm font-medium"
      >
        <i class="fa fa-sign-out"></i>
        <span class="hidden sm:inline">Logout</span>
      </button>
    </div>
  </div>

  <!-- Mobile Dropdown -->
  <transition name="fade">
    <div v-if="mobileMenuOpen" class="md:hidden bg-indigo-800/90 mt-2 rounded-lg py-2 space-y-1">
      <router-link
        v-for="item in mainItems"
        :key="`mobile-${item.name}`"
        :to="item.to"
        @click="mobileMenuOpen = false"
        class="flex items-center gap-3 px-4 py-2 rounded font-medium text-sm"
        :class="isActive(item.to)
          ? 'bg-white/15 text-white border-l-4 border-green-300'
          : 'text-indigo-100 hover:bg-white/10 hover:text-white border-l-4 border-transparent'"
      >
        <i :class="item.icon"></i>
        <span>{{ item.label }}</span>
      </router-link>

      <!-- Reports mobile dropdown -->
      <div>
        <button @click="mobileReportsOpen = !mobileReportsOpen" class="flex items-center gap-3 px-4 py-2 rounded font-medium text-sm text-indigo-100 hover:bg-white/10 hover:text-white w-full justify-between">
          <span><i class="fa fa-file"></i> Reports</span>
          <i :class="mobileReportsOpen ? 'fa fa-chevron-up' : 'fa fa-chevron-down'"></i>
        </button>
        <div v-show="mobileReportsOpen" class="pl-4 space-y-1">
          <router-link
            v-for="report in reportItems"
            :key="`mobile-${report.name}`"
            :to="report.to"
            @click="mobileMenuOpen = false; mobileReportsOpen = false"
            class="block px-4 py-2 text-sm text-indigo-100 hover:bg-white/10 hover:text-white rounded"
            :class="isActive(report.to) ? 'bg-white/15 text-white font-semibold' : ''"
          >
            {{ report.label }}
          </router-link>
        </div>
      </div>
    </div>
  </transition>
</div>
```

  </nav>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const mobileMenuOpen = ref(false)
const mobileReportsOpen = ref(false)
const showReports = ref(false)

const mainItems = [
  { name: 'dashboard', label: 'Dashboard', to: '/dashboard', icon: 'fa fa-tachometer' },
  { name: 'predictions', label: 'Predictions', to: '/predictions', icon: 'fa fa-bolt' },
  { name: 'updates', label: 'Updates', to: '/updates', icon: 'fa fa-bullhorn' },
  { name: 'evacuation-areas', label: 'Evacuation Areas', to: '/evacuation-areas', icon: 'fa fa-map' },
  { name: 'facilities', label: 'Facilities', to: '/facilities', icon: 'fa fa-building' },
  { name: 'families', label: 'Families', to: '/families', icon: 'fa fa-users' },
]

const reportItems = [
  { name: 'report-evacuation', label: 'Evacuation Report', to: '/reports/evacuation' },
  { name: 'report-facility', label: 'Facility Report', to: '/reports/facility' },
  { name: 'report-prediction', label: 'Prediction Report', to: '/reports/prediction' },
]

const isActive = (to) => route.path === to || route.path.startsWith(to + '/')

function logout() {
  localStorage.clear()
  import('../services/AuthService').then(({ default: AuthService }) => AuthService.setToken(null))
  router.push({ name: 'Login' })
}

// Close mobile menus when route changes
watch(() => route.path, () => {
  mobileMenuOpen.value = false
  mobileReportsOpen.value = false
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: all 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-5px); }
</style>
