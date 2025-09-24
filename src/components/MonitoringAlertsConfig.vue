<template>
  <v-card class="mb-4">
    <v-card-title class="bg-primary">
      <v-icon class="mr-2">mdi-chart-line</v-icon>
      Application Insights Configuration
    </v-card-title>
    <v-card-text>
      <v-row dense class="mt-3">
        <v-col cols="12" md="6">
          <v-tooltip text="Define el nombre base de tu Application Insights. Se combinará automáticamente con el nombre de la app y ambiente para crear el nombre final único en Azure.">
            <template v-slot:activator="{ props }">
              <v-text-field 
                v-bind="props"
                v-model="localAppInsightsBaseName" 
                label="Nombre Base de Application Insights" 
                placeholder="Ej: webapp"
                density="compact" 
                variant="outlined"
                :rules="[rules.required, rules.appInsightsNameFormat]"
                hint="Solo letras, números y guiones. Se agregará automáticamente appname y environment."
                persistent-hint
                @input="updateAppInsightsBaseName($event.target.value)"
              />
            </template>
          </v-tooltip>
          <v-chip 
            v-if="computedAppInsightsName"
            size="small" 
            color="warning" 
            variant="outlined" 
            class="mt-1"
          >
            Nombre completo: {{ computedAppInsightsName }}
          </v-chip>
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
import { ref, watch, onMounted, computed } from 'vue'

const props = defineProps({
  config: {
    type: Object,
    default: () => ({})
  },
  appName: {
    type: String,
    default: ''
  },
  environment: {
    type: String,
    default: 'dev'
  }
})

const emit = defineEmits(['update:config', 'update'])

// Base name handling
const localAppInsightsBaseName = ref('')

// Computed Application Insights name
const computedAppInsightsName = computed(() => {
  if (!localAppInsightsBaseName.value || !props.appName || !props.environment) return ''
  const cleanAppName = props.appName.toLowerCase().replace(/[^a-z0-9]/g, '')
  const cleanBaseName = localAppInsightsBaseName.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
  
  // Para producción, no incluir environment
  if (props.environment === 'prod') {
    return `${cleanAppName}-${cleanBaseName}-ain`
  } else {
    return `${cleanAppName}-${cleanBaseName}-${props.environment}-ain`
  }
})

const localConfig = ref({
  name: '',
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
  required: value => !!value || 'Este campo es obligatorio',
  appInsightsNameFormat: value => {
    const pattern = /^[a-zA-Z0-9-]+$/
    return pattern.test(value) || 'Solo letras, números y guiones'
  }
}

// Update functions
const updateAppInsightsBaseName = (value) => {
  localAppInsightsBaseName.value = value
  localConfig.value.name = computedAppInsightsName.value
  updateConfig()
}

const updateConfig = () => {
  emit('update:config', { ...localConfig.value })
  emit('update', { ...localConfig.value })
}

// Watch for external config changes
watch(() => props.config, (newConfig) => {
  if (newConfig) {
    localConfig.value = { ...localConfig.value, ...newConfig }
  }
}, { deep: true, immediate: true })

// Watch for computed name changes
watch(computedAppInsightsName, (newName) => {
  if (newName) {
    localConfig.value.name = newName
    updateConfig()
  }
})

// Watch for app name or environment changes
watch([() => props.appName, () => props.environment], () => {
  if (localAppInsightsBaseName.value) {
    localConfig.value.name = computedAppInsightsName.value
    updateConfig()
  }
}, { immediate: true })

// Initialize component
onMounted(() => {
  // Set default base name if not provided
  if (!localAppInsightsBaseName.value && !localConfig.value.name) {
    localAppInsightsBaseName.value = 'webapp'
  }
  
  updateConfig()
})
</script>
