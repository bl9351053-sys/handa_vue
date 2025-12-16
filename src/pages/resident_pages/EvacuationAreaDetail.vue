<template>
  <div class="evac-detail">
    <!-- Loading State -->
    <div v-if="loading" class="card">
      <div class="card-header">
        <div class="spinner-border spinner-sm me-2"></div>
        Loading evacuation area…
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="card">
      <div class="card-header">⚠️ Error</div>
      <div class="error-msg p-3">{{ error }}</div>
    </div>

    <!-- Main Content -->
    <div v-else>
      <!-- Area Overview Card -->
      <div class="card">
        <div class="card-header-flex">
          <h1 class="card-title">🏢 {{ area.name || 'Evacuation Area' }}</h1>
          <router-link to="/resident_pages/evacuation-areas" class="btn btn-secondary">
            ← Back to List
          </router-link>
        </div>
        
        <div class="grid-2col">
          <!-- Left Column: Details -->
          <div>
            <h3 class="detail-title">Details</h3>
            
            <div class="mb-1">
              <strong>Address:</strong>
              <p class="text-muted" style="margin-top: 0.25rem;">
                {{ area.address || '(No address data)' }}
              </p>
            </div>
            
            <div class="mb-1">
              <strong>Coordinates:</strong>
              <p class="text-muted" style="margin-top: 0.25rem;">
                {{ area.latitude ?? '—' }}, {{ area.longitude ?? '—' }}
              </p>
            </div>

            <div v-if="area.distance !== null" class="mb-1">
              <strong>Distance from your location:</strong>
              <p class="text-muted" style="margin-top: 0.25rem;">
                {{ area.distance.toFixed(2) }} km
              </p>
            </div>
            
            <div class="mb-1">
              <strong>Capacity:</strong>
              <p class="text-muted" style="margin-top: 0.25rem;">
                {{ area.capacity ?? 'N/A' }} people
              </p>
            </div>
            
            <div class="mb-1">
              <strong>Current Occupancy:</strong>
              <p class="text-muted" style="margin-top: 0.25rem;">
                {{ area.current_occupancy ?? 0 }} / {{ area.capacity ?? 'N/A' }} ({{ getCapacityPercent().toFixed(0) }}%)
              </p>
              <div class="progress-bar-container" style="height: 20px; border-radius: 10px; margin-top: 0.5rem;">
                <div 
                  class="progress-bar" 
                  :class="getCapacityPercent() >= 90 ? 'danger' : (getCapacityPercent() >= 70 ? 'warning' : 'success')"
                  :style="{ width: getCapacityPercent() + '%', 'border-radius': '10px', transition: 'width 0.3s' }"
                ></div>
              </div>
            </div>
            
            <div class="mb-1">
              <strong>Available Space:</strong>
              <p class="text-muted" style="margin-top: 0.25rem;">
                {{ (area.capacity - (area.current_occupancy ?? 0)) || 0 }} people
              </p>
            </div>
            
            <div class="mb-1">
              <strong>Status:</strong>
              <p style="margin-top: 0.25rem;">
                <span :class="['badge', 'badge-' + (area.status == 'available' ? 'success' : (area.status == 'full' ? 'danger' : 'warning'))]">
                  {{ capitalizeFirst(area.status) || 'Unknown' }}
                </span>
              </p>
            </div>
            
            <div v-if="area.facilities" class="mb-1">
              <strong>Facilities:</strong>
              <p class="text-muted" style="margin-top: 0.25rem;">{{ area.facilities }}</p>
            </div>
            
            <div v-if="area.contact_number" class="mb-1">
              <strong>Contact Number:</strong>
              <p class="text-muted" style="margin-top: 0.25rem;">{{ area.contact_number }}</p>
            </div>
          </div>
          
          <!-- Right Column: Map & Action -->
          <div>
            <h3 class="detail-title">Location</h3>
            <div id="map" class="map-container"></div>
            
            <router-link 
              v-if="area.id && canRegisterFamily"
              :to="`/resident_pages/evacuation-areas/${area.id}/register-family`"
              class="btn btn-primary btn-large"
            >
              👥 Register My Family
            </router-link>
            <div v-else-if="!area.id" class="btn btn-primary btn-large" style="opacity: 0.5; cursor: not-allowed;">
              👥 Loading...
            </div>
            <div v-else class="btn btn-primary btn-large" style="opacity: 0.5; cursor: not-allowed;">
              ❌ Capacity Full
            </div>
          </div>
        </div>
      </div>

      <!-- Families List -->
      <div class="card">
        <div class="card-header">👨‍👩‍👧‍👦 Families ({{ families ? families.length : 0 }})</div>
        
        <div v-if="families && families.length" class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Family Name</th>
                <th>Members</th>
                <th>Contact</th>
                <th>Special Needs</th>
                <th>Checked In</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="f in families" :key="f.id">
                <td><strong>{{ f.family_head_name }}</strong></td>
                <td>{{ f.total_members }}</td>
                <td>{{ f.contact_number }}</td>
                <td>{{ f.special_needs ?? 'None' }}</td>
                <td>{{ formatDate(f.checked_in_at) ?? 'Not Checked In' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="p-1">
          <p class="text-muted">No families currently in this evacuation area.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import EvacuationAreaService from '@/services/EvacuationAreaService';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const route = useRoute();

const area = ref({});
const families = ref([]);
const loading = ref(true);
const error = ref(null);
const userLocation = ref(null);
let map = null;

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function getCapacityPercent() {
  if (!area.value.capacity) return 0;
  return Math.min(100, ((area.value.current_occupancy ?? 0) / area.value.capacity) * 100);
}

const canRegisterFamily = computed(() => {
  return (area.value.current_occupancy ?? 0) < (area.value.capacity ?? 0);
});

function formatDate(dateString) {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
}

function capitalizeFirst(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getUserLocation() {
  return new Promise(resolve => {
    if (!navigator.geolocation) {
      console.warn('[EvacDetail] Geolocation not supported');
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      err => { console.warn('[EvacDetail] Geolocation error:', err.message); resolve(null); },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  });
}

function initializeMap() {
  if (!area.value.latitude || !area.value.longitude) {
    console.warn('[EvacDetail] No coordinates available for map');
    return;
  }
  cleanupMap();
  try {
    map = L.map('map').setView([area.value.latitude, area.value.longitude], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    L.marker([area.value.latitude, area.value.longitude])
      .addTo(map)
      .bindPopup(`<b>${area.value.name || 'Evacuation Area'}</b><br>${area.value.address || ''}`)
      .openPopup();

    map.invalidateSize(); // Fix rendering issues
    console.debug('[EvacDetail] Map initialized');
  } catch (e) {
    console.error('[EvacDetail] Map initialization error:', e);
  }
}

function cleanupMap() {
  if (map) {
    map.remove();
    map = null;
    console.debug('[EvacDetail] Map cleaned up');
  }
}

async function fetchArea() {
  loading.value = true;
  error.value = null;
  try {
    const id = route.params.id;
    console.debug('[EvacDetail] fetching area with id:', id);

    userLocation.value = await getUserLocation();

    const response = await EvacuationAreaService.getById(
      id,
      userLocation.value?.latitude,
      userLocation.value?.longitude
    );

    area.value = response || {};

    // Normalize numbers
    area.value.capacity = Number(area.value.capacity) || 0;
    area.value.current_occupancy = Number(area.value.current_occupancy) || 0;
    area.value.distance = area.value.distance !== null ? Number(area.value.distance) : null;

    if (area.value.distance === null && userLocation.value && area.value.latitude && area.value.longitude) {
      area.value.distance = calculateDistance(
        userLocation.value.latitude,
        userLocation.value.longitude,
        area.value.latitude,
        area.value.longitude
      );
    }

    families.value = area.value.families || [];

    console.log('[EvacDetail] Area loaded:', {
      id: area.value.id,
      name: area.value.name,
      capacity: area.value.capacity,
      families_count: families.value.length
    });
  } catch (e) {
    console.error('[EvacDetail] fetch error', e);
    error.value = e.response?.data?.message || e.message || 'Failed to load evacuation area';
  } finally {
    loading.value = false;
    if (!error.value) {
      await nextTick(); // Wait for DOM update
      initializeMap();
    }
  }
}

onMounted(fetchArea);
onUnmounted(cleanupMap);
</script>




<style scoped>
.evac-detail {
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* Header Controls */
.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.flex-gap-small {
  display: flex;
  gap: 0.5rem;
}

.mb-15 {
  margin-bottom: 1.5rem;
}

.mb-1 {
  margin-bottom: 1rem;
}

.card-header-no-border {
  border: none;
  padding: 0;
  background: transparent;
  font-size: 1.5rem;
  font-weight: 700;
}

/* Grid Layout */
.grid-2col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

@media (max-width: 768px) {
  .grid-2col {
    grid-template-columns: 1fr;
  }
}

.detail-title {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 700;
  color: #374151;
}

.text-muted {
  color: #666;
}

strong {
  font-weight: 600;
  color: #374151;
}

p {
  margin: 0;
  line-height: 1.6;
}

h3 {
  margin: 0;
}

/* Progress Bar */
.progress-bar-container {
  height: 20px;
  border-radius: 10px;
  background: #e6edf3;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  transition: width 0.3s;
}

.progress-bar.success {
  background: #28a745;
}

.progress-bar.warning {
  background: #ffc107;
}

.progress-bar.danger {
  background: #dc3545;
}

/* Badge Styles */
.badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-weight: 600;
  font-size: 0.85rem;
}

.badge-success {
  background: #ecfdf5;
  color: #065f46;
}

.badge-danger {
  background: #fff1f2;
  color: #7f1d1d;
}

.badge-warning {
  background: #fff7ed;
  color: #92400e;
}

/* Cards */
.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 1rem;
  overflow: hidden;
}

.card-header {
  padding: 1rem;
  font-weight: 700;
  border-bottom: 1px solid #e6edf3;
  background: linear-gradient(180deg, #f8fafc 0%, #eef2f6 100%);
  font-size: 1rem;
}

.card-header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.card-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
}

/* Map Container */
.map-container {
  height: 300px;
  border-radius: 8px;
  border: 1px solid #e6edf3;
  margin-bottom: 1rem;
}

/* Buttons */
.btn {
  padding: 8px 12px;
  border-radius: 6px;
  color: white;
  text-decoration: none;
  background: #667eea;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 200ms ease;
  display: inline-block;
  text-align: center;
}

.btn:hover {
  opacity: 0.9;
}

.btn-secondary {
  background: #6c757d;
}

.btn-primary {
  background: #667eea;
}

.btn-large {
  width: 100%;
  padding: 12px;
  font-size: 1rem;
  margin-bottom: 8px;
}

/* Table Styles */
.table-responsive {
  overflow: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table thead {
  background: linear-gradient(180deg, #f8fafc 0%, #eef2f6 100%);
}

.table th {
  padding: 10px;
  border-bottom: 2px solid #ddd;
  text-align: left;
  font-weight: 700;
  color: #374151;
  font-size: 0.875rem;
}

.table td {
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.table tbody tr:nth-child(even) {
  background: #fbfdfe;
}

.table tbody tr:hover {
  background: #f9fafb;
}

.text-center {
  text-align: center;
}

.p-1 {
  padding: 1rem;
}

.error-msg {
  color: #b00020;
  font-size: 0.9rem;
}
</style>
