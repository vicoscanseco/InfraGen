
<script setup>
import AzureSelector from './components/AzureSelector.vue'
</script>

<template>
  <v-app>
    <v-main class="d-flex flex-column min-height-screen">
      <AzureSelector />
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
