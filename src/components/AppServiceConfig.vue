<template>
  <v-card class="mb-4" flat>
    <v-card-title class="text-subtitle-1 py-2">Configurar App Service</v-card-title>
    <v-card-text class="pt-2">
      <v-row dense>
        <v-col cols="12" md="6">
          <v-text-field 
            v-model="config.name" 
            label="Nombre del App Service" 
            placeholder="Ej: myappservice" 
            density="compact" 
            variant="outlined"
            :rules="[rules.required, rules.appServiceNameFormat]"
            hint="Solo letras, números y guiones, 2-60 caracteres"
            persistent-hint
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field 
            v-model="config.appServicePlanName" 
            label="Nombre del App Service Plan" 
            placeholder="Ej: myappservice-plan" 
            density="compact" 
            variant="outlined"
            :rules="[rules.required]"
            hint="Plan que contendrá el App Service"
            persistent-hint
          />
        </v-col>
      </v-row>

      <v-row dense>
        <v-col cols="12" md="6">
          <v-select
            v-model="config.sku"
            :items="skuOptions"
            label="SKU del App Service Plan"
            item-title="label"
            item-value="value"
            density="compact"
            variant="outlined"
            hint="Nivel de rendimiento y precios"
            persistent-hint
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-select
            v-model="config.runtimeStack"
            :items="runtimeStackOptions"
            label="Runtime Stack"
            item-title="label"
            item-value="value"
            density="compact"
            variant="outlined"
            hint="Tecnología de la aplicación"
            persistent-hint
          />
        </v-col>
      </v-row>

      <v-row dense>
        <v-col cols="12" md="6">
          <v-select
            v-model="config.operatingSystem"
            :items="operatingSystemOptions"
            label="Sistema Operativo"
            item-title="label"
            item-value="value"
            density="compact"
            variant="outlined"
            hint="OS del App Service Plan"
            persistent-hint
          />
        </v-col>
        <v-col cols="12" md="6" class="d-flex flex-column">
          <v-switch
            v-model="config.httpsOnly"
            label="Solo HTTPS"
            density="compact"
            color="primary"
            hint="Redirigir HTTP a HTTPS automáticamente"
            persistent-hint
            class="mb-1"
          />
          <v-switch
            v-model="config.alwaysOn"
            label="Always On"
            density="compact"
            color="primary"
            hint="Mantener la aplicación cargada todo el tiempo"
            persistent-hint
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  config: {
    type: Object,
    required: true
  }
})

// Inicializar valores por defecto si no existen
if (!props.config.appServicePlanName) props.config.appServicePlanName = `${props.config.name || 'myapp'}-plan`
if (!props.config.sku) props.config.sku = 'B1'
if (!props.config.runtimeStack) props.config.runtimeStack = 'DOTNETCORE|8.0'
if (!props.config.operatingSystem) props.config.operatingSystem = 'Linux'
if (props.config.httpsOnly === undefined) props.config.httpsOnly = true
if (props.config.alwaysOn === undefined) props.config.alwaysOn = false

const skuOptions = [
  { label: 'Free F1 (Desarrollo)', value: 'F1' },
  { label: 'Shared D1 (Desarrollo)', value: 'D1' },
  { label: 'Basic B1 (Pequeño)', value: 'B1' },
  { label: 'Basic B2 (Mediano)', value: 'B2' },
  { label: 'Basic B3 (Grande)', value: 'B3' },
  { label: 'Standard S1 (Pequeño)', value: 'S1' },
  { label: 'Standard S2 (Mediano)', value: 'S2' },
  { label: 'Standard S3 (Grande)', value: 'S3' },
  { label: 'Premium P1V2 (Pequeño)', value: 'P1V2' },
  { label: 'Premium P2V2 (Mediano)', value: 'P2V2' },
  { label: 'Premium P3V2 (Grande)', value: 'P3V2' }
]

const runtimeStackOptions = [
  { label: '.NET 8.0', value: 'DOTNETCORE|8.0' },
  { label: '.NET 6.0', value: 'DOTNETCORE|6.0' },
  { label: '.NET Framework 4.8', value: 'ASPNET|4.8' },
  { label: 'Node.js 20 LTS', value: 'NODE|20-lts' },
  { label: 'Node.js 18 LTS', value: 'NODE|18-lts' },
  { label: 'Python 3.11', value: 'PYTHON|3.11' },
  { label: 'Python 3.10', value: 'PYTHON|3.10' },
  { label: 'Java 17', value: 'JAVA|17-java17' },
  { label: 'Java 11', value: 'JAVA|11-java11' },
  { label: 'PHP 8.2', value: 'PHP|8.2' }
]

const operatingSystemOptions = [
  { label: 'Linux', value: 'Linux' },
  { label: 'Windows', value: 'Windows' }
]

const rules = {
  required: value => !!value || 'Este campo es obligatorio',
  appServiceNameFormat: value => {
    if (!value) return true
    const regex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,58}[a-zA-Z0-9]$/
    return regex.test(value) || 'Solo letras, números y guiones, 2-60 caracteres. Debe empezar y terminar con letra o número'
  }
}
</script>


