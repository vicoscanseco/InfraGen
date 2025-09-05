<template>
  <v-container class="fill-height d-flex flex-column align-center justify-center pa-0" fluid>
    <v-card class="mx-auto my-8 pa-6" max-width="600">
      <v-card-title class="text-h5 mb-4 text-center">Generador de Infraestructura</v-card-title>
      <v-divider class="mb-4" />
      <v-card-text>
        <!-- Selector de ambiente -->
        <v-row>
          <v-col cols="12">
            <v-select
              v-model="selectedEnv"
              :items="environments"
              item-title="label"
              item-value="value"
              label="Selecciona el ambiente"
              density="comfortable"
              variant="outlined"
              required
              class="mb-4"
            />
          </v-col>
        </v-row>
        
        <!-- Campo appName -->
        <v-row>
          <v-col cols="12">
            <v-text-field
              v-model="appName"
              label="Nombre de la aplicación"
              density="comfortable"
              variant="outlined"
              :rules="[v => !!v || 'El nombre de la aplicación es obligatorio']"
              required
              class="mb-4"
            />
          </v-col>
        </v-row>
        
        <!-- Campo location -->
        <v-row>
          <v-col cols="12">
            <v-select
              v-model="location"
              :items="locations"
              item-title="label"
              item-value="value"
              label="Ubicación (location)"
              density="comfortable"
              variant="outlined"
              :rules="[v => !!v || 'La ubicación es obligatoria']"
              required
              class="mb-4"
            />
          </v-col>
        </v-row>
        
        <!-- Selección de componentes -->
        <v-row>
          <v-col cols="12">
            <v-label class="mb-2 font-weight-bold">Selecciona los componentes:</v-label>
            <v-selection-control-group v-model="selectedComponents" multiple>
              <v-checkbox
                v-for="comp in components"
                :key="comp.value"
                :label="comp.label"
                :value="comp.value"
                color="primary"
              />
            </v-selection-control-group>
            <v-alert v-if="errorMsg" type="error" class="mt-4">{{ errorMsg }}</v-alert>
          </v-col>
        </v-row>
        
        <!-- Botón y popups de configuración -->
        <v-row v-for="comp in selectedComponents" :key="comp">
          <v-col cols="12" class="d-flex align-center">
            <span class="me-2">{{ components.find(c => c.value === comp)?.label }}</span>
            <v-btn size="small" color="primary" @click="openConfig(comp)">Configurar</v-btn>
          </v-col>
        </v-row>
        
        <!-- Botón generar y resultado -->
        <v-btn class="mt-6" color="primary" @click="generateBicep" block>Generar archivo Bicep</v-btn>
        <div v-if="bicepContent && !errorMsg" class="bicep-output mt-6">
          <v-divider class="mb-4" />
          <div class="text-h6 mb-2">Archivo Bicep generado:</div>
          <v-sheet color="#f0f4f8" rounded elevation="1" class="pa-4 mb-2">
            <pre style="white-space: pre-wrap; word-break: break-all;">{{ bicepContent }}</pre>
          </v-sheet>
          <v-btn color="primary" @click="downloadBicep">Descargar Bicep</v-btn>
        </div>
      </v-card-text>
    </v-card>
  </v-container>

  <!-- Dialogs de configuración -->
  <v-dialog v-for="comp in selectedComponents" :key="comp + '-dialog'" v-model="dialogs[comp]" max-width="500">
    <v-card>
      <v-card-title>Configurar {{ components.find(c => c.value === comp)?.label }}</v-card-title>
      <v-card-text>
        <StorageAccountConfig v-if="comp === 'StorageAccount' && componentConfig['StorageAccount']" :config="componentConfig['StorageAccount']" />
        <AppServiceConfig v-if="comp === 'AppService' && componentConfig['AppService']" :config="componentConfig['AppService']" />
        <SqlDatabaseConfig v-if="comp === 'SqlDatabase' && componentConfig['SqlDatabase']" :config="componentConfig['SqlDatabase']" />
        <FunctionAppConfig v-if="comp === 'FunctionApp' && componentConfig['FunctionApp']" :config="componentConfig['FunctionApp']" />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" @click="dialogs[comp] = false">Cerrar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, reactive, onMounted } from 'vue'
import StorageAccountConfig from './StorageAccountConfig.vue'
import AppServiceConfig from './AppServiceConfig.vue'
import SqlDatabaseConfig from './SqlDatabaseConfig.vue'
import FunctionAppConfig from './FunctionAppConfig.vue'

const environments = ref([])
const locations = ref([])
const selectedEnv = ref('dev')
const appName = ref('')
const location = ref('mexicocentral')

onMounted(async () => {
  try {
    // Cargar ambientes
    const envRes = await fetch('/src/environments.json')
    environments.value = await envRes.json()
  } catch (error) {
    console.error('Error loading environments:', error)
    // Fallback environments
    environments.value = [
      { label: 'Desarrollo', value: 'dev' },
      { label: 'Staging', value: 'staging' },
      { label: 'Producción', value: 'prod' }
    ]
  }

  try {
    // Cargar ubicaciones
    const locRes = await fetch('/src/locations.json')
    locations.value = await locRes.json()
  } catch (error) {
    console.error('Error loading locations:', error)
    // Fallback locations
    locations.value = [
      { label: 'East US', value: 'eastus' },
      { label: 'West US 2', value: 'westus2' },
      { label: 'Central US', value: 'centralus' }
    ]
  }
})

const components = [
  { value: 'StorageAccount', label: 'Storage Account' },
  { value: 'AppService', label: 'App Service' },
  { value: 'SqlDatabase', label: 'SQL Database' },
  { value: 'FunctionApp', label: 'Function App' }
]

const selectedComponents = ref([])
const bicepContent = ref('')
const componentConfig = reactive({})
const errorMsg = ref('')
const dialogs = reactive({})

function openConfig(comp) {
  dialogs[comp] = true
}

watch(selectedComponents, (newVal) => {
  // Inicializa la configuración para cada componente seleccionado
  newVal.forEach(comp => {
    if (!componentConfig[comp]) {
      componentConfig[comp] = {
        name: comp.toLowerCase(),
        resourceGroup: 'myResourceGroup'
      }
    }
  })
  // Elimina la configuración de los componentes no seleccionados
  Object.keys(componentConfig).forEach(key => {
    if (!newVal.includes(key)) {
      delete componentConfig[key]
    }
  })
})

function generateBicep() {
  let content = ''
  errorMsg.value = ''
  let hasError = false

  if (!appName.value) {
    errorMsg.value = 'El nombre de la aplicación es obligatorio.'
    return
  }
  if (!location.value) {
    errorMsg.value = 'La ubicación es obligatoria.'
    return
  }

  selectedComponents.value.forEach(comp => {
    const cfg = componentConfig[comp]
    if (!cfg || !cfg.name || !cfg.resourceGroup) {
      hasError = true
    }
  })

  if (hasError || selectedComponents.value.length === 0) {
    bicepContent.value = ''
    errorMsg.value = 'Completa todos los campos de nombre y grupo de recursos para cada componente.'
    return
  }

  selectedComponents.value.forEach(comp => {
    const cfg = componentConfig[comp]
    if (comp === 'StorageAccount') {
      content += `resource storageAccount 'Microsoft.Storage/storageAccounts@2022-09-01' = {
  name: '${cfg.name}'
  location: '${location.value}'
  resourceGroup: '${cfg.resourceGroup}'
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
}

`
    }
    if (comp === 'AppService') {
      content += `resource appService 'Microsoft.Web/sites@2022-03-01' = {
  name: '${cfg.name}'
  location: '${location.value}'
  resourceGroup: '${cfg.resourceGroup}'
  properties: {
    serverFarmId: '${cfg.name}plan'
  }
}

`
    }
    if (comp === 'SqlDatabase') {
      content += `resource sqlDatabase 'Microsoft.Sql/servers/databases@2022-02-01-preview' = {
  name: '${cfg.name}'
  location: '${location.value}'
  resourceGroup: '${cfg.resourceGroup}'
  properties: {
    edition: 'Basic'
  }
}

`
    }
    if (comp === 'FunctionApp') {
      content += `resource functionApp 'Microsoft.Web/sites@2022-03-01' = {
  name: '${cfg.name}'
  location: '${location.value}'
  resourceGroup: '${cfg.resourceGroup}'
  kind: 'functionapp'
  properties: {
    serverFarmId: '${cfg.name}plan'
  }
}

`
    }
  })
  bicepContent.value = content
}

function downloadBicep() {
  const blob = new Blob([bicepContent.value], { type: 'text/plain' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = 'infra.bicep'
  link.click()
}
</script>