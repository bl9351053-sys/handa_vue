<template>
  <div class="hotline-container">
    <h1 class="page-title">📞 Emergency Hotlines</h1>
    <p class="subtitle">In case of emergency, contact any of the numbers below immediately.</p>

    <div class="hotline-grid">
      <div class="hotline-card">
        <h3>🚨 National Emergency Hotline</h3>
        <p class="number">911</p>
      </div>

      <div class="hotline-card">
        <h3>🔥 Bureau of Fire Protection (BFP)</h3>
        <p class="number">160</p>
      </div>

      <div class="hotline-card">
        <h3>👮 Philippine National Police (PNP)</h3>
        <p class="number">117</p>
      </div>

      <div class="hotline-card">
        <h3>❤️ Philippine Red Cross</h3>
        <p class="number">08 55 76543</p>
      </div>

      <div class="hotline-card">
        <h3>🏥 Nearest Hospital</h3>
        <p class="number">+63 (977) 020-9776</p>
      </div>

      <div class="hotline-card">
        <h3>🌧 PAGASA Weather Hotline</h3>
        <p class="number">(02) 8284-0800</p>
      </div>

      <div class="hotline-card">
        <h3>⚠️ NDRRMC Operations Center</h3>
        <p class="number">(02) 8911-5061</p>
      </div>

      <div class="hotline-card">
        <h3>🏛 Barangay Hall</h3>
        <p class="number">+63 (955) 786-9909</p>
      </div>
    </div>

    <!-- Important Reminders Section -->
    <div class="reminders-section">
      <h2 class="reminders-title">⚠️ Important Reminders</h2>
      <ul class="reminders-list">
        <li>Always keep your phone charged and accessible.</li>
        <li>Know the nearest evacuation area in your barangay.</li>
        <li>Have an emergency kit ready (water, food, flashlight, medicine).</li>
        <li>Follow local authorities’ instructions during emergencies.</li>
        <li>Keep emergency contact numbers saved and accessible.</li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: "HotlinesPage",
};
</script>

<style scoped>
.hotline-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.page-title {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #1b1d1f;
}

.subtitle {
  font-size: 14px;
  color: #4b4f56;
  margin-bottom: 25px;
}

.hotline-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.hotline-card {
  background: #ffffff;
  border-radius: 10px;
  padding: 20px;
  border: 1px solid #e3e4e8;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.hotline-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.hotline-card h3 {
  font-size: 18px;
  margin-bottom: 8px;
  color: #202124;
}

.number {
  font-size: 22px;
  font-weight: bold;
  color: #d9534f;
}

/* Important Reminders */
.reminders-section {
  margin-top: 40px;
  background: #fff7e6;
  border: 1px solid #ffe0b2;
  padding: 20px;
  border-radius: 10px;
}

.reminders-title {
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #d9534f;
}

.reminders-list {
  list-style: disc;
  padding-left: 20px;
  color: #4b4f56;
  line-height: 1.6;
}
</style>
