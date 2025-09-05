<template>
  <v-card class="mb-4">
    <v-card-title class="bg-primary">
      <v-icon class="mr-2">mdi-brain</v-icon>
      Cognitive Service Configuration
    </v-card-title>
    <v-card-text>
      <v-row dense class="mt-3">
        <v-col cols="12" md="6">
          <v-tooltip location="top">
            <template v-slot:activator="{ props }">
              <v-text-field 
                v-bind="props"
                v-model="localConfig.name" 
                label="Nombre del Cognitive Service" 
                placeholder="Ej: my-openai-service" 
                density="compact" 
                variant="outlined" 
                :rules="[rules.required]"
                @input="updateConfig"
              />
            </template>
            <span>Nombre del recurso de Cognitive Service en Azure. Debe ser único en la suscripción y se usará para construir el endpoint de la API (nombre.cognitiveservices.azure.com)</span>
          </v-tooltip>
        </v-col>
        <v-col cols="12" md="6">
          <v-tooltip location="top">
            <template v-slot:activator="{ props }">
              <v-select 
                v-bind="props"
                v-model="localConfig.kind" 
                :items="cognitiveServiceKinds" 
                label="Tipo de Servicio" 
                density="compact" 
                variant="outlined"
                @update:modelValue="updateConfig"
              />
            </template>
            <span>Tipo de servicio cognitivo. OpenAI: GPT, ChatGPT, embeddings. TextAnalytics: análisis de sentimientos, entidades. ComputerVision: reconocimiento de imágenes. Face: detección facial. SpeechServices: texto a voz</span>
          </v-tooltip>
        </v-col>
      </v-row>
      
      <v-row dense>
        <v-col cols="12" md="6">
          <v-tooltip location="top">
            <template v-slot:activator="{ props }">
              <v-select 
                v-bind="props"
                v-model="localConfig.sku" 
                :items="skuOptions" 
                label="SKU" 
                density="compact" 
                variant="outlined"
                @update:modelValue="updateConfig"
              />
            </template>
            <span>Nivel de precio y límites del servicio. F0: gratuito con límites bajos. S0-S3: niveles estándar con diferentes cuotas de transacciones por minuto. S0 típicamente para desarrollo, S1+ para producción</span>
          </v-tooltip>
        </v-col>
        <v-col cols="12" md="6">
          <v-tooltip location="top">
            <template v-slot:activator="{ props }">
              <v-text-field 
                v-bind="props"
                v-model="localConfig.customSubDomainName" 
                label="Subdominio Personalizado (Opcional)" 
                placeholder="Ej: my-custom-domain" 
                density="compact" 
                variant="outlined"
                @input="updateConfig"
              />
            </template>
            <span>Subdominio personalizado para el endpoint. En lugar de {nombre}.cognitiveservices.azure.com usar {subdominio}.cognitiveservices.azure.com. Requerido para algunas características avanzadas como Private Endpoints</span>
          </v-tooltip>
        </v-col>
      </v-row>

      <v-row dense>
        <v-col cols="12" md="6">
          <v-tooltip location="top">
            <template v-slot:activator="{ props }">
              <v-select 
                v-bind="props"
                v-model="localConfig.publicNetworkAccess" 
                :items="networkAccessOptions" 
                label="Acceso de Red Pública" 
                density="compact" 
                variant="outlined"
                @update:modelValue="updateConfig"
              />
            </template>
            <span>Controla el acceso desde internet público. 'Habilitado': accesible desde cualquier IP. 'Deshabilitado': solo accesible mediante Private Endpoints o Service Endpoints desde redes virtuales específicas</span>
          </v-tooltip>
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
