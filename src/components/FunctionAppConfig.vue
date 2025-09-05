<template>
  <v-card class="mb-4">
    <v-card-title class="bg-primary">
      <v-icon class="mr-2">mdi-function</v-icon>
      Function App Configuration
    </v-card-title>
    <v-card-text>
      <v-row dense>
        <v-col cols="12" md="6">
          <v-text-field
            :model-value="localFunctionBaseName"
            @update:model-value="updateFunctionBaseName"
            label="Nombre base de Function App"
            hint="Se añadirá automáticamente el sufijo del environment"
            persistent-hint
            density="compact"
            variant="outlined"
            :rules="[rules.required, rules.functionAppNameFormat]"
          />
          
          <!-- Chip de preview del nombre final -->
          <div class="mt-2" v-if="computedFunctionName">
            <v-chip color="orange" variant="outlined" size="small">
              <v-icon left>mdi-eye</v-icon>
              Nombre final: {{ computedFunctionName }}
            </v-chip>
          </div>
        </v-col>
        
        <v-col cols="12" md="6">
          <v-text-field
            :model-value="computedAppServicePlanName"
            label="Nombre del App Service Plan"
            hint="Se genera automáticamente"
            persistent-hint
            density="compact"
            variant="outlined"
            readonly
            append-inner-icon="mdi-lock"
          />
        </v-col>
      </v-row>

      <v-row dense>
        <v-col cols="12" md="6">
          <v-select
            :model-value="config.hostingPlan"
            @update:model-value="updateHostingPlan"
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
            :model-value="config.sku"
            @update:model-value="value => updateConfig('sku', value)"
            :items="currentSkuOptions"
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
            :model-value="config.runtimeStack"
            @update:model-value="value => updateConfig('runtimeStack', value)"
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
            :model-value="config.operatingSystem"
            @update:model-value="value => updateConfig('operatingSystem', value)"
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
            :model-value="computedStorageAccountName"
            label="Storage Account (requerido)"
            hint="Se genera automáticamente (solo letras y números)"
            persistent-hint
            density="compact"
            variant="outlined"
            readonly
            append-inner-icon="mdi-lock"
            :rules="[rules.storageNameFormat]"
          />
        </v-col>
        <v-col cols="12" md="6" class="d-flex flex-column">
          <v-switch
            :model-value="config.httpsOnly"
            @update:model-value="value => updateConfig('httpsOnly', value)"
            label="Solo HTTPS"
            density="compact"
            color="primary"
            hint="Forzar conexiones seguras HTTPS"
            persistent-hint
            class="mb-1"
          />
          <v-switch
            :model-value="config.enableApplicationInsights"
            @update:model-value="value => updateConfig('enableApplicationInsights', value)"
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
            :model-value="config.preWarmedInstances"
            @update:model-value="value => updateConfig('preWarmedInstances', value)"
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
            :model-value="config.vnetIntegration"
            @update:model-value="value => updateConfig('vnetIntegration', value)"
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

<script>
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

export default {
  name: 'FunctionAppConfig',
  props: {
    config: {
      type: Object,
      required: true
    },
    environment: {
      type: String,
      required: true,
      default: 'dev'
    }
  },
  emits: ['update'],
  data() {
    return {
      localFunctionBaseName: ''
    }
  },
  computed: {
    computedFunctionName() {
      const env = this.environment || 'dev'
      return this.localFunctionBaseName ? `${this.localFunctionBaseName}-${env}` : ''
    },
    computedAppServicePlanName() {
      return this.computedFunctionName ? `${this.computedFunctionName}-plan` : ''
    },
    computedStorageAccountName() {
      const env = this.environment || 'dev'
      // Storage accounts no pueden tener guiones
      return this.localFunctionBaseName ? `sta${this.localFunctionBaseName}${env}` : ''
    },
    hostingPlanOptions() {
      return hostingPlanOptions
    },
    currentSkuOptions() {
      return skuOptions[this.config.hostingPlan] || skuOptions.Consumption
    },
    runtimeStackOptions() {
      return runtimeStackOptions
    },
    operatingSystemOptions() {
      return operatingSystemOptions
    },
    preWarmedInstanceOptions() {
      return preWarmedInstanceOptions
    },
    rules() {
      return {
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
    }
  },
  watch: {
    localFunctionBaseName(newValue) {
      this.updateConfig('name', this.computedFunctionName)
      this.updateConfig('appServicePlanName', this.computedAppServicePlanName)
      this.updateConfig('storageAccountName', this.computedStorageAccountName)
    },
    environment(newValue) {
      // Update computed names when environment changes
      this.updateConfig('name', this.computedFunctionName)
      this.updateConfig('appServicePlanName', this.computedAppServicePlanName)
      this.updateConfig('storageAccountName', this.computedStorageAccountName)
    },
    'config.hostingPlan'() {
      // Reset SKU when hosting plan changes
      this.updateConfig('sku', this.currentSkuOptions[0]?.value || '')
    }
  },
  mounted() {
    // Initialize default values
    if (!this.config.hostingPlan) this.updateConfig('hostingPlan', 'Consumption')
    if (!this.config.sku) this.updateConfig('sku', 'Y1')
    if (!this.config.runtimeStack) this.updateConfig('runtimeStack', 'DOTNET-ISOLATED|8.0')
    if (!this.config.operatingSystem) this.updateConfig('operatingSystem', 'Linux')
    if (this.config.httpsOnly === undefined) this.updateConfig('httpsOnly', true)
    if (this.config.enableApplicationInsights === undefined) this.updateConfig('enableApplicationInsights', true)
    if (!this.config.preWarmedInstances) this.updateConfig('preWarmedInstances', '1')
    if (this.config.vnetIntegration === undefined) this.updateConfig('vnetIntegration', false)

    // Initialize localFunctionBaseName from existing name
    if (this.config.name) {
      const env = this.environment || 'dev'
      const suffix = `-${env}`
      
      let baseName = this.config.name
      
      // Remove environment suffix if present
      if (baseName.endsWith(suffix)) {
        baseName = baseName.replace(suffix, '')
      }
      
      this.localFunctionBaseName = baseName
    }
  },
  methods: {
    updateConfig(key, value) {
      this.$emit('update', { ...this.config, [key]: value })
    },
    updateFunctionBaseName(value) {
      this.localFunctionBaseName = value
    },
    updateHostingPlan(value) {
      // Reset SKU when hosting plan changes
      const firstOption = this.currentSkuOptions[0]?.value || ''
      this.updateConfig('hostingPlan', value)
      this.updateConfig('sku', firstOption)
    }
  }
}
</script>


