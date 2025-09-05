<template>
  <v-card class="mb-4">
    <v-card-title class="bg-primary">
      <v-icon class="mr-2">mdi-chart-line</v-icon>
      Application Insights Configuration
    </v-card-title>
    <v-card-text>
      <v-row dense>
        <v-col cols="12" md="6">
          <v-text-field 
            v-model="localConfig.name" 
            label="Nombre de Application Insights" 
            placeholder="Ej: my-app-insights" 
            density="compact" 
            variant="outlined" 
            :rules="[rules.required]"
            @input="updateConfig"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-select 
            v-model="localConfig.applicationType" 
            :items="applicationTypeOptions" 
            label="Tipo de Aplicación" 
            density="compact" 
            variant="outlined"
            @update:modelValue="updateConfig"
          />
        </v-col>
      </v-row>
      
      <v-row dense>
        <v-col cols="12" md="6">
          <v-select 
            v-model="localConfig.publicNetworkAccessForIngestion" 
            :items="networkAccessOptions" 
            label="Acceso de Red para Ingesta" 
            density="compact" 
            variant="outlined"
            @update:modelValue="updateConfig"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-select 
            v-model="localConfig.publicNetworkAccessForQuery" 
            :items="networkAccessOptions" 
            label="Acceso de Red para Consultas" 
            density="compact" 
            variant="outlined"
            @update:modelValue="updateConfig"
          />
        </v-col>
      </v-row>

      <v-row dense>
        <v-col cols="12">
          <v-switch 
            v-model="localConfig.retentionInDays" 
            :label="`Retención de datos: ${localConfig.retentionInDays || 90} días`"
            density="compact"
            @update:modelValue="updateConfig"
          />
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
