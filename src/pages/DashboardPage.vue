<template>
<div class="dashboard-container">
    <h2 class="dashboard-title">Dashboard</h2>


    

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Total members</div>
        <div class="stat-value">{{ stats.total_members ?? '-' }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Total families</div>
        <div class="stat-value">{{ stats.total_families ?? '-' }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Evacuation Areas</div>
        <div class="stat-value">{{ stats.total_evacuation_areas ?? '-' }}</div>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Available evacuation areas</div>
        <div class="stat-value">{{ stats.available_evacuation_areas ?? '-' }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Total facilities</div>
        <div class="stat-value">{{ stats.total_facilities ?? '-' }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Operational facilities</div>
        <div class="stat-value">{{ stats.operational_facilities ?? '-' }}</div>
      </div>
    </div>

    <!-- Forecast latest value -->
    <div class="single-stat-card">
      <div class="stat-card">
        <div class="stat-label">Latest forecasted evacuees</div>
        <div class="stat-value">{{ stats.latest_forecast ?? '-' }}</div>
      </div>
    </div>

    <div class="charts-grid">
      <!-- Evacuation Chart spans full width -->
      <div class="chart-card evacuation-chart">
        <h3 class="chart-title">Evacuation Areas</h3>
        <canvas id="evacuationChart"></canvas>
      </div>

      <!-- Forecast chart -->
      <div class="chart-card forecast-chart">
        <h3 class="chart-title">Evacuees Forecast</h3>
        <canvas id="forecastChart"></canvas>
      </div>

      <!-- Two circle charts below -->
      <div class="chart-card">
        <h3 class="chart-title">Facility Status</h3>
        <canvas id="facilityChart"></canvas>
      </div>
      <div class="chart-card">
        <h3 class="chart-title">Family Status</h3>
        <canvas id="familyChart"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const stats = ref({});


async function loadDashboard() {
  try {
    const res = await api.get('/dashboard');
    if (res && res.data) {
      const body = res.data;
      if (body.stats) stats.value = body.stats;
      if (body.evacuationAreaData) buildEvacuationChart(body.evacuationAreaData);
      if (body.facilityStatusData) buildFacilityChart(body.facilityStatusData);
      if (body.familyStatusData) buildFamilyChart(body.familyStatusData);
      if (body.forecastData) buildForecastChart(body.forecastData);
      if (body.latestForecast !== undefined) stats.value.latest_forecast = body.latestForecast;
    }
  } catch (e) {
    console.error('dashboard load failed', e);
  }
}


function buildEvacuationChart(data) {
  const ctx = document.getElementById('evacuationChart');
  if (!ctx) return;
  const labels = data.map(d => d.name);
  const occupancy = data.map(d => d.current_occupancy);
  const capacity = data.map(d => d.capacity);
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'Current Occupancy', data: occupancy, backgroundColor: '#0d6efd' },
        { label: 'Capacity', data: capacity, backgroundColor: '#6c757d' }
      ]
    }
  });
}

function buildFacilityChart(data) {
  const ctx = document.getElementById('facilityChart');
  if (!ctx) return;
  const labels = data.map(d => d.status);
  const counts = data.map(d => d.count);
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{ data: counts, backgroundColor: ['#198754', '#ffc107', '#dc3545', '#0d6efd'] }]
    }
  });
}

function buildFamilyChart(data) {
  const ctx = document.getElementById('familyChart');
  if (!ctx) return;
  const labels = data.map(d => d.status);
  const counts = data.map(d => d.count);
  new Chart(ctx, {
    type: 'pie',
    data: { labels, datasets: [{ data: counts, backgroundColor: ['#0d6efd', '#6f42c1', '#fd7e14'] }] }
  });
}

function buildForecastChart(data) {
  const ctx = document.getElementById('forecastChart');
  if (!ctx) return;
  const labels = data.map(d => d.date);
  const actual = data.map(d => d.actual === null ? null : Number(d.actual));
  const forecast = data.map(d => Number(d.forecast));
  new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'Actual', data: actual, borderColor: '#198754', backgroundColor: 'rgba(25,135,84,0.1)', spanGaps: true },
        { label: 'Forecast', data: forecast, borderColor: '#0d6efd', backgroundColor: 'rgba(13,110,253,0.08)' }
      ]
    },
    options: {
      scales: {
        x: { display: true },
        y: { display: true, beginAtZero: true }
      }
    }
  });
}

onMounted(() => {
  loadDashboard();
});
</script>

<style scoped>
.dashboard-title {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 20px;
}

.backup-section {
  margin-bottom: 30px;
}

.backup-btn {
  background: linear-gradient(135deg, #0d6efd, #0b5ed7);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(13, 110, 253, 0.3);
}

.backup-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(13, 110, 253, 0.4);
}

.backup-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 22px;
  margin-bottom: 25px;
}

.stat-card {
  padding: 22px;
  border-radius: 18px;
  background: linear-gradient(135deg, #ffffff, #f7faff);
  border: 1px solid #e2e8f0;
  box-shadow: 0 6px 100px rgba(0,0,0,0.06);
  transition: 0.25s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.10);
}

.stat-label {
  font-size: 15px;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 10px;
  letter-spacing: 0.3px;
}

.stat-value {
  font-size: 34px;
  font-weight: 800;
  color: #1e293b;
}

/* Highlight card (Forecast latest value) */
.single-stat-card .stat-card {
  background: linear-gradient(135deg, #0ea5e9, #38bdf8);
  color: #fff;
  border: none;
}

.single-stat-card .stat-label {
  color: #eef9ff;
  opacity: 0.9;
}

.single-stat-card .stat-value {
  color: #fff;
}

/* ---------- CHARTS ---------- */

.charts-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 25px;
  margin-top: 20px;
}

/* Chart cards */
.chart-card {
  background: #ffffff;
  padding: 25px;
  border-radius: 16px;
  border: 1px solid #e5e9f0;
  box-shadow: 0 6px 12px rgba(0,0,0,0.06);
  transition: 0.2s ease;
}

.chart-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.08);
}

.chart-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 14px;
  color: #1e293b;
}

/* Evacuation chart full width */
.evacuation-chart {
  grid-column: 1 / -1;
}

/* Forecast chart full width — bigger height */
.forecast-chart {
  grid-column: 1 / -1;
}

.forecast-chart canvas {
  min-height: 360px;
}

/* Side-by-side circular charts */
@media (min-width: 850px) {
  .charts-grid {
    grid-template-columns: 1fr 1fr;
  }

  .evacuation-chart,
  .forecast-chart {
    grid-column: 1 / -1;
  }
}
</style>
