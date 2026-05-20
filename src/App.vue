

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTheme } from 'vuetify'
import AzureSelector from './components/AzureSelector.vue'
import SettingsPanel from './components/SettingsPanel.vue'
import { createAppTour } from './utils/appTour.js'

const showSettings = ref(false)

function startTour() {
  const tour = createAppTour()
  tour.drive()
}

const theme = useTheme()

const isDarkTheme = computed(() => theme.global.name.value === 'dark')

const toggleTheme = () => {
  const nextTheme = isDarkTheme.value ? 'light' : 'dark'
  theme.global.name.value = nextTheme
  localStorage.setItem('infragen-theme', nextTheme)
}

onMounted(() => {
  const savedTheme = localStorage.getItem('infragen-theme')
  if (savedTheme === 'dark' || savedTheme === 'light') {
    theme.global.name.value = savedTheme
    return
  }

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  theme.global.name.value = prefersDark ? 'dark' : 'light'
})
</script>

<template>
  <v-app>
    <v-app-bar color="primary">
      <v-toolbar-title>InfraGen v2.0</v-toolbar-title>
      <v-spacer />
      <v-tooltip text="Ver tutorial de uso">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            icon="mdi-help-circle-outline"
            variant="text"
            color="white"
            @click="startTour"
          />
        </template>
      </v-tooltip>
      <v-tooltip text="Configuración Azure DevOps">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            icon="mdi-cog"
            variant="text"
            color="white"
            @click="showSettings = true"
          />
        </template>
      </v-tooltip>
      <v-tooltip :text="isDarkTheme ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            :icon="isDarkTheme ? 'mdi-weather-sunny' : 'mdi-weather-night'"
            variant="text"
            color="white"
            @click="toggleTheme"
          />
        </template>
      </v-tooltip>
    </v-app-bar>
    <v-main class="d-flex flex-column min-height-screen">
      <!-- Mantener un único flujo canónico para reducir complejidad operativa. -->
      <AzureSelector />
    </v-main>

    <SettingsPanel v-model="showSettings" />
  </v-app>
</template>

<style scoped>
.min-height-screen {
  min-height: 100vh;
}
</style>
