<template>
  <v-container class="fill-height d-flex flex-column align-center justify-center pa-2" fluid>
    <v-card class="mx-auto my-4 pa-4" max-width="800">
      <v-card-title class="text-h5 mb-3 text-center">Generador de Infraestructura</v-card-title>
      <v-divider class="mb-3" />
      <v-card-text>
        <!-- Campos principales en dos filas -->
        <v-row dense>
          <v-col cols="12" md="6">
            <v-select
              v-model="selectedEnv"
              :items="environments"
              item-title="label"
              item-value="value"
              label="Ambiente"
              density="compact"
              variant="outlined"
              required
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-select
              v-model="location"
              :items="locations"
              item-title="label"
              item-value="value"
              label="Ubicación"
              density="compact"
              variant="outlined"
              :rules="[v => !!v || 'La ubicación es obligatoria']"
              required
            />
          </v-col>
        </v-row>
        
        <v-row dense>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="appName"
              label="Nombre de la aplicación"
              density="compact"
              variant="outlined"
              :rules="[v => !!v || 'El nombre de la aplicación es obligatorio']"
              required
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="resourceGroup"
              label="Grupo de recursos"
              density="compact"
              variant="outlined"
              :rules="[v => !!v || 'El grupo de recursos es obligatorio']"
              required
              hint="Grupo común para todos los componentes"
              persistent-hint
            />
          </v-col>
        </v-row>
        
        <!-- Listado de componentes disponibles -->
        <v-row dense class="mt-2">
          <v-col cols="12">
            <v-label class="mb-1 font-weight-bold">Componentes disponibles:</v-label>
            <v-list lines="two" density="compact" class="pa-0">
              <v-list-item
                v-for="comp in availableComponents"
                :key="comp.value"
                :title="comp.label"
                :subtitle="comp.description"
                class="px-2"
              >
                <template v-slot:append>
                  <v-btn
                    color="primary"
                    size="small"
                    @click="addComponent(comp)"
                  >
                    Agregar
                  </v-btn>
                </template>
              </v-list-item>
            </v-list>
          </v-col>
        </v-row>

        <!-- Lista de componentes agregados -->
        <v-row v-if="configuredComponents.length > 0" dense class="mt-2">
          <v-col cols="12">
            <v-label class="mb-1 font-weight-bold">Componentes configurados:</v-label>
            <v-list lines="two" density="compact" class="pa-0">
              <v-list-item
                v-for="(item, index) in configuredComponents"
                :key="index"
                :title="item.label"
                :subtitle="`Nombre: ${item.config.name}`"
                class="px-2"
              >
                <template v-slot:append>
                  <v-btn
                    color="warning"
                    size="small"
                    variant="outlined"
                    @click="editComponent(item, index)"
                    class="me-1"
                  >
                    Editar
                  </v-btn>
                  <v-btn
                    color="error"
                    size="small"
                    variant="outlined"
                    @click="removeComponent(index)"
                  >
                    Eliminar
                  </v-btn>
                </template>
              </v-list-item>
            </v-list>
            <v-alert v-if="errorMsg" type="error" class="mt-2">{{ errorMsg }}</v-alert>
          </v-col>
        </v-row>
        
        <!-- Botón generar y resultado -->
        <v-btn class="mt-4" color="primary" @click="generateBicep" block>Generar archivo Bicep</v-btn>
        <div v-if="bicepContent && !errorMsg" class="bicep-output mt-4">
          <v-divider class="mb-3" />
          <div class="text-h6 mb-2">Archivo Bicep generado:</div>
          <v-card variant="outlined" class="mb-2">
            <v-card-text class="pa-0">
              <div class="code-container">
                <pre class="code-block"><code>{{ bicepContent }}</code></pre>
              </div>
            </v-card-text>
          </v-card>
          <div class="d-flex gap-2">
            <v-btn color="primary" @click="downloadBicep" prepend-icon="mdi-download">
              Descargar Bicep
            </v-btn>
            <v-btn color="secondary" variant="outlined" @click="copyToClipboard" prepend-icon="mdi-content-copy">
              Copiar
            </v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </v-container>

  <!-- Dialog de configuración -->
  <v-dialog v-model="configDialog" max-width="600" persistent>
    <v-card>
      <v-card-title class="py-3">Configurar {{ currentComponent?.label }}</v-card-title>
      <v-card-text class="py-2">
        <StorageAccountConfig v-if="currentComponent?.value === 'StorageAccount'" :config="currentConfig" />
        <AppServiceConfig v-if="currentComponent?.value === 'AppService'" :config="currentConfig" />
        <SqlDatabaseConfig v-if="currentComponent?.value === 'SqlDatabase'" :config="currentConfig" />
        <FunctionAppConfig v-if="currentComponent?.value === 'FunctionApp'" :config="currentConfig" />
      </v-card-text>
      <v-card-actions class="py-2">
        <v-spacer />
        <v-btn color="secondary" variant="outlined" @click="cancelConfig">Cancelar</v-btn>
        <v-btn color="primary" @click="saveConfig">Guardar</v-btn>
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
const resourceGroup = ref('')
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

const availableComponents = [
  { 
    value: 'StorageAccount', 
    label: 'Storage Account',
    description: 'Almacenamiento de objetos escalable en la nube'
  },
  { 
    value: 'AppService', 
    label: 'App Service',
    description: 'Plataforma para aplicaciones web y API'
  },
  { 
    value: 'SqlDatabase', 
    label: 'SQL Database',
    description: 'Base de datos relacional completamente administrada'
  },
  { 
    value: 'FunctionApp', 
    label: 'Function App',
    description: 'Computación sin servidor basada en eventos'
  }
]

const configuredComponents = ref([])
const bicepContent = ref('')
const errorMsg = ref('')
const configDialog = ref(false)
const currentComponent = ref(null)
const currentConfig = ref({})
const editingIndex = ref(-1)

function addComponent(component) {
  currentComponent.value = component
  
  // Configuración específica por tipo de componente
  if (component.value === 'StorageAccount') {
    currentConfig.value = {
      name: component.value.toLowerCase(),
      sku: 'Standard_LRS',
      kind: 'StorageV2',
      accessTier: 'Hot',
      httpsOnly: true,
      enableBlobPublicAccess: false
    }
  } else {
    currentConfig.value = {
      name: component.value.toLowerCase()
    }
  }
  
  editingIndex.value = -1
  configDialog.value = true
}

function editComponent(item, index) {
  currentComponent.value = availableComponents.find(c => c.value === item.value)
  currentConfig.value = { ...item.config }
  editingIndex.value = index
  configDialog.value = true
}

function removeComponent(index) {
  configuredComponents.value.splice(index, 1)
}

function saveConfig() {
  if (!currentConfig.value.name) {
    errorMsg.value = 'El nombre del componente es obligatorio.'
    return
  }

  const componentData = {
    value: currentComponent.value.value,
    label: currentComponent.value.label,
    config: { ...currentConfig.value }
  }

  if (editingIndex.value >= 0) {
    // Editando componente existente
    configuredComponents.value[editingIndex.value] = componentData
  } else {
    // Agregando nuevo componente
    configuredComponents.value.push(componentData)
  }

  configDialog.value = false
  errorMsg.value = ''
}

function cancelConfig() {
  configDialog.value = false
  errorMsg.value = ''
}

function generateBicep() {
  let content = ''
  errorMsg.value = ''

  if (!appName.value) {
    errorMsg.value = 'El nombre de la aplicación es obligatorio.'
    return
  }
  if (!resourceGroup.value) {
    errorMsg.value = 'El grupo de recursos es obligatorio.'
    return
  }
  if (!location.value) {
    errorMsg.value = 'La ubicación es obligatoria.'
    return
  }

  if (configuredComponents.value.length === 0) {
    bicepContent.value = ''
    errorMsg.value = 'Agrega al menos un componente para generar el archivo Bicep.'
    return
  }

  // Agregar parámetros al inicio
  content += `// Parámetros de la infraestructura
@description('Nombre de la aplicación')
param appName string = '${appName.value}'

@description('Ambiente de despliegue')
param environment string = '${selectedEnv.value}'

@description('Ubicación de los recursos')
param location string = '${location.value}'

@description('Grupo de recursos donde se crearán los componentes')
param resourceGroupName string = '${resourceGroup.value}'

@description('Tags comunes para todos los recursos')
param tags object = {
  Environment: environment
  Application: appName
  ManagedBy: '©CodeLand - Bicep Generator'
}

// Recursos
`

  configuredComponents.value.forEach(item => {
    const cfg = item.config
    if (item.value === 'StorageAccount') {
      content += `resource storageAccount_${cfg.name} 'Microsoft.Storage/storageAccounts@2022-09-01' = {
  name: '${cfg.name}'
  location: location
  sku: {
    name: '${cfg.sku || 'Standard_LRS'}'
  }
  kind: '${cfg.kind || 'StorageV2'}'
  properties: {
    accessTier: '${cfg.accessTier || 'Hot'}'
    supportsHttpsTrafficOnly: ${cfg.httpsOnly !== false}
    allowBlobPublicAccess: ${cfg.enableBlobPublicAccess === true}
    minimumTlsVersion: 'TLS1_2'
  }
  tags: tags
}

`
    }
    if (item.value === 'AppService') {
      content += `resource appService_${cfg.name} 'Microsoft.Web/sites@2022-03-01' = {
  name: '${cfg.name}'
  location: location
  properties: {
    serverFarmId: '${cfg.name}plan'
  }
  tags: tags
}

`
    }
    if (item.value === 'SqlDatabase') {
      content += `resource sqlDatabase_${cfg.name} 'Microsoft.Sql/servers/databases@2022-02-01-preview' = {
  name: '${cfg.name}'
  location: location
  properties: {
    edition: 'Basic'
  }
  tags: tags
}

`
    }
    if (item.value === 'FunctionApp') {
      content += `resource functionApp_${cfg.name} 'Microsoft.Web/sites@2022-03-01' = {
  name: '${cfg.name}'
  location: location
  kind: 'functionapp'
  properties: {
    serverFarmId: '${cfg.name}plan'
  }
  tags: tags
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

function copyToClipboard() {
  navigator.clipboard.writeText(bicepContent.value).then(() => {
    // Aquí podrías agregar un toast o notificación
    console.log('Código copiado al portapapeles')
  }).catch(err => {
    console.error('Error al copiar:', err)
  })
}
</script>

<style scoped>
.code-container {
  background-color: #1e1e1e;
  border-radius: 4px;
  overflow: hidden;
}

.code-block {
  background-color: #1e1e1e;
  color: #d4d4d4;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.4;
  margin: 0;
  padding: 16px;
  white-space: pre-wrap;
  word-break: break-word;
  overflow-x: auto;
  text-align: left;
}

.code-block code {
  background: none;
  color: inherit;
  font-family: inherit;
  font-size: inherit;
}
</style>