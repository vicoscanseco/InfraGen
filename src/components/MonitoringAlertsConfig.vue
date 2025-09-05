<template>
  <v-card class="mb-4">
    <v-card-title class="bg-primary">
      <v-icon class="mr-2">mdi-chart-line</v-icon>
      Application Insights Configuration
    </v-card-title>
    <v-card-text>
      <v-row dense class="mt-3">
        <v-col cols="12" md="6">
          <v-tooltip location="top">
            <template v-slot:activator="{ props }">
              <v-text-field 
                v-bind="props"
                v-model="localConfig.name" 
                label="Nombre de Application Insights" 
                placeholder="Ej: my-app-insights" 
                density="compact" 
                variant="outlined" 
                :rules="[rules.required]"
                @input="updateConfig"
              />
            </template>
            <span>Nombre del recurso de Application Insights. Recopila telemetría, métricas de rendimiento, logs de aplicación y permite análisis de comportamiento de usuarios. Esencial para monitoreo en producción</span>
          </v-tooltip>
        </v-col>
        <v-col cols="12" md="6">
          <v-tooltip location="top">
            <template v-slot:activator="{ props }">
              <v-select 
                v-bind="props"
                v-model="localConfig.applicationType" 
                :items="applicationTypeOptions" 
                label="Tipo de Aplicación" 
                density="compact" 
                variant="outlined"
                @update:modelValue="updateConfig"
              />
            </template>
            <span>Tipo de aplicación para optimizar la recopilación de telemetría. Web: aplicaciones web, APIs REST. Mobile/Desktop: aplicaciones cliente. Afecta qué métricas y dashboards se muestran por defecto</span>
          </v-tooltip>
        </v-col>
      </v-row>
      
      <v-row dense>
        <v-col cols="12" md="6">
          <v-tooltip location="top">
            <template v-slot:activator="{ props }">
              <v-select 
                v-bind="props"
                v-model="localConfig.publicNetworkAccessForIngestion" 
                :items="networkAccessOptions" 
                label="Acceso de Red para Ingesta" 
                density="compact" 
                variant="outlined"
                @update:modelValue="updateConfig"
              />
            </template>
            <span>Controla cómo las aplicaciones pueden enviar telemetría a Application Insights. 'Habilitado': permite envío desde internet público. 'Deshabilitado': solo desde redes privadas configuradas</span>
          </v-tooltip>
        </v-col>
        <v-col cols="12" md="6">
          <v-tooltip location="top">
            <template v-slot:activator="{ props }">
              <v-select 
                v-bind="props"
                v-model="localConfig.publicNetworkAccessForQuery" 
                :items="networkAccessOptions" 
                label="Acceso de Red para Consultas" 
                density="compact" 
                variant="outlined"
                @update:modelValue="updateConfig"
              />
            </template>
            <span>Controla quién puede consultar los datos de Application Insights. 'Habilitado': acceso desde internet público (con autenticación). 'Deshabilitado': solo desde redes privadas configuradas</span>
          </v-tooltip>
        </v-col>
      </v-row>

      <v-row dense>
        <v-col cols="12">
          <v-tooltip location="top">
            <template v-slot:activator="{ props }">
              <v-switch 
                v-bind="props"
                v-model="localConfig.retentionInDays" 
                :label="`Retención de datos: ${localConfig.retentionInDays || 90} días`"
                density="compact"
                @update:modelValue="updateConfig"
              />
            </template>
            <span>Período de retención de datos de telemetría en Application Insights. Mínimo 30 días, máximo 730 días (2 años). Afecta costos de almacenamiento y disponibilidad de datos históricos para análisis</span>
          </v-tooltip>
          <v-slider
            v-model="localConfig.retentionInDays"
            :min="30"
            :max="730"
            :step="30"
            show-ticks="always"
            tick-size="4"
            @update:modelValue="updateConfig"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
  config: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:config', 'update'])

const localConfig = ref({
  name: 'my-app-insights',
  applicationType: 'web',
  publicNetworkAccessForIngestion: 'Enabled',
  publicNetworkAccessForQuery: 'Enabled',
  retentionInDays: 90,
  ...props.config
})

const applicationTypeOptions = [
  { title: 'Web Application', value: 'web' },
  { title: 'Mobile Application', value: 'other' },
  { title: 'Desktop Application', value: 'other' }
]

const networkAccessOptions = [
  { title: 'Habilitado', value: 'Enabled' },
  { title: 'Deshabilitado', value: 'Disabled' }
]

const rules = {
  required: value => !!value || 'Este campo es obligatorio'
}

const updateConfig = () => {
  emit('update:config', { ...localConfig.value })
  emit('update', { ...localConfig.value })
}

watch(localConfig, updateConfig, { deep: true })

onMounted(() => {
  updateConfig()
})
</script>
