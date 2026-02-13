

<script setup>
import AzureSelector from './components/AzureSelector.vue'
</script>

<template>
  <v-app>
    <v-app-bar color="primary" dark>
      <v-toolbar-title>InfraGen v2.0</v-toolbar-title>
    </v-app-bar>
    <v-main class="d-flex flex-column min-height-screen">
      <!-- Mantener un único flujo canónico para reducir complejidad operativa. -->
      <AzureSelector />
    </v-main>
  </v-app>
</template>

<style scoped>
.min-height-screen {
  min-height: 100vh;
}
</style>
