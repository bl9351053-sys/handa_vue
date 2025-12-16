<template>
  <div class="role-select-page">
    <div class="card">
      <h1 class="title">Choose Your Role</h1>
      <p class="subtitle">Select whether you want to go to the Admin app or the Resident portal.</p>

      <div class="options">
        <button class="option admin" @click="goAdmin" type="button">
          <div class="icon">🏢</div>
          <div class="label">Admin</div>
          <div class="desc">Go to the administration console.</div>
        </button>

        <button class="option resident" @click="goResident" type="button">
          <div class="icon">👥</div>
          <div class="label">Resident</div>
          <div class="desc">Continue to the Resident portal.</div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goAdmin = () => {
  localStorage.removeItem('token');
  router.push('/login');
};

const goResident = () => {
  router.push('/resident_pages/dashboard');
};
</script>

<style scoped>
.role-select-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #f6f8fb 0%, #eef3ff 100%);
  padding: 24px;
}

.card {
  width: 100%;
  max-width: 880px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(20, 30, 60, 0.08);
  padding: 32px;
  text-align: center;
}

.title {
  margin: 0 0 8px;
  font-size: 26px;
  color: #1f2d5a;
}

.subtitle {
  margin: 0 0 24px;
  color: #6b7280;
}

.options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18px;
}

.option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 22px;
  border-radius: 10px;
  text-decoration: none;
  color: inherit;
  border: 1px solid #eef2ff;
  background: linear-gradient(180deg, rgba(255,255,255,0.9), rgba(245,247,255,0.9));
  transition: transform 0.12s ease, box-shadow 0.12s ease;
  cursor: pointer;
}

.option:focus,
.option:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 30px rgba(31,45,90,0.08);
}

.option .icon {
  font-size: 36px;
  width: 72px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  margin-bottom: 12px;
  background: rgba(102,126,234,0.08);
}

.option.admin .icon { background: linear-gradient(135deg,#fef3c7, #fff7ed); }
.option.resident .icon { background: linear-gradient(135deg,#e6f4ff,#eef8ff); }

.option .label {
  font-weight: 700;
  font-size: 16px;
  margin-bottom: 4px;
  color: #10243b;
}

.option .desc {
  font-size: 13px;
  color: #6b7280;
}

@media (max-width: 700px) {
  .options { grid-template-columns: 1fr; }
  .card { padding: 20px; }
}

</style>
