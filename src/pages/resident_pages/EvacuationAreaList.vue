<template>
  <div class="evac-list">
    <!-- Header -->
    <div class="card">
      <div class="card-header">🗺️ Evacuation Areas & Disaster Predictions Map</div>

      <!-- Map Container -->
      <div class="map-container">
        <div id="map" class="map"></div>

        <!-- Route Directions Panel -->
        <div v-if="showRouteDirections" class="route-panel">
          <div class="route-header">
            <h4>🛣️ Route Directions</h4>
            <button @click="closeRouteDirections" class="close-btn">×</button>
          </div>
          <div class="route-content">
            <div v-if="routeDirections.length > 0">
              <div class="route-info">
                <strong>From:</strong> Your Location<br>
                <strong>To:</strong> {{ selectedArea?.name }}<br>
                <strong>Distance:</strong> {{ routeDistance }}<br>
                <strong>Estimated Time:</strong> {{ routeTime }}
              </div>
              <div class="route-steps">
                <ol>
                  <li v-for="(step, index) in routeDirections" :key="index">
                    {{ step.instruction }}
                  </li>
                </ol>
              </div>
            </div>
            <div v-else class="route-loading">
              Calculating route...
            </div>
          </div>
        </div>
      </div>

      <!-- Location Status -->
      <div class="location-status-box">
        <h4>📍 Your Location</h4>
        <div class="loc-controls">
          <button class="btn btn-success" @click="getLocation">Get My Location</button>
        </div>
        <div class="muted">{{ locationStatus }}</div>
      </div>
    </div>

    <!-- Disaster Predictions Section -->
    <div class="card">
      <div class="card-header">🌪️ Active Disaster Assessment</div>

      <!-- Loading State -->
      <div v-if="predictionsLoading" class="center py-4">
        <div class="spinner-border" role="status">
          <span class="sr-only">Loading predictions...</span>
        </div>
        <p class="mt-2">Loading disaster predictions…</p>
      </div>

      <!-- Predictions List -->
      <div v-else-if="disasterPredictions.length > 0" class="predictions-grid">
        <div
          v-for="prediction in disasterPredictions.slice(0, 3)"
          :key="prediction.id"
          class="prediction-card"
          :class="getPredictionSeverityClass(prediction.severity)"
        >
          <div class="prediction-header">
            <h4>{{ prediction.disaster_type }}</h4>
            <span class="severity-badge" :class="getPredictionSeverityClass(prediction.severity)">
              {{ prediction.severity }}
            </span>
          </div>
          <div class="prediction-body">
            <div class="prediction-detail">
              <strong>Location:</strong> {{ prediction.location_name }}
            </div>
            <div class="prediction-detail">
              <strong>Expected Date:</strong> {{ formatDate(prediction.predicted_date || prediction.predicted_at) }}
            </div>
           
            <div class="prediction-detail">
              <strong>Risk Level:</strong> {{ prediction.risk_level }}/10
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="muted p-3">No active disaster predictions available.</div>

      <!-- View All Link -->
      <div v-if="disasterPredictions.length > 3" class="text-center p-3">
        <router-link to="/resident_pages/disaster-predictions" class="btn btn-secondary">
          View All Predictions →
        </router-link>
      </div>
    </div>

    <!-- Prescriptive Analytics Section -->
    <div class="analytics-section">
      <!-- Top Recommendation Card -->
      <div class="card prescriptive card-shadow">
        <div class="prescriptive-header">
          <!-- Left: Predicted Evacuees -->
          

          <!-- Right: Top Recommended Area -->
          <div class="pred-right">
            <div class="small">Recommended Evacuation Area (Top Score)</div>
            <div v-if="topArea" class="top-area">
              <div class="name">
                {{ topArea.name }}
                <small class="addr">- {{ topArea.address }}</small>
              </div>
              <div class="meta">
                Risk: <strong>{{ (topArea.risk_score || 0).toFixed(1) }}</strong> ·
                Final Score: <strong>{{ (topArea.final_score || 0).toFixed(1) }}</strong> ·
                Distance: <strong>{{ topArea.distance ? topArea.distance.toFixed(2) + ' km' : 'N/A' }}</strong> ·
                Remaining: <strong>{{ (topArea.capacity || 0) - (topArea.current_occupancy || 0) }}</strong>
              </div>
              <button
                class="btn btn-primary mt-8"
                @click="goToAreaDetail(topArea.id)"
              >
                View Details →
              </button>
            </div>
            <div v-else class="small muted">No recommended area available</div>
          </div>
        </div>
      </div>

      <!-- Allocations Table (if available) -->
      <div v-if="prescriptiveData?.allocations?.length" class="card">
        <div class="card-header">📍 Recommended Allocations</div>
        <div class="table-responsive">
          <table class="table table-custom">
            <thead>
              <tr>
                <th>Evacuation Area</th>
                <th class="text-center">Assigned Evacuees</th>
                <th class="text-center">Remaining Capacity</th>
                <th class="text-center">Distance (km)</th>
                <th class="text-center">Safety Factor</th>
                <th class="text-center">Final Score</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="alloc in prescriptiveData.allocations" :key="alloc.evacuation_area_id">
                <td>
                  <strong>{{ alloc.name }}</strong>
                </td>
                <td class="text-center">
                  <span class="badge badge-success">{{ alloc.assigned || 0 }} people</span>
                </td>
                <td class="text-center">
                  <span>{{ alloc.capacity_left || 0 }} people</span>
                </td>
                <td class="text-center">
                  {{ alloc.distance ? alloc.distance.toFixed(2) : 'N/A' }}
                </td>
                <td class="text-center">
                  <span :class="['hazard-badge', getSafetyFactorClass(alloc.safety_factor || 0)]">
                    {{ (alloc.safety_factor || 0).toFixed(2) }}
                  </span>
                </td>
                <td class="text-center">
                  <strong>{{ (alloc.final_score || 0).toFixed(1) }}</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Evacuation Areas List -->
    <div class="card">
      <div class="card-header">📋 Evacuation Areas List</div>

      <!-- Loading State -->
      <div v-if="loading" class="center py-4">
        <div class="spinner-border" role="status">
          <span class="sr-only">Loading...</span>
        </div>
        <p class="mt-2">Loading evacuation areas…</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-msg p-3">
        <strong>Error:</strong> {{ error }}
      </div>

      <!-- Areas Table -->
      <div v-else-if="areas.length > 0" class="table-responsive">
        <table class="table table-custom">
          <thead>
            <tr>
              <th>Name</th>
              <th>Address</th>
              <th class="text-center">Capacity</th>
              <th class="text-center">Current</th>
              <th class="text-center">Available</th>
              <th class="text-center">Status</th>
              <th class="text-center">Risk Score</th>
              <th class="text-center">Final Score</th>
              <th class="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="area in areas" :key="area.id">
              <td>
                <strong>{{ area.name }}</strong>
              </td>
              <td>{{ area.address }}</td>
              <td class="text-center">{{ area.capacity || '—' }}</td>
              <td class="text-center">{{ area.current_occupancy || 0 }}</td>
              <td class="text-center">
                <strong>{{ (area.capacity || 0) - (area.current_occupancy || 0) }}</strong>
              </td>
              <td class="text-center">
                <span :class="['badge-custom', getStatusBadgeClass(area.status)]">
                  {{ capitalizeFirst(area.status) }}
                </span>
              </td>
              <td class="text-center">
                <span :class="['hazard-badge', getHazardBadgeClass(area.risk_score || 0)]">
                  {{ (area.risk_score || 0).toFixed(1) }}
                </span>
              </td>
              <td class="text-center">
                <strong style="color: #667eea;">{{ (area.final_score || 0).toFixed(1) }}</strong>
              </td>
              <td class="text-center">
                <button
                  class="btn btn-primary btn-sm"
                  @click="goToAreaDetail(area.id)"
                >
                  View
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div v-else class="muted p-3">No evacuation areas found.</div>
    </div>


  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { residentEvacuationService, residentPredictionsService } from '@/services/residentService';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

const router = useRouter();

// ============ DATA ============
const areas = ref([]);
const loading = ref(true);
const error = ref(null);

// Disaster predictions
const disasterPredictions = ref([]);
const predictionsLoading = ref(true);

// Prescriptive analytics
const predictedEvacuees = ref(0);
const topArea = ref(null);
const prescriptiveData = ref(null);

// User location
const userLocation = ref(null);
const locationStatus = ref('');

// Map instance
let map = null;
let areaMarkers = [];
let predictionMarkers = [];
let userLocationMarker = null;
let updateTimeout = null;
let mapInitialized = false;

// Route directions
const showRouteDirections = ref(false);
const selectedArea = ref(null);
const routeDirections = ref([]);
const routeDistance = ref('');
const routeTime = ref('');

// Routing control
let routingControl = null;

// Add location modal (removed - residents cannot create evacuation areas)

// ============ METHODS ============

/**
 * Capitalize first letter of a string
 */
function capitalizeFirst(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Get status badge CSS class
 */
function getStatusBadgeClass(status) {
  const classMap = {
    'available': 'badge-success',
    'full': 'badge-danger',
    'closed': 'badge-warning',
    'pending': 'badge-warning'
  };
  return classMap[status] || 'badge-warning';
}

/**
 * Get hazard badge class based on risk score
 */
function getHazardBadgeClass(riskScore) {
  if (!riskScore) riskScore = 0;
  if (riskScore >= 8) return 'hazard-critical';
  if (riskScore >= 6) return 'hazard-high';
  if (riskScore >= 4) return 'hazard-moderate';
  return 'hazard-low';
}

/**
 * Get safety factor badge class
 */
function getSafetyFactorClass(safetyFactor) {
  if (!safetyFactor) safetyFactor = 0;
  if (safetyFactor >= 0.8) return 'hazard-low';
  if (safetyFactor >= 0.6) return 'hazard-moderate';
  if (safetyFactor >= 0.4) return 'hazard-high';
  return 'hazard-critical';
}

/**
 * Get prediction severity class
 */
function getPredictionSeverityClass(severity) {
  const severityMap = {
    'low': 'severity-low',
    'moderate': 'severity-moderate',
    'high': 'severity-high',
    'critical': 'severity-critical'
  };
  return severityMap[severity?.toLowerCase()] || 'severity-moderate';
}

/**
 * Get disaster marker color based on disaster type
 */
function getDisasterMarkerColor(disasterType) {
  const colorMap = {
    'flood': '#1e40af', // blue
    'earthquake': '#dc2626', // red
    'typhoon': '#059669', // green
    'unknown': '#6b7280' // gray
  };
  return colorMap[disasterType] || colorMap['unknown'];
}

/**
 * Get disaster icon based on disaster type
 */
function getDisasterIcon(disasterType) {
  const iconMap = {
    'flood': '🌊',
    'earthquake': '🌋',
    'typhoon': '🌀',
    'unknown': '⚠️'
  };
  return iconMap[disasterType] || iconMap['unknown'];
}

/**
 * Get risk circle color based on risk level
 */
function getRiskCircleColor(riskLevel) {
  if (riskLevel >= 8) return '#dc2626'; // red
  if (riskLevel >= 6) return '#ea580c'; // orange
  if (riskLevel >= 4) return '#f59e0b'; // amber
  if (riskLevel >= 2) return '#eab308'; // yellow
  return '#22c55e'; // green
}

/**
 * Format date for display
 */
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (e) {
    return dateString;
  }
}

/**
 * Fetch disaster predictions from API
 */
async function fetchDisasterPredictions() {
  predictionsLoading.value = true;

  try {
    const response = await residentPredictionsService.getDisasterPredictions();

    // Handle paginated or array responses like in DisasterPredictionsList.vue
    let predictionsData = response.data;
    if (predictionsData && predictionsData.data) {
      // Paginated response
      predictionsData = predictionsData.data;
    } else if (!Array.isArray(predictionsData)) {
      // Not an array, set to empty
      predictionsData = [];
    }

    disasterPredictions.value = Array.isArray(predictionsData) ? predictionsData.map(normalizePrediction) : [];

    console.log('[EvacuationAreaList] Loaded disaster predictions:', disasterPredictions.value.length);
  } catch (err) {
    console.error('[EvacuationAreaList] Error fetching disaster predictions:', err);
    disasterPredictions.value = [];
  } finally {
    predictionsLoading.value = false;
  }
}

/**
 * Normalize prediction data to match frontend expectations
 */
function normalizePrediction(p) {
  const disaster_type = p.disaster_type ?? p.disasterType ?? p.type ?? '';
  const risk_level = p.risk_level ?? p.riskLevel ?? p.risk ?? 0;
  const location_name = p.location_name ?? p.location ?? 'Unknown Location';
  const latitude = p.latitude ?? 14.5995; // Default Manila coordinates
  const longitude = p.longitude ?? 120.9842;
  const probability = p.probability ?? p.confidence ?? 0;
  const predicted_date = p.predicted_date ?? p.predicted_at ?? null;
  const predicted_recovery_days = p.predicted_recovery_days ?? p.recoveryDays ?? null;

  return {
    ...p,
    disaster_type,
    risk_level,
    location_name,
    latitude,
    longitude,
    probability,
    predicted_date,
    predicted_recovery_days
  };
}

/**
 * Fetch all evacuation areas from API
 */
async function fetchAreas() {
  loading.value = true;
  error.value = null;

  try {
    let response;

    // Use location-aware API if user location is available for accurate scoring
    if (userLocation.value) {
      response = await residentEvacuationService.getNearestAreas(
        userLocation.value.lat,
        userLocation.value.lng
      );
    } else {
      response = await residentEvacuationService.getAvailableAreas();
    }

    // Handle array or wrapped responses
    let areasData = response;
    if (response && typeof response === 'object' && !Array.isArray(response)) {
      areasData = response.data || response.evacuationAreas || [];
    }

    areas.value = Array.isArray(areasData) ? areasData : [];

    // Normalize numeric fields to avoid runtime template errors (toFixed expects Number)
    areas.value = areas.value.map(a => {
      const area = { ...a };
      area.risk_score = (area.risk_score === null || area.risk_score === undefined) ? 0 : Number(area.risk_score);
      if (Number.isNaN(area.risk_score)) area.risk_score = 0;
      area.final_score = (area.final_score === null || area.final_score === undefined) ? 0 : Number(area.final_score);
      if (Number.isNaN(area.final_score)) area.final_score = 0;
      area.capacity = (area.capacity === null || area.capacity === undefined) ? 0 : Number(area.capacity);
      if (Number.isNaN(area.capacity)) area.capacity = 0;
      area.current_occupancy = (area.current_occupancy === null || area.current_occupancy === undefined) ? 0 : Number(area.current_occupancy);
      if (Number.isNaN(area.current_occupancy)) area.current_occupancy = 0;
      area.capacity_score = (area.capacity_score === null || area.capacity_score === undefined) ? 0 : Number(area.capacity_score);
      if (Number.isNaN(area.capacity_score)) area.capacity_score = 0;
      area.distance_score = (area.distance_score === null || area.distance_score === undefined) ? 0 : Number(area.distance_score);
      if (Number.isNaN(area.distance_score)) area.distance_score = 0;
      return area;
    });

    // Add mock lat/lng coordinates for areas that don't have them
    areas.value = areas.value.map((area) => {
      if (!area.latitude || !area.longitude) {
        // Base coordinates around Manila, Philippines with small variations
        const baseLat = 14.5995;
        const baseLng = 120.9842;
        const variation = 0.01; // ~1km variation

        area.latitude = baseLat + (Math.random() - 0.5) * variation;
        area.longitude = baseLng + (Math.random() - 0.5) * variation;
      }
      return area;
    });

    // Set top recommended area (highest final_score)
    topArea.value = areas.value.length > 0
      ? areas.value
          .slice()
          .sort((a, b) => (b.final_score || 0) - (a.final_score || 0))[0]
      : null;

    console.log('[EvacuationAreaList] Loaded areas:', areas.value.length, userLocation.value ? 'with location' : 'without location');
  } catch (err) {
    console.error('[EvacuationAreaList] Error fetching areas:', err);
    error.value = err.response?.data?.message || err.message || 'Failed to load evacuation areas';
  } finally {
    loading.value = false;
  }
}

/**
 * Add user location marker to the map
 */
function addUserLocationMarker() {
  if (!map || !userLocation.value) return;

  // Remove existing user location marker
  if (userLocationMarker && map.hasLayer(userLocationMarker)) {
    map.removeLayer(userLocationMarker);
  }

  // Create a custom icon for user location (blue marker)
  const userIcon = L.divIcon({
    className: 'user-location-marker',
    html: '<div style="background-color: #007bff; border: 3px solid white; border-radius: 50%; width: 20px; height: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });

  // Add marker to map
  userLocationMarker = L.marker([userLocation.value.lat, userLocation.value.lng], { icon: userIcon })
    .addTo(map)
    .bindPopup('<strong>Your Location</strong><br>Current position');

  console.log('[EvacuationAreaList] User location marker added');
}

/**
 * Get user location using Geolocation API
 */
function getLocation() {
  locationStatus.value = 'Getting location...';

  if (!navigator.geolocation) {
    locationStatus.value = 'Geolocation not supported by this browser';
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      userLocation.value = { lat, lng };
      locationStatus.value = `Lat ${lat.toFixed(6)}, Lng ${lng.toFixed(6)}`;

      // Add user location marker to map
      addUserLocationMarker();

      // Re-fetch areas with location-aware scoring
      fetchAreas();

      // Fetch prescriptive data for the new location
      watchUserLocation();
    },
    (err) => {
      locationStatus.value = `Error: ${err.message}`;
    }
  );
}

/**
 * Navigate to evacuation area detail page
 */
function goToAreaDetail(areaId) {
  router.push(`/resident_pages/evacuation-areas/${areaId}`);
}

/**
 * Initialize map
 */
function initializeMap() {
  if (map) return; // Already initialized

  // Fix Leaflet icon paths to use absolute URLs from root
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconUrl: '/marker-icon.png',
    shadowUrl: '/marker-shadow.png',
  });

  // Default center (Manila, Philippines)
  const defaultCenter = [14.5995, 120.9842];

  map = L.map('map').setView(defaultCenter, 10);

  // Add OpenStreetMap tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 18,
  }).addTo(map);

  // Mark map as initialized
  mapInitialized = true;
  console.log('[EvacuationAreaList] Map initialized successfully');
}

/**
 * Update area markers on map with debouncing and initialization checks
 */
function updateAreaMarkers() {
  // Clear any existing timeout
  if (updateTimeout) {
    clearTimeout(updateTimeout);
  }

  // Debounce updates to prevent rapid firing
  updateTimeout = setTimeout(() => {
    updateAreaMarkersImmediate();
  }, 300); // 300ms debounce
}

/**
 * Immediate marker update function (called after debouncing)
 */
function updateAreaMarkersImmediate() {
  // Check if map is initialized and ready
  if (!map || !mapInitialized || !map._loaded) {
    console.log('[EvacuationAreaList] Map not ready, skipping marker update');
    return;
  }

  console.log('[EvacuationAreaList] Updating markers:', areas.value.length, 'areas,', disasterPredictions.value.length, 'predictions');

  try {
    // Clear existing markers more efficiently
    areaMarkers.forEach(marker => {
      if (map.hasLayer && map.hasLayer(marker)) {
        map.removeLayer(marker);
      }
    });
    areaMarkers = [];

    predictionMarkers.forEach(marker => {
      if (map.hasLayer && map.hasLayer(marker)) {
        map.removeLayer(marker);
      }
    });
    predictionMarkers = [];

    // Clear user location marker
    if (userLocationMarker && map.hasLayer && map.hasLayer(userLocationMarker)) {
      map.removeLayer(userLocationMarker);
    }
    userLocationMarker = null;

    // Add evacuation area markers
    areas.value.forEach(area => {
      if (area.latitude && area.longitude) {
        const marker = L.marker([area.latitude, area.longitude])
          .addTo(map)
          .bindPopup(`
            <div style="min-width: 200px;">
              <strong>${area.name}</strong><br>
              <span style="color: #666;">${area.address}</span><br>
              <span><strong>Capacity:</strong> ${area.capacity}</span><br>
              <span><strong>Risk Score:</strong> ${area.risk_score?.toFixed(1) || 'N/A'}</span><br>
              <span><strong>Available:</strong> ${(area.capacity || 0) - (area.current_occupancy || 0)}</span><br>
              <button onclick="window.viewAreaDetail(${area.id})" style="margin-top: 8px; padding: 4px 8px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer;">View Details</button>
              ${userLocation.value ? `<button onclick="window.getRouteDirections(${area.latitude}, ${area.longitude}, '${area.name.replace(/'/g, "\\'")}')" style="margin-top: 8px; margin-left: 4px; padding: 4px 8px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">Show Route</button>` : ''}
            </div>
          `);

        areaMarkers.push(marker);
      }
    });

    // Add disaster prediction markers
    disasterPredictions.value.forEach(prediction => {
      if (prediction.latitude && prediction.longitude) {
        const disasterType = prediction.disaster_type?.toLowerCase() || 'unknown';
        const riskLevel = parseInt(prediction.risk_level || 0, 10);

        // Get marker color based on disaster type
        const markerColor = getDisasterMarkerColor(disasterType);

        // Create custom icon
        const customIcon = L.divIcon({
          className: 'custom-disaster-marker',
          html: `<div style="background-color: ${markerColor}; border: 2px solid white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${getDisasterIcon(disasterType)}</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const marker = L.marker([prediction.latitude, prediction.longitude], { icon: customIcon })
          .addTo(map)
          .bindPopup(`
            <div style="min-width: 250px;">
              <strong style="color: ${markerColor};">${prediction.disaster_type || 'Unknown Disaster'}</strong><br>
              <span style="color: #666;">${prediction.location_name || prediction.location || 'Unknown Location'}</span><br>
              <span><strong>Risk Level:</strong> ${prediction.risk_level || 'N/A'}/10</span><br>
              <span><strong>Expected:</strong> ${formatDate(prediction.predicted_date || prediction.predicted_at)}</span><br>
              <span><strong>Confidence:</strong> ${prediction.probability || 'N/A'}%</span><br>
              <span><strong>Recovery:</strong> ${prediction.predicted_recovery_days || 'N/A'} days</span><br>
              <button onclick="window.viewPredictionDetail(${prediction.id})" style="margin-top: 8px; padding: 4px 8px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">View Details</button>
            </div>
          `);

        // Add risk circle
        const circleColor = getRiskCircleColor(riskLevel);
        L.circle([prediction.latitude, prediction.longitude], {
          color: circleColor,
          fillColor: circleColor,
          fillOpacity: 0.2,
          radius: Math.max(500, riskLevel * 200),
          weight: 2
        }).addTo(map);

        predictionMarkers.push(marker);
      }
    });

    // Fit map to show all markers only if we have markers
    const allMarkers = [...areaMarkers, ...predictionMarkers];
    if (allMarkers.length > 0) {
      try {
        const group = new L.featureGroup(allMarkers);
        const bounds = group.getBounds();
        if (bounds && bounds.isValid && bounds.isValid()) {
          map.fitBounds(bounds.pad(0.1));
        }
      } catch (error) {
        console.warn('[EvacuationAreaList] Could not fit bounds:', error);
      }
    }
  } catch (error) {
    console.error('[EvacuationAreaList] Error updating markers:', error);
  }
}

/**
 * Fetch prescriptive analytics data
 */
async function fetchPrescriptiveData() {
  if (!userLocation.value) return;

  try {
    const response = await residentEvacuationService.getRecommendedArea(
      userLocation.value.lat,
      userLocation.value.lng,
      predictedEvacuees.value
    );

    prescriptiveData.value = response;

    // Update topArea distance from prescriptive allocations if available
    if (topArea.value && prescriptiveData.value?.allocations) {
      const matchingAlloc = prescriptiveData.value.allocations.find(
        alloc => alloc.evacuation_area_id === topArea.value.id
      );
      if (matchingAlloc && matchingAlloc.distance !== undefined) {
        topArea.value.distance = matchingAlloc.distance;
      }
    }

    console.log('[EvacuationAreaList] Prescriptive data loaded:', response);
  } catch (err) {
    console.error('[EvacuationAreaList] Error fetching prescriptive data:', err);
  }
}

/**
 * Watch for user location changes to fetch prescriptive data
 */
function watchUserLocation() {
  if (userLocation.value) {
    fetchPrescriptiveData();
  }
}

/**
 * Initialize on mount
 */
onMounted(async () => {
  await fetchAreas();
  await fetchDisasterPredictions();
  initializeMap();
  updateAreaMarkers();
  initializeGlobalFunctions();

  // Watch for user location changes
  watch(userLocation, () => {
    watchUserLocation();
  });

  // Watch for data changes to update markers
  watch(areas, () => {
    updateAreaMarkers();
  });

  watch(disasterPredictions, () => {
    updateAreaMarkers();
  });

  // Watch for user location changes to update markers (for Show Route button)
  watch(userLocation, () => {
    updateAreaMarkers();
  });
});

/**
 * Close route directions panel
 */
function closeRouteDirections() {
  showRouteDirections.value = false;
  selectedArea.value = null;
  routeDirections.value = [];
  routeDistance.value = '';
  routeTime.value = '';

  // Remove routing control from map
  if (routingControl) {
    map.removeControl(routingControl);
    routingControl = null;
  }
}

/**
 * Get route directions to an evacuation area
 */
function getRouteDirections(lat, lng, name) {
  if (!userLocation.value) {
    alert('Please get your location first to view directions.');
    return;
  }

  // Check if start and end coordinates are the same
  if (userLocation.value.lat === lat && userLocation.value.lng === lng) {
    alert('You are already at this evacuation area.');
    return;
  }

  selectedArea.value = { latitude: lat, longitude: lng, name };
  showRouteDirections.value = true;
  routeDirections.value = [];
  routeDistance.value = 'Calculating...';
  routeTime.value = 'Calculating...';

  // Remove existing routing control
  if (routingControl) {
    map.removeControl(routingControl);
  }

  // Create new routing control
  // IMPORTANT: For production use, replace with a proper routing service
  // Options:
  // 1. GraphHopper: Get free API key from https://graphhopper.com/dashboard/#/register
  // 2. Mapbox: Get API key from https://account.mapbox.com/
  // 3. OpenRouteService: Get free API key from https://openrouteservice.org/
  routingControl = L.Routing.control({
    waypoints: [
      L.latLng(userLocation.value.lat, userLocation.value.lng),
      L.latLng(lat, lng)
    ],
    routeWhileDragging: false,
    createMarker: () => null, // Don't create default markers
    lineOptions: {
      styles: [{ color: '#667eea', weight: 6, opacity: 0.8 }]
    },
    show: false, // Hide the default instructions panel
    addWaypoints: false,
    // Using OSRM public instance (not recommended for production)
    router: L.Routing.osrmv1({
      serviceUrl: 'https://router.project-osrm.org/route/v1/',
      profile: 'driving'
    })
  }).addTo(map);

  // Listen for route found event
  routingControl.on('routesfound', (e) => {
    const routes = e.routes;
    const route = routes[0];

    // Extract route information
    routeDistance.value = `${(route.summary.totalDistance / 1000).toFixed(2)} km`;
    routeTime.value = `${Math.round(route.summary.totalTime / 60)} min`;

    // Extract step-by-step instructions
    routeDirections.value = route.instructions.map(instruction => ({
      instruction: instruction.text
    }));

    console.log('[EvacuationAreaList] Route calculated:', {
      distance: routeDistance.value,
      time: routeTime.value,
      steps: routeDirections.value.length
    });
  });

  // Handle routing errors
  routingControl.on('routingerror', (e) => {
    console.error('[EvacuationAreaList] Routing error:', e);
    routeDistance.value = 'Error calculating route';
    routeTime.value = 'Error calculating route';
    routeDirections.value = [{ instruction: 'Unable to calculate route. Please try again.' }];
  });
}

/**
 * Initialize global window functions for marker popups
 */
function initializeGlobalFunctions() {
  window.viewAreaDetail = (areaId) => {
    goToAreaDetail(areaId);
  };

  window.getRouteDirections = (lat, lng, name) => {
    getRouteDirections(lat, lng, name);
  };
}

/**
 * Cleanup on unmount
 */
onUnmounted(() => {
  // Clear any pending timeouts
  if (updateTimeout) {
    clearTimeout(updateTimeout);
    updateTimeout = null;
  }

  if (map) {
    map.remove();
    map = null;
  }

  // Clean up routing control
  if (routingControl) {
    routingControl = null;
  }

  // Remove global functions
  if (typeof window !== 'undefined') {
    delete window.viewAreaDetail;
    delete window.getRouteDirections;
  }
});
</script>

<style scoped>
.evac-list {
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* Header Styles */
.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 1rem;
}

.card-header {
  padding: 1rem;
  font-weight: 700;
  border-bottom: 1px solid #e6edf3;
  background: linear-gradient(180deg, #f8fafc 0%, #eef2f6 100%);
  border-radius: 8px 8px 0 0;
}

/* Controls */
.controls {
  padding: 12px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.controls label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.controls input[type="checkbox"] {
  cursor: pointer;
}

/* Info Box */
.info-box {
  background: #fff3cd;
  padding: 12px;
  border-radius: 8px;
  margin: 8px 12px;
  border-left: 4px solid #ffc107;
}

.legend {
  display: flex;
  gap: 12px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  gap: 6px;
  align-items: center;
  font-size: 0.9rem;
}

.dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  display: inline-block;
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.dot.low { background: #28a745; }
.dot.moderate { background: #ffc107; }
.dot.high { background: #fd7e14; }
.dot.critical { background: #dc3545; }

/* Map */
.map {
  height: 320px;
  border-radius: 8px;
  margin: 12px;
  background: #eef2f6;
  border: 1px solid #e6edf3;
}

/* Location Status Box */
.location-status-box {
  padding: 12px;
  margin: 0 12px 12px 12px;
}

.location-status-box h4 {
  margin: 0 0 12px 0;
}

.loc-controls {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.muted {
  color: #666;
  font-size: 0.9rem;
  margin-top: 8px;
}

/* Prescriptive Analytics */
.p-6 { padding: 1.5rem 0; }
.mb-8 { margin-bottom: 2rem; }

.prescriptive {
  padding: 1.5rem;
  margin: 0 0 1.5rem 0;
}

.prescriptive-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
  flex-wrap: wrap;
}

.pred-left h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
}

.pred-left .small {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 4px;
}

.pred-left .big {
  font-size: 2rem;
  font-weight: 700;
  color: #667eea;
}

.pred-right {
  flex: 1;
  min-width: 300px;
}

.pred-right .small {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 8px;
}

.top-area {
  background: #f8fafc;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #e6edf3;
}

.top-area .name {
  font-weight: 600;
  margin-bottom: 6px;
}

.top-area .addr {
  color: #666;
  font-size: 0.9rem;
}

.top-area .meta {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 12px;
}

.mt-8 { margin-top: 8px; }

/* Table Styles */
.table-responsive {
  overflow: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table-custom {
  border-collapse: separate;
  border-spacing: 0;
  border: 1px solid #e6edf3;
  width: 100%;
}

.table-custom th,
.table-custom td {
  padding: 0.75rem;
  border-right: 1px solid #e6edf3;
  vertical-align: middle;
}

.table-custom th:last-child,
.table-custom td:last-child {
  border-right: none;
}

.table-custom thead th {
  background: linear-gradient(180deg, #f8fafc 0%, #eef2f6 100%);
  color: #374151;
  font-weight: 700;
  font-size: 0.875rem;
  border-bottom: 2px solid #e6edf3;
}

.table-custom tbody tr:hover {
  background: #f9fafb;
}

.table-custom tbody tr:nth-child(even) {
  background: #ffffff;
}

.table-custom tbody tr:nth-child(odd) {
  background: #fbfdfe;
}

.table td {
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.table th {
  padding: 10px;
  border-bottom: 2px solid #ddd;
  text-align: left;
}

.text-center { text-align: center; }

/* Badge Styles */
.badge-custom {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-weight: 600;
  border: 1px solid rgba(0,0,0,0.06);
  font-size: 0.85rem;
}

.badge-success {
  background: #ecfdf5;
  color: #065f46;
  border-color: rgba(6,95,70,0.1);
}

.badge-warning {
  background: #fff7ed;
  color: #92400e;
  border-color: rgba(146,64,14,0.08);
}

.badge-danger {
  background: #fff1f2;
  color: #7f1d1d;
  border-color: rgba(127,29,29,0.08);
}

.hazard-badge {
  display: inline-block;
  min-width: 34px;
  padding: 0.2rem 0.5rem;
  border-radius: 9999px;
  text-align: center;
  font-weight: 700;
  font-size: 0.85rem;
}

.hazard-low { background: #dff7e5; color: #167f25; }
.hazard-moderate { background: #fff4cc; color: #7a5b00; }
.hazard-high { background: #fff0e0; color: #7a3b00; }
.hazard-critical { background: #ffe6e6; color: #8b1e1e; }

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
}

.btn:hover {
  opacity: 0.9;
}

.btn-success { background: #28a745; }
.btn-primary { background: #667eea; }
.btn-secondary { background: #6c757d; }

.center {
  text-align: center;
  padding: 12px;
}

.p-1 { padding: 0.25rem; }

.error-msg {
  color: #b00020;
  font-size: 0.9rem;
  margin-top: 6px;
}

/* Card Shadow for emphasis */
.card-shadow {
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.08), 0 1px 4px rgba(15, 23, 42, 0.04);
  border: 1px solid rgba(15, 23, 42, 0.06);
}

/* Disaster Predictions */
.predictions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  margin: 1rem 0;
}

.prediction-card {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border: 1px solid #e6edf3;
  transition: box-shadow 0.2s ease;
}

.prediction-card:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.prediction-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.prediction-header h4 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
}

.severity-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.severity-low {
  background: #ecfdf5;
  color: #065f46;
}

.severity-moderate {
  background: #fff7ed;
  color: #92400e;
}

.severity-high {
  background: #fff1f2;
  color: #7f1d1d;
}

.severity-critical {
  background: #fef2f2;
  color: #991b1b;
}

.prediction-body {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.prediction-detail {
  font-size: 0.9rem;
  color: #666;
}

.prediction-detail strong {
  color: #374151;
}

/* Modal Overlay */
.modal-overlay {
  display: flex;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
}

.modal-content h3 {
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
}

.form-row {
  margin-bottom: 1rem;
}

.form-row label {
  display: block;
  font-weight: 600;
  margin-bottom: 4px;
}

.form-row input {
  width: 100%;
  padding: 8px;
  border: 1px solid #e6edf3;
  border-radius: 6px;
  font-size: 0.9rem;
}

.form-row input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102,126,234,0.1);
}

.form-actions {
  display: flex;
  gap: 8px;
  margin-top: 1.5rem;
}

.form-actions button {
  flex: 1;
}
</style>
