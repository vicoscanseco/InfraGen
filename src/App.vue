

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
    <v-app-bar class="infragen-header" :elevation="0">
      <div class="header-brand d-flex align-center px-3">
        <div class="brand-icon-wrap mr-2">
          <v-icon class="brand-icon" size="18">mdi-hexagon-multiple</v-icon>
        </div>
        <span class="brand-name">InfraGen</span>
        <span class="brand-version ml-2">v2.0</span>
      </div>

      <v-spacer />

      <div class="d-flex align-center ga-1 pr-2">
        <v-tooltip text="Ver tutorial de uso">
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              icon="mdi-help-circle-outline"
              variant="text"
              class="header-btn"
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
              class="header-btn"
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
              class="header-btn"
              @click="toggleTheme"
            />
          </template>
        </v-tooltip>
      </div>
    </v-app-bar>

    <v-main class="d-flex flex-column min-height-screen">
      <AzureSelector />
    </v-main>

    <SettingsPanel v-model="showSettings" />
  </v-app>
</template>

<style scoped>
.infragen-header {
  background: linear-gradient(90deg, #040C1C 0%, #071528 50%, #040C1C 100%) !important;
  border-bottom: 1px solid rgba(14, 165, 233, 0.15) !important;
  position: relative;
  overflow: visible;
}

/* Animated glow line at the bottom of the header */
.infragen-header::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(14, 165, 233, 0.5) 25%,
    rgba(125, 211, 252, 0.7) 50%,
    rgba(14, 165, 233, 0.5) 75%,
    transparent 100%
  );
  animation: header-shimmer 4s ease-in-out infinite;
}

@keyframes header-shimmer {
  0%, 100% { opacity: 0.5; transform: scaleX(0.85); }
  50% { opacity: 1; transform: scaleX(1); }
}

.header-brand {
  height: 100%;
  gap: 0;
}

.brand-icon-wrap {
  width: 30px;
  height: 30px;
  border-radius: 7px;
  background: rgba(14, 165, 233, 0.15);
  border: 1px solid rgba(14, 165, 233, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.brand-icon {
  color: #38BDF8 !important;
}

.brand-name {
  font-family: 'Oxanium', sans-serif;
  font-weight: 700;
  font-size: 1.15rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #F0F9FF;
  line-height: 1;
}

.brand-version {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.6rem;
  color: rgba(125, 211, 252, 0.65);
  letter-spacing: 0.05em;
  padding: 2px 5px;
  border: 1px solid rgba(14, 165, 233, 0.2);
  border-radius: 3px;
  background: rgba(14, 165, 233, 0.07);
  align-self: center;
  line-height: 1.4;
}

.header-btn {
  color: rgba(186, 230, 253, 0.8) !important;
  transition: color 0.18s ease, background 0.18s ease;
}

.header-btn:hover {
  color: #F0F9FF !important;
  background: rgba(14, 165, 233, 0.12) !important;
}

.min-height-screen {
  min-height: 100vh;
}
</style>
