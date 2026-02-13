<template>
  <v-card class="mb-4">
    <v-card-title class="bg-primary">
      <v-icon class="mr-2">mdi-function</v-icon>
      Function App Configuration
    </v-card-title>
    <v-card-text>
      <v-row dense class="mt-3">
        <v-col cols="12" md="6">
          <v-tooltip location="top">
            <template v-slot:activator="{ props }">
              <v-text-field
                v-bind="props"
                :model-value="localFunctionBaseName"
                @update:model-value="updateFunctionBaseName"
                label="Nombre base de Function App"
                hint="Se añadirá automáticamente el sufijo del environment"
                persistent-hint
                density="compact"
                variant="outlined"
                :rules="[rules.required, rules.functionAppNameFormat]"
              />
            </template>
            <span>Nombre base del Function App. Se agregará automáticamente el sufijo del entorno (-dev, -prod). Debe ser único globalmente en Azure. Solo letras, números y guiones, 2-60 caracteres</span>
          </v-tooltip>
          
          <!-- Chip de preview del nombre final -->
          <div class="mt-2" v-if="computedFunctionName">
            <v-chip color="orange" variant="outlined" size="small">
              <v-icon left>mdi-eye</v-icon>
              Nombre final: {{ computedFunctionName }}
            </v-chip>
          </div>
        </v-col>
        
        <v-col cols="12" md="6">
          <v-tooltip location="top">
            <template v-slot:activator="{ props }">
              <v-text-field
                v-bind="props"
                :model-value="computedAppServicePlanName"
                label="Nombre del App Service Plan"
                hint="Se genera automáticamente"
                persistent-hint
                density="compact"
                variant="outlined"
                readonly
                append-inner-icon="mdi-lock"
              />
            </template>
            <span>Nombre del App Service Plan asociado al Function App. Se genera automáticamente basado en el nombre del Function App. Contiene la configuración de SKU y escalado</span>
          </v-tooltip>
        </v-col>
      </v-row>

      <v-row dense>
        <v-col cols="12" md="6">
          <v-tooltip location="top">
            <template v-slot:activator="{ props }">
              <v-select
                v-bind="props"
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
            </template>
            <span>Tipo de plan de hosting. Consumption: serverless, pago por ejecución, escala automático. Premium: pre-calentado, VNet, escala más rápida. Dedicated: recursos dedicados en App Service Plan</span>
          </v-tooltip>
        </v-col>
        <v-col cols="12" md="6">
          <v-tooltip location="top">
            <template v-slot:activator="{ props }">
              <v-select
                v-bind="props"
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
            </template>
            <span>SKU específico del plan. Y1: Consumption serverless. EP1-3: Elastic Premium con diferentes recursos. B1-P3V2: App Service Plans dedicados con CPU/memoria garantizada</span>
          </v-tooltip>
        </v-col>
      </v-row>

      <v-row dense>
        <v-col cols="12" md="6">
          <v-tooltip location="top">
            <template v-slot:activator="{ props }">
              <v-select
                v-bind="props"
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
            </template>
            <span>Lenguaje y versión de runtime para las funciones. .NET Isolated: modelo recomendado para .NET. Node.js/Python/Java: versiones específicas. PowerShell: para automatización y scripts</span>
          </v-tooltip>
        </v-col>
        <v-col cols="12" md="6">
          <v-tooltip location="top">
            <template v-slot:activator="{ props }">
              <v-select
                v-bind="props"
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
            </template>
            <span>Sistema operativo del Function App. Linux: más económico, soporta todos los runtimes modernos. Windows: requerido para .NET Framework, PowerShell, y algunas características específicas</span>
          </v-tooltip>
        </v-col>
      </v-row>

      <v-row dense>
        <v-col cols="12" md="6">
          <v-tooltip location="top">
            <template v-slot:activator="{ props }">
              <v-text-field
                v-bind="props"
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
            </template>
            <span>Storage Account requerido para Function Apps. Almacena código de funciones, logs de ejecución, y estado interno. Se genera automáticamente con formato 'sta{nombre}{entorno}' (solo letras minúsculas y números)</span>
          </v-tooltip>
        </v-col>
        <v-col cols="12" md="6" class="d-flex flex-column">
          <v-tooltip location="top">
            <template v-slot:activator="{ props }">
              <v-switch
                v-bind="props"
                :model-value="config.httpsOnly"
                @update:model-value="value => updateConfig('httpsOnly', value)"
                label="Solo HTTPS"
                density="compact"
                color="primary"
                hint="Forzar conexiones seguras HTTPS"
                persistent-hint
                class="mb-1"
              />
            </template>
            <span>Fuerza todas las conexiones HTTP a redirigir a HTTPS. Recomendado para seguridad. Todas las invocaciones de funciones requerirán conexiones encriptadas</span>
          </v-tooltip>
          <v-tooltip location="top">
            <template v-slot:activator="{ props }">
              <v-switch
                v-bind="props"
                :model-value="config.enableApplicationInsights"
                @update:model-value="value => updateConfig('enableApplicationInsights', value)"
                label="Application Insights"
                density="compact"
                color="primary"
                hint="Monitoreo y telemetría avanzada"
                persistent-hint
              />
            </template>
            <span>Habilita Application Insights para monitoreo avanzado. Recopila telemetría de ejecución, métricas de rendimiento, trazas de dependencias y logs detallados de las funciones</span>
          </v-tooltip>
        </v-col>
      </v-row>

      <v-row dense v-if="config.hostingPlan === 'Premium'">
        <v-col cols="12" md="6">
          <v-tooltip location="top">
            <template v-slot:activator="{ props }">
              <v-select
                v-bind="props"
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
            </template>
            <span>Número de instancias que permanecen "calientes" y listas para ejecutar funciones inmediatamente. Reduce latencia de arranque en frío. Solo disponible en planes Premium. Mínimo 1, máximo varía por SKU</span>
          </v-tooltip>
        </v-col>
        <v-col cols="12" md="6">
          <v-tooltip location="top">
            <template v-slot:activator="{ props }">
              <v-switch
                v-bind="props"
                :model-value="config.vnetIntegration"
                @update:model-value="value => updateConfig('vnetIntegration', value)"
                label="Integración con VNet"
                density="compact"
                color="primary"
                hint="Conectar a red virtual privada"
                persistent-hint
              />
            </template>
            <span>Integración con Virtual Network para acceso a recursos privados. Permite al Function App conectarse a bases de datos privadas, servicios internos y otros recursos en VNet sin exposición pública</span>
          </v-tooltip>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed, onMounted, ref, toRefs, watch } from 'vue'

const props = defineProps({
  config: {
    type: Object,
    required: true
  },
  environment: {
    type: String,
    required: true,
    default: 'dev'
  }
})

const emit = defineEmits(['update'])
const { config } = toRefs(props)

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

const localFunctionBaseName = ref('')

// Nombre principal de Function App basado en baseName + environment.
const computedFunctionName = computed(() => {
  const env = props.environment || 'dev'
  return localFunctionBaseName.value ? `${localFunctionBaseName.value}-${env}` : ''
})

const computedAppServicePlanName = computed(() => {
  return computedFunctionName.value ? `${computedFunctionName.value}-plan` : ''
})

const computedStorageAccountName = computed(() => {
  const env = props.environment || 'dev'
  return localFunctionBaseName.value ? `sta${localFunctionBaseName.value}${env}` : ''
})

const currentSkuOptions = computed(() => {
  return skuOptions[props.config.hostingPlan] || skuOptions.Consumption
})

// Emite el cambio puntual manteniendo el contrato actual del padre.
const updateConfig = (key, value) => {
  emit('update', { ...props.config, [key]: value })
}

const updateFunctionBaseName = (value) => {
  localFunctionBaseName.value = value
}

const updateHostingPlan = (value) => {
  const firstOption = currentSkuOptions.value[0]?.value || ''
  updateConfig('hostingPlan', value)
  updateConfig('sku', firstOption)
}

watch(localFunctionBaseName, () => {
  updateConfig('name', computedFunctionName.value)
  updateConfig('appServicePlanName', computedAppServicePlanName.value)
  updateConfig('storageAccountName', computedStorageAccountName.value)
})

watch(() => props.environment, () => {
  updateConfig('name', computedFunctionName.value)
  updateConfig('appServicePlanName', computedAppServicePlanName.value)
  updateConfig('storageAccountName', computedStorageAccountName.value)
})

watch(() => props.config.hostingPlan, () => {
  updateConfig('sku', currentSkuOptions.value[0]?.value || '')
})

onMounted(() => {
  if (!props.config.hostingPlan) updateConfig('hostingPlan', 'Consumption')
  if (!props.config.sku) updateConfig('sku', 'Y1')
  if (!props.config.runtimeStack) updateConfig('runtimeStack', 'DOTNET-ISOLATED|8.0')
  if (!props.config.operatingSystem) updateConfig('operatingSystem', 'Linux')
  if (props.config.httpsOnly === undefined) updateConfig('httpsOnly', true)
  if (props.config.enableApplicationInsights === undefined) updateConfig('enableApplicationInsights', true)
  if (!props.config.preWarmedInstances) updateConfig('preWarmedInstances', '1')
  if (props.config.vnetIntegration === undefined) updateConfig('vnetIntegration', false)

  if (props.config.name) {
    const env = props.environment || 'dev'
    const suffix = `-${env}`
    let baseName = props.config.name

    if (baseName.endsWith(suffix)) {
      baseName = baseName.replace(suffix, '')
    }

    localFunctionBaseName.value = baseName
  }
})
</script>


