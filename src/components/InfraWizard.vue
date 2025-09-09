<template>
  <v-app>
    <v-main class="d-flex flex-column min-height-screen">
      <v-container class="py-8">
        <v-card class="mx-auto" max-width="700">
          <v-card-title class="text-h5">Asistente de Configuración de Infraestructura Azure</v-card-title>
          <v-card-text>
            <v-stepper v-model="step">
              <v-stepper-header>
                <v-stepper-step :complete="step > 1" step="1">Tipo de Solución</v-stepper-step>
                <v-divider></v-divider>
                <v-stepper-step :complete="step > 2" step="2">Recursos Principales</v-stepper-step>
                <v-divider></v-divider>
                <v-stepper-step :complete="step > 3" step="3">Dependencias</v-stepper-step>
                <v-divider></v-divider>
                <v-stepper-step step="4">Resumen</v-stepper-step>
              </v-stepper-header>

              <v-stepper-items>
                <v-stepper-content step="1">
                  <v-select
                    v-model="solutionType"
                    :items="solutionTypes"
                    label="Selecciona el tipo de solución"
                  />
                  <v-btn color="primary" class="mt-4" @click="step = 2" :disabled="!solutionType">Siguiente</v-btn>
                </v-stepper-content>
                <v-stepper-content step="2">
                  <v-checkbox
                    v-for="resource in availableResources"
                    :key="resource.value"
                    v-model="selectedResources"
                    :label="resource.label"
                    :value="resource.value"
                  />
                  <v-btn class="mt-4 mr-2" @click="step = 1">Atrás</v-btn>
                  <v-btn color="primary" class="mt-4" @click="step = 3" :disabled="selectedResources.length === 0">Siguiente</v-btn>
                </v-stepper-content>
                <v-stepper-content step="3">
                  <v-alert type="info" class="mb-4">Configura dependencias entre recursos seleccionados.</v-alert>
                  <!-- Aquí iría la lógica de dependencias -->
                  <v-btn class="mt-4 mr-2" @click="step = 2">Atrás</v-btn>
                  <v-btn color="primary" class="mt-4" @click="step = 4">Siguiente</v-btn>
                </v-stepper-content>
                <v-stepper-content step="4">
                  <v-alert type="success" class="mb-4">¡Listo! Revisa tu configuración antes de generar el código.</v-alert>
                  <pre>{{ resumen }}</pre>
                  <v-btn class="mt-4 mr-2" @click="step = 3">Atrás</v-btn>
                  <v-btn color="primary" class="mt-4" @click="generarInfra">Generar Infraestructura</v-btn>
                </v-stepper-content>
              </v-stepper-items>
            </v-stepper>
          </v-card-text>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, computed } from 'vue'

const step = ref(1)
const solutionType = ref(null)
const solutionTypes = [
  'Web App Básica',
  'API Backend',
  'Microservicios',
  'Data Pipeline',
  'Otro'
]
const availableResources = [
  { label: 'App Service', value: 'appservice' },
  { label: 'App Service Plan', value: 'appserviceplan' },
  { label: 'SQL Server', value: 'sqlserver' },
  { label: 'SQL Database', value: 'sqldatabase' },
  { label: 'Storage Account', value: 'storage' },
  { label: 'Function App', value: 'functionapp' },
  { label: 'Container Registry', value: 'acr' },
  { label: 'Container App', value: 'containerapp' },
  { label: 'Application Insights', value: 'appinsights' }
]
const selectedResources = ref([])

const resumen = computed(() => {
  return {
    tipo: solutionType.value,
    recursos: selectedResources.value
  }
})

function generarInfra() {
  alert('¡Infraestructura generada! (demo)')
}
</script>

<style scoped>
pre {
  background: #f5f5f5;
  padding: 1em;
  border-radius: 6px;
}
</style>
