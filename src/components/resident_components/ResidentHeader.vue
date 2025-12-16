<template>
	<header class="resident-header">
		<div class="brand">HANDA: Hazard Alert Navigation and Disaster Assistance</div>
		<div class="actions">
			<button class="btn" @click="refresh">Refresh</button>
		</div>
	</header>
</template>

<script setup>
function refresh() {
	window.dispatchEvent(new CustomEvent('resident-dashboard-refresh'));
}
</script>

<style scoped>
.resident-header {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	height: 56px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 16px;
	background: #6838d0;
	box-shadow: 0 2px 8px rgba(0,0,0,0.06);
	z-index: 1000;
}
.brand { font-weight: 700; color: #fff3f3; }
.actions .btn { background: #667eea; color: #fff; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; }
.actions .btn:hover { opacity: 0.95; }
</style>
