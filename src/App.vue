

<script setup>
import { ref } from 'vue'
import AzureSelector from './components/AzureSelector.vue'
import ArchitectureView from './components/ArchitectureView.vue'
const page = ref('main')
</script>

<template>
  <v-app>
    <v-app-bar color="primary" dark>
      <v-toolbar-title>InfraGen v2.0</v-toolbar-title>
    </v-app-bar>
    <v-main class="d-flex flex-column min-height-screen">
      <AzureSelector v-if="page === 'main'" />
      <ArchitectureView v-else />
    </v-main>
  </v-app>
</template>

<style scoped>
.min-height-screen {
  min-height: 100vh;
}

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
