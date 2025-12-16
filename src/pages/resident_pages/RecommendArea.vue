<template>
  <div class="recommend-area">
    <div class="header-controls">
      <router-link to="/resident_pages/evacuation-areas" class="btn btn-secondary">← Back to Areas</router-link>
    </div>

    <div class="card">
      <div class="card-header">🎯 Find Nearest Evacuation Area</div>
      <div class="card-body">
        <div v-if="!geoSupported" class="alert alert-warning">
          ⚠️ Geolocation is not supported in your browser. Please enable location services or use a modern browser.
        </div>

        <div v-else>
          <div class="controls">
            <p class="info-text">
              We'll use your current location and prescriptive analytics to find the best evacuation areas for you.
            </p>
            <button 
              class="btn btn-primary btn-large" 
              @click="getRecommendations" 
              :disabled="loading"
            >
              📍 {{ loading ? 'Finding Areas...' : 'Get Recommendations' }}
            </button>
          </div>

          <div v-if="loading" class="loading-box">
            <div class="spinner"></div>
            <p>Finding nearby areas…</p>
          </div>

          <div v-if="error" class="alert alert-danger">
            ❌ {{ error }}
          </div>

          <div v-if="prescriptive && Object.keys(prescriptive).length > 0" class="prescriptive-panel">
            <div class="prescriptive-summary">
              <div class="summary-item">
                <span class="label">Predicted Evacuees</span>
                <span class="value">{{ prescriptive.predicted_total ?? 0 }}</span>
              </div>
              <div class="summary-item">
                <span class="label">Total Allocated</span>
                <span class="value">{{ prescriptive.total_assigned ?? 0 }}</span>
              </div>
              <div class="summary-item">
                <span class="label">Unallocated</span>
                <span :class="['value', { 'text-danger': prescriptive.unallocated > 0 }]">
                  {{ prescriptive.unallocated ?? 0 }}
                </span>
              </div>
            </div>

            <div v-if="prescriptive.recommended_can_accommodate" class="alert alert-success">
              ✅ <strong>{{ prescriptive.recommended?.name }}</strong> can accommodate all {{ prescriptive.predicted_total }} predicted evacuees on its own (effective capacity: {{ prescriptive.recommended_effective_capacity }})
            </div>
            <div v-else-if="prescriptive.unallocated > 0" class="alert alert-warning">
              ⚠️ {{ prescriptive.unallocated }} evacuees cannot be fully allocated. Consider multiple evacuation areas.
            </div>
          </div>

          <div v-if="recommended" class="recommended-card">
            <div class="recommended-header">
              <h3>⭐ Top Recommendation</h3>
            </div>
            <div class="area-details">
              <div class="area-name">{{ recommended.name }}</div>
              <div class="area-address">{{ recommended.address }}</div>
              <div class="area-info-grid">
                <div class="info-item">
                  <span class="label">Final Score</span>
                  <span class="score">{{ (recommended.final_score ?? 0).toFixed(1) }}</span>
                </div>
              
                <div class="info-item">
                  <span class="label">Risk Score</span>
                  <span :class="['risk-badge', getRiskBadgeClass(recommended.risk_score)]">
                    {{ (recommended.risk_score ?? 0).toFixed(1) }}/10
                  </span>
                </div>
                <div class="info-item">
                  <span class="label">Capacity Left</span>
                  <span>{{ (recommended.capacity - (recommended.current_occupancy ?? 0)) }} spaces</span>
                </div>
              </div>
              <router-link 
                :to="`/resident_pages/evacuation-areas/${recommended.id}`"
                class="btn btn-primary btn-large"
              >
                → Go to Area
              </router-link>
            </div>
          </div>

          <div v-if="allocations && allocations.length" class="allocations-section">
            <h3>📊 Recommended Allocations</h3>
            <p class="small-text">Based on prescriptive analytics, here's how evacuees should be distributed:</p>
            <div class="table-responsive">
              <table class="table table-custom">
                <thead>
                  <tr>
                    <th>Area Name</th>
                    <th>Assigned</th>
                    <th>Capacity Left</th>
                    <th>Distance</th>
                    <th>Safety Factor</th>
                    <th>Final Score</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="alloc in allocations" :key="alloc.evacuation_area_id" :class="{ 'row-highlight': alloc.assigned > 0 }">
                    <td><strong>{{ alloc.name }}</strong></td>
                    <td class="text-center">
                      <span class="badge-allocation">{{ alloc.assigned }}</span>
                    </td>
                    <td class="text-center">{{ alloc.capacity_left }}</td>
                    <td class="text-center">{{ (alloc.distance ?? 0).toFixed(1) }} km</td>
                    <td class="text-center">
                      <span :class="['safety-indicator', getSafetyClass(alloc.safety_factor)]">
                        {{ (alloc.safety_factor ?? 0).toFixed(2) }}
                      </span>
                    </td>
                    <td class="text-center"><strong>{{ (alloc.final_score ?? 0).toFixed(1) }}</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div v-if="ranked && ranked.length" class="ranked-list">
            <h3>🔝 All Ranked Areas</h3>
            <div class="table-responsive">
              <table class="table table-custom">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Area Name</th>
                    <th>Distance</th>
                    <th>Score</th>
                    <th>Risk</th>
                    <th>Capacity Left</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(area, idx) in ranked" :key="area.id">
                    <td class="text-center rank">{{ idx + 1 }}</td>
                    <td>
                      <div class="area-name">{{ area.name }}</div>
                      <div class="area-address">{{ area.address }}</div>
                    </td>
                    <td class="text-center">{{ (area.distance ?? 0).toFixed(1) }} km</td>
                    <td class="text-center"><strong>{{ (area.final_score ?? 0).toFixed(1) }}</strong></td>
                    <td class="text-center">
                      <span :class="['risk-badge', getRiskBadgeClass(area.risk_score)]">
                        {{ (area.risk_score ?? 0).toFixed(1) }}
                      </span>
                    </td>
                    <td class="text-center">{{ (area.capacity - (area.current_occupancy ?? 0)) }}</td>
                    <td>
                      <router-link 
                        :to="`/resident_pages/evacuation-areas/${area.id}`"
                        class="btn btn-small"
                      >
                        View
                      </router-link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div v-if="!loading && !recommended && !ranked.length && !error" class="no-results">
            <p class="muted">Click the button above to find recommended evacuation areas based on your location and prescriptive analytics.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { inject } from 'vue';

const residentAxios = inject('residentAxios', null);
let axiosFallback = null;

const geoSupported = 'geolocation' in navigator;
const loading = ref(false);
const error = ref('');
const recommended = ref(null);
const ranked = ref([]);
const allocations = ref([]);
const prescriptive = ref({});


function getRiskBadgeClass(riskScore) {
  if (riskScore >= 8) return 'risk-critical';
  if (riskScore >= 6) return 'risk-high';
  if (riskScore >= 4) return 'risk-moderate';
  return 'risk-low';
}


function getSafetyClass(safetyFactor) {
  if (safetyFactor >= 0.8) return 'safety-excellent';
  if (safetyFactor >= 0.6) return 'safety-good';
  if (safetyFactor >= 0.4) return 'safety-fair';
  return 'safety-poor';
}


async function getRecommendations() {
  if (!geoSupported) {
    error.value = 'Geolocation not available';
    return;
  }

  loading.value = true;
  error.value = '';
  recommended.value = null;
  ranked.value = [];
  allocations.value = [];
  prescriptive.value = {};

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      
      console.debug('[RecommendArea] got location', { lat, lng });

      try {
        if (!axiosFallback) {
          const mod = await import('axios');
          axiosFallback = mod.default || mod;
        }
        
        const http = residentAxios || axiosFallback;
        
        const res = await http.get('/evacuation-areas/recommend', {
          params: { latitude: lat, longitude: lng }
        });

        const payload = res.data || {};
        
        recommended.value = payload.recommended_area ?? payload.recommended ?? null;
        
        ranked.value = payload.ranked_areas ?? payload.ranked ?? payload.rankings ?? [];
        
        allocations.value = payload.allocations ?? [];
        
        prescriptive.value = {
          predicted_total: payload.predicted_total ?? 0,
          total_assigned: payload.total_assigned ?? 0,
          unallocated: payload.unallocated ?? 0,
          recommended_can_accommodate: payload.recommended_can_accommodate ?? false,
          recommended_effective_capacity: payload.recommended_effective_capacity ?? 0,
          recommended: payload.recommended_area
        };

        console.debug('[RecommendArea] got recommendations', {
          recommended: recommended.value,
          rankedCount: ranked.value.length,
          allocationsCount: allocations.value.length,
          prescriptive: prescriptive.value
        });
      } catch (e) {
        console.error('[RecommendArea] recommendation error', e);
        error.value = e.response?.data?.message || e.message || 'Failed to get recommendations';
      } finally {
        loading.value = false;
      }
    },
    (err) => {
      loading.value = false;
      error.value = err.message || 'Geolocation error';
      console.error('[RecommendArea] geolocation error', err);
    }
  );
}
</script>

<style scoped>
.recommend-area {
  padding: 1rem;
  max-width: 1000px;
  margin: 0 auto;
}

.header-controls {
  margin-bottom: 1.5rem;
  display: flex;
  gap: 0.5rem;
}

.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
  overflow: hidden;
}

.card-header {
  padding: 1rem;
  font-weight: 700;
  border-bottom: 1px solid #e6edf3;
  background: linear-gradient(180deg, #f8fafc 0%, #eef2f6 100%);
  font-size: 1.1rem;
}

.card-body {
  padding: 1.5rem;
}

/* Alerts */
.alert {
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 1rem;
  border-left: 4px solid;
}

.alert-warning {
  background: #fff7ed;
  color: #92400e;
  border-color: #ea580c;
}

.alert-danger {
  background: #fff1f2;
  color: #7f1d1d;
  border-color: #ef4444;
}

/* Controls */
.controls {
  margin-bottom: 1.5rem;
}

.info-text {
  color: #666;
  margin-bottom: 1rem;
  line-height: 1.6;
}

/* Loading Box */
.loading-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  gap: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e6edf3;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Recommended Card */
.recommended-card {
  background: linear-gradient(135deg, #f0f8ff 0%, #e8f4ff 100%);
  padding: 1.5rem;
  border-radius: 8px;
  border: 2px solid #667eea;
  margin-bottom: 2rem;
}

.recommended-header h3 {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  color: #1e40af;
}

.area-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.area-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #374151;
}

.area-address {
  color: #666;
  font-size: 0.95rem;
}

.area-info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  padding: 1rem 0;
}

@media (max-width: 600px) {
  .area-info-grid {
    grid-template-columns: 1fr;
  }
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.label {
  font-size: 0.85rem;
  color: #666;
  font-weight: 500;
}

.score {
  font-size: 1.2rem;
  font-weight: 700;
  color: #667eea;
}

/* Ranked List */
.ranked-list {
  margin-top: 2rem;
}

.ranked-list h3 {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  color: #374151;
}

/* Table */
.table-responsive {
  overflow-x: auto;
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

.rank {
  font-weight: 700;
  color: #667eea;
}

.text-center {
  text-align: center;
}

/* Buttons */
.btn {
  padding: 10px 12px;
  border-radius: 6px;
  color: white;
  text-decoration: none;
  background: #667eea;
  border: none;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  transition: background 200ms ease, opacity 200ms ease;
}

.btn:hover {
  opacity: 0.9;
}

.btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
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
}

.btn-small {
  padding: 6px 10px;
  font-size: 0.85rem;
  width: 100%;
}

/* Utility Classes */
.muted {
  color: #666;
  font-size: 0.9rem;
}

.no-results {
  text-align: center;
  padding: 2rem 1rem;
  color: #666;
}

/* Responsive */
@media (max-width: 768px) {
  .recommend-area {
    padding: 0.75rem;
  }
}

/* Prescriptive Analytics Panel */
.prescriptive-panel {
  background: linear-gradient(135deg, #f0f5ff 0%, #e8effe 100%);
  padding: 1.5rem;
  border-radius: 8px;
  border: 2px solid #667eea;
  margin-bottom: 2rem;
}

.prescriptive-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
}

@media (max-width: 600px) {
  .prescriptive-summary {
    grid-template-columns: 1fr;
  }
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e6edf3;
}

.summary-item .label {
  font-size: 0.85rem;
  color: #666;
  font-weight: 500;
}

.summary-item .value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #667eea;
}

.summary-item .text-danger {
  color: #dc3545;
}

/* Alert Success */
.alert-success {
  background: #dcfce7;
  color: #166534;
  border-color: #22c55e;
}

/* Allocations Section */
.allocations-section {
  background: #fafbfc;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  border: 1px solid #e6edf3;
}

.allocations-section h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  color: #374151;
}

.small-text {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 1rem;
}

.row-highlight {
  background: #e8f4ff;
  border-left: 4px solid #667eea;
}

.badge-allocation {
  display: inline-block;
  padding: 4px 8px;
  background: #667eea;
  color: white;
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.9rem;
}

.safety-indicator {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.85rem;
}

.safety-excellent {
  background: #dcfce7;
  color: #166534;
}

.safety-good {
  background: #fef08a;
  color: #713f12;
}

.safety-fair {
  background: #fed7aa;
  color: #7c2d12;
}

.safety-poor {
  background: #fee2e2;
  color: #7f1d1d;
}

.risk-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.85rem;
}

.risk-low {
  background: #dff7e5;
  color: #167f25;
}

.risk-moderate {
  background: #fff4cc;
  color: #7a5b00;
}

.risk-high {
  background: #fff0e0;
  color: #7a3b00;
}

.risk-critical {
  background: #ffe6e6;
  color: #8b1e1e;
}
</style>
