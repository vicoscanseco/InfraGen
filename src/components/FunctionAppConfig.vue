<template>
  <v-card class="mb-4" flat>
    <v-card-title class="text-subtitle-1 py-2">Configurar Function App</v-card-title>
    <v-card-text class="pt-2">
      <v-row dense>
        <v-col cols="12" md="6">
          <v-text-field 
            v-model="config.name" 
            label="Nombre del Function App" 
            placeholder="Ej: myfunctionapp" 
            density="compact" 
            variant="outlined"
            :rules="[rules.required, rules.functionAppNameFormat]"
            hint="Solo letras, números y guiones, 2-60 caracteres"
            persistent-hint
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field 
            v-model="config.appServicePlanName" 
            label="Nombre del App Service Plan" 
            placeholder="Ej: myfunctionapp-plan" 
            density="compact" 
            variant="outlined"
            :rules="[rules.required]"
            hint="Plan que contendrá el Function App"
            persistent-hint
          />
        </v-col>
      </v-row>

      <v-row dense>
        <v-col cols="12" md="6">
          <v-select
            v-model="config.hostingPlan"
            :items="hostingPlanOptions"
            label="Plan de Hosting"
            item-title="label"
            item-value="value"
            density="compact"
            variant="outlined"
            hint="Tipo de plan de ejecución"
            persistent-hint
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-select
            v-model="config.sku"
            :items="getSkuOptions()"
            label="SKU del Plan"
            item-title="label"
            item-value="value"
            density="compact"
            variant="outlined"
            hint="Nivel de rendimiento y precios"
            persistent-hint
          />
        </v-col>
      </v-row>

      <v-row dense>
        <v-col cols="12" md="6">
          <v-select
            v-model="config.runtimeStack"
            :items="runtimeStackOptions"
            label="Runtime Stack"
            item-title="label"
            item-value="value"
            density="compact"
            variant="outlined"
            hint="Tecnología de la función"
            persistent-hint
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-select
            v-model="config.operatingSystem"
            :items="operatingSystemOptions"
            label="Sistema Operativo"
            item-title="label"
            item-value="value"
            density="compact"
            variant="outlined"
            hint="OS del Function App"
            persistent-hint
          />
        </v-col>
      </v-row>

      <v-row dense>
        <v-col cols="12" md="6">
          <v-text-field 
            v-model="config.storageAccountName" 
            label="Storage Account (requerido)" 
            placeholder="Ej: myfuncstorageaccount" 
            density="compact" 
            variant="outlined"
            :rules="[rules.required, rules.storageNameFormat]"
            hint="Storage para metadatos y triggers (solo minúsculas y números)"
            persistent-hint
          />
        </v-col>
        <v-col cols="12" md="6" class="d-flex flex-column">
          <v-switch
            v-model="config.httpsOnly"
            label="Solo HTTPS"
            density="compact"
            color="primary"
            hint="Forzar conexiones seguras HTTPS"
            persistent-hint
            class="mb-1"
          />
          <v-switch
            v-model="config.enableApplicationInsights"
            label="Application Insights"
            density="compact"
            color="primary"
            hint="Monitoreo y telemetría avanzada"
            persistent-hint
          />
        </v-col>
      </v-row>

      <v-row dense v-if="config.hostingPlan === 'Premium'">
        <v-col cols="12" md="6">
          <v-select
            v-model="config.preWarmedInstances"
            :items="preWarmedInstanceOptions"
            label="Instancias Pre-calentadas"
            item-title="label"
            item-value="value"
            density="compact"
            variant="outlined"
            hint="Instancias siempre listas para Premium"
            persistent-hint
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-switch
            v-model="config.vnetIntegration"
            label="Integración con VNet"
            density="compact"
            color="primary"
            hint="Conectar a red virtual privada"
            persistent-hint
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { defineProps, computed } from 'vue'

const props = defineProps({
  config: {
    type: Object,
    required: true
  }
})

// Inicializar valores por defecto si no existen
if (!props.config.appServicePlanName) props.config.appServicePlanName = `${props.config.name || 'myfunc'}-plan`
if (!props.config.hostingPlan) props.config.hostingPlan = 'Consumption'
if (!props.config.sku) props.config.sku = 'Y1'
if (!props.config.runtimeStack) props.config.runtimeStack = 'DOTNET-ISOLATED|8.0'
if (!props.config.operatingSystem) props.config.operatingSystem = 'Linux'
if (!props.config.storageAccountName) props.config.storageAccountName = `${props.config.name || 'myfunc'}storage`
if (props.config.httpsOnly === undefined) props.config.httpsOnly = true
if (props.config.enableApplicationInsights === undefined) props.config.enableApplicationInsights = true
if (!props.config.preWarmedInstances) props.config.preWarmedInstances = '1'
if (props.config.vnetIntegration === undefined) props.config.vnetIntegration = false

const hostingPlanOptions = [
  { label: 'Consumption (Serverless)', value: 'Consumption' },
  { label: 'Premium (Escalable)', value: 'Premium' },
  { label: 'Dedicated (App Service Plan)', value: 'Dedicated' }
]

const skuOptions = {
  Consumption: [
    { label: 'Y1 (Consumption)', value: 'Y1' }
  ],
  Premium: [
    { label: 'EP1 (Elastic Premium 1)', value: 'EP1' },
    { label: 'EP2 (Elastic Premium 2)', value: 'EP2' },
    { label: 'EP3 (Elastic Premium 3)', value: 'EP3' }
  ],
  Dedicated: [
    { label: 'B1 (Basic 1)', value: 'B1' },
    { label: 'B2 (Basic 2)', value: 'B2' },
    { label: 'B3 (Basic 3)', value: 'B3' },
    { label: 'S1 (Standard 1)', value: 'S1' },
    { label: 'S2 (Standard 2)', value: 'S2' },
    { label: 'S3 (Standard 3)', value: 'S3' },
    { label: 'P1V2 (Premium 1)', value: 'P1V2' },
    { label: 'P2V2 (Premium 2)', value: 'P2V2' },
    { label: 'P3V2 (Premium 3)', value: 'P3V2' }
  ]
}

const runtimeStackOptions = [
  { label: '.NET 8.0 Isolated', value: 'DOTNET-ISOLATED|8.0' },
  { label: '.NET 6.0 Isolated', value: 'DOTNET-ISOLATED|6.0' },
  { label: '.NET Framework 4.8', value: 'DOTNET|4.8' },
  { label: 'Node.js 20', value: 'NODE|20' },
  { label: 'Node.js 18', value: 'NODE|18' },
  { label: 'Python 3.11', value: 'PYTHON|3.11' },
  { label: 'Python 3.10', value: 'PYTHON|3.10' },
  { label: 'Python 3.9', value: 'PYTHON|3.9' },
  { label: 'Java 17', value: 'JAVA|17' },
  { label: 'Java 11', value: 'JAVA|11' },
  { label: 'PowerShell 7.2', value: 'POWERSHELL|7.2' }
]

const operatingSystemOptions = [
  { label: 'Linux', value: 'Linux' },
  { label: 'Windows', value: 'Windows' }
]

const preWarmedInstanceOptions = [
  { label: '1 instancia', value: '1' },
  { label: '2 instancias', value: '2' },
  { label: '3 instancias', value: '3' },
  { label: '5 instancias', value: '5' },
  { label: '10 instancias', value: '10' }
]

function getSkuOptions() {
  return skuOptions[props.config.hostingPlan] || skuOptions.Consumption
}

const rules = {
  required: value => !!value || 'Este campo es obligatorio',
  functionAppNameFormat: value => {
    if (!value) return true
    const regex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,58}[a-zA-Z0-9]$/
    return regex.test(value) || 'Solo letras, números y guiones, 2-60 caracteres. Debe empezar y terminar con letra o número'
  },
  storageNameFormat: value => {
    if (!value) return true
    const regex = /^[a-z0-9]{3,24}$/
    return regex.test(value) || 'Solo letras minúsculas y números, 3-24 caracteres'
  }
}
</script>


