<template>
  <aside class="admin-sidebar">
    <!-- Brand / Logo -->
    <div class="sidebar-brand">
      <svg xmlns="http://www.w3.org/2000/svg" class="shield-icon" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2l8 4v6c0 5.25-3.78 9.88-8 10-4.22-.12-8-4.75-8-10V6l8-4z"/>
      </svg>
      <span class="brand-text">HANDA</span>
    </div>

<!-- Navigation -->
<nav>
  <ul>
    <li v-for="item in navItems" :key="item.path">
      <a 
        href="#" 
        class="nav-link" 
        :class="{ active: isActive(item.path) }" 
        @click.prevent="navigate(item.path)"
      >
        {{ item.label }}
      </a>
    </li>
  </ul>
</nav>

  </aside>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router';
import AuthService from '../services/AuthService.js';

const router = useRouter();
const route = useRoute();

const navItems = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Risk Assessment', path: '/predictions' },
  { label: 'Evacuation Areas', path: '/evacuation-areas' },
  { label: 'Facilities', path: '/facilities' },
  { label: 'Families', path: '/families' },
  { label: 'Emergency Alerts', path: '/emergency-alerts' },
  { label: 'Updates', path: '/updates' },
  { label: 'Reports', path: '/reports' },

  { label: 'Settings', path: '/settings' },
  { label: 'Logout', path: 'logout' }
];

function isActive(path) {
  return route.path === path;
}

async function navigate(path) {
  if (path === 'logout') {
    logout();
  } else {
    try {
      await router.push({ path });
    } catch (err) {
      console.error('Navigation error', { path, err });
      try { alert('Navigation failed. See console for details.'); } catch (e) {
        //
      }
    }
  }
}

function logout() {
  AuthService.logout();
  router.push({ name: 'ChooseRole' });
}
</script>

<style scoped>
.admin-sidebar {
  width: 240px;
  background: linear-gradient(180deg, #4f46e5, #6366f1);
  color: #fff;
  padding: 24px 16px;
  font-family: 'Segoe UI', Arial, sans-serif;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  box-shadow: 2px 0 8px rgba(0,0,0,0.1);
}

/* Brand / Logo */
.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 32px;
}
.shield-icon {
  width: 32px;
  height: 32px;
  color: #fbbf24;
}
.brand-text {
  font-size: 20px;
  font-weight: bold;
  letter-spacing: 1px;
}

/* Navigation */
.admin-sidebar nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.admin-sidebar nav li + li {
  margin-top: 12px;
}

.nav-link {
  display: block;
  padding: 12px 16px;
  border-radius: 12px;
  text-decoration: none;
  color: #f3f4f6;
  font-weight: 500;
  transition: all 0.2s ease;
  background: rgba(255,255,255,0.05);
}
.nav-link:hover {
  background: rgba(255,255,255,0.2);
  color: #fff;
  transform: translateX(4px);
}
.nav-link.active {
  background: #fbbf24;
  color: #1f2937;
  font-weight: bold;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

/* Responsive */
@media (max-width: 768px) {
  .admin-sidebar {
    width: 100%;
    height: auto;
    position: relative;
    border-right: none;
    border-bottom: 1px solid rgba(255,255,255,0.3);
    display: flex;
    justify-content: center;
    padding: 16px 12px;
  }
  .admin-sidebar nav ul {
    display: flex;
    gap: 12px;
  }
  .nav-link {
    padding: 8px 12px;
    font-size: 14px;
  }
}
</style>
