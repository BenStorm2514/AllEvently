<script setup lang="ts">
import logo from '@/assets/AllEventlyLogo.png';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import router from "@/router";

function navigateToEventCreation() {
  router.push({ name: 'EventCreation' });
}
</script>

<template>
  <header class="top-panel">
    <button class="new-event-button" @click="navigateToEventCreation">
      <FontAwesomeIcon :icon="faPlus" /> NEW
    </button>
    <div class="logo">
      <img :src="logo" alt="Logo" class="logo-img" />
    </div>
  </header>
</template>

<style scoped>
.top-panel {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  max-width: 100%;
  height: 90px;
  background-color: #f0f3fa;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  z-index: 10;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  overflow: visible;
}

.logo {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin: 20px 0;
}

.logo-img {
  height: 120px;
  width: auto;
  margin-top: -20px;
}

.new-event-button {
  max-width: 150px;
  white-space: nowrap;
  background-color: #F7DDA8;
  border: none;
  color: #0D1821;
  padding: 10px 15px;
  font-size: 14px;
  border-radius: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px; /* Adds space between the icon and the text */
}

.new-event-button:hover {
  background-color: #FAC55A;
}
</style>