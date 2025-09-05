<template>
  <v-card class="mb-4">
    <v-card-title class="bg-primary">
      <v-icon class="mr-2">mdi-brain</v-icon>
      Cognitive Service Configuration
    </v-card-title>
    <v-card-text>
      <v-row dense class="mt-3">
        <v-col cols="12" md="6">
          <v-text-field 
            v-model="localConfig.name" 
            label="Nombre del Cognitive Service" 
            placeholder="Ej: my-openai-service" 
            density="compact" 
            variant="outlined" 
            :rules="[rules.required]"
            @input="updateConfig"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-select 
            v-model="localConfig.kind" 
            :items="cognitiveServiceKinds" 
            label="Tipo de Servicio" 
            density="compact" 
            variant="outlined"
            @update:modelValue="updateConfig"
          />
        </v-col>
      </v-row>
      
      <v-row dense>
        <v-col cols="12" md="6">
          <v-select 
            v-model="localConfig.sku" 
            :items="skuOptions" 
            label="SKU" 
            density="compact" 
            variant="outlined"
            @update:modelValue="updateConfig"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field 
            v-model="localConfig.customSubDomainName" 
            label="Subdominio Personalizado (Opcional)" 
            placeholder="Ej: my-custom-domain" 
            density="compact" 
            variant="outlined"
            @input="updateConfig"
          />
        </v-col>
      </v-row>

      <v-row dense>
        <v-col cols="12" md="6">
          <v-select 
            v-model="localConfig.publicNetworkAccess" 
            :items="networkAccessOptions" 
            label="Acceso de Red Pública" 
            density="compact" 
            variant="outlined"
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
  name: 'my-cognitive-service',
  kind: 'OpenAI',
  sku: 'S0',
  customSubDomainName: '',
  publicNetworkAccess: 'Enabled',
  ...props.config
})

const cognitiveServiceKinds = [
  { title: 'OpenAI', value: 'OpenAI' },
  { title: 'TextAnalytics', value: 'TextAnalytics' },
  { title: 'ComputerVision', value: 'ComputerVision' },
  { title: 'Face', value: 'Face' },
  { title: 'SpeechServices', value: 'SpeechServices' }
]

const skuOptions = [
  { title: 'Free (F0)', value: 'F0' },
  { title: 'Standard (S0)', value: 'S0' },
  { title: 'Standard (S1)', value: 'S1' },
  { title: 'Standard (S2)', value: 'S2' },
  { title: 'Standard (S3)', value: 'S3' }
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
