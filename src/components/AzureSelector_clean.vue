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
              readonly
              append-inner-icon="mdi-lock"
              hint="Se genera automáticamente: rg + ubicación + nombre de app"
              persistent-hint
            />
            
            <!-- Chip de preview del nombre del grupo de recursos -->
            <div class="mt-2" v-if="computedResourceGroupName">
              <v-chip color="blue" variant="outlined" size="small">
                <v-icon left>mdi-eye</v-icon>
                Preview: {{ computedResourceGroupName }}
              </v-chip>
            </div>
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
                :subtitle="`${item.value} - ${item.config?.name || 'Sin nombre'}`"
                class="px-2"
              >
                <template v-slot:prepend>
                  <v-avatar color="green" size="small">
                    <v-icon color="white" size="16">mdi-check</v-icon>
                  </v-avatar>
                </template>
                <template v-slot:append>
                  <v-btn
                    color="orange"
                    size="small"
                    class="me-2"
                    @click="editComponent(index)"
                  >
                    Editar
                  </v-btn>
                  <v-btn
                    color="red"
                    size="small"
                    @click="removeComponent(index)"
                  >
                    Quitar
                  </v-btn>
                </template>
              </v-list-item>
            </v-list>
          </v-col>
        </v-row>
        
        <!-- Botón para generar -->
        <v-row class="mt-4">
          <v-col cols="12" class="text-center">
            <v-btn
              color="primary"
              size="large"
              :disabled="configuredComponents.length === 0 || !appName || !location"
              @click="generateBicep"
            >
              <v-icon left>mdi-cog</v-icon>
              Generar Infraestructura
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Resultado del código Bicep -->
    <v-card v-if="bicepContent" class="mx-auto my-4 pa-4" max-width="800">
      <v-card-title class="text-h6 mb-3">
        Código Bicep Generado
        <v-spacer />
        <v-btn color="primary" size="small" class="me-2" @click="copyToClipboard">
          <v-icon left>mdi-content-copy</v-icon>
          Copiar
        </v-btn>
        <v-btn color="success" size="small" @click="downloadBicep">
          <v-icon left>mdi-download</v-icon>
          Descargar
        </v-btn>
      </v-card-title>
      <v-divider class="mb-3" />
      <div class="code-container">
        <pre class="code-block"><code>{{ bicepContent }}</code></pre>
      </div>
    </v-card>

    <!-- Mensaje de error -->
    <v-alert v-if="errorMsg" type="error" class="mt-4">
      {{ errorMsg }}
    </v-alert>

    <!-- Dialog de configuración -->
    <v-dialog v-model="configDialog" max-width="600px" persistent>
      <v-card>
        <v-card-title>
          Configurar {{ currentComponent?.label }}
        </v-card-title>
        <v-card-text>
          <!-- Aquí se cargarán dinámicamente los componentes de configuración -->
          <component
            :is="currentComponent?.value"
            v-if="currentComponent"
            :config="currentConfig"
            @update:config="updateCurrentConfig"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="grey" @click="cancelConfiguration">
            Cancelar
          </v-btn>
          <v-btn color="primary" @click="saveConfiguration">
            {{ editingIndex >= 0 ? 'Actualizar' : 'Agregar' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

// Reactive references
const environments = ref([])
const locations = ref([])
const selectedEnv = ref('dev')
const appName = ref('')
const resourceGroup = ref('')
const location = ref('mexicocentral')

// Computed property para generar nombre de grupo de recursos
const computedResourceGroupName = computed(() => {
  if (!appName.value || !location.value) return ''
  const currentLocation = locations.value.find(loc => loc.value === location.value)
  const shortName = currentLocation?.shortName || location.value.slice(0, 3)
  const cleanAppName = appName.value.toLowerCase().replace(/[^a-z0-9]/g, '')
  return 'rg' + shortName + cleanAppName
})

// Watch para actualizar el resourceGroup cuando cambie el computed
watch(computedResourceGroupName, (newName) => {
  resourceGroup.value = newName
})

// Cargar datos iniciales
onMounted(async () => {
  try {
    // Cargar ambientes
    const envRes = await fetch('/src/environments.json')
    if (!envRes.ok) {
      throw new Error(`Error al cargar ambientes: ${envRes.status}`)
    }
    const envData = await envRes.json()
    
    if (!envData || !Array.isArray(envData.environments)) {
      throw new Error('Formato inválido en environments.json')
    }
    
    environments.value = envData.environments
    
    // Cargar ubicaciones
    const locRes = await fetch('/src/locations.json')
    if (!locRes.ok) {
      throw new Error(`Error al cargar ubicaciones: ${locRes.status}`)
    }
    const locData = await locRes.json()
    
    if (!locData || !Array.isArray(locData.locations)) {
      throw new Error('Formato inválido en locations.json')
    }
    
    locations.value = locData.locations
    
  } catch (error) {
    console.error('Error al cargar datos:', error)
    errorMsg.value = 'Error al cargar la configuración inicial: ' + error.message
  }
})

// Componentes disponibles
const availableComponents = [
  { value: 'StorageAccount', label: 'Storage Account', description: 'Almacenamiento de Azure' },
  { value: 'AppServicePlan', label: 'App Service Plan', description: 'Plan de App Service' },
  { value: 'AppService', label: 'App Service', description: 'Aplicación web de Azure' },
  { value: 'CognitiveService', label: 'Cognitive Services', description: 'Servicios cognitivos de Azure' },
  { value: 'SQLServer', label: 'SQL Server', description: 'Servidor de base de datos SQL' },
  { value: 'SQLDatabase', label: 'SQL Database', description: 'Base de datos SQL' },
  { value: 'MonitoringAlerts', label: 'Application Insights', description: 'Monitoreo y telemetría' }
]

// Estado del componente
const configuredComponents = ref([])
const bicepContent = ref('')
const errorMsg = ref('')
const configDialog = ref(false)
const currentComponent = ref(null)
const currentConfig = ref({})
const editingIndex = ref(-1)

const updateCurrentConfig = (newConfig) => {
  currentConfig.value = newConfig
}

// Funciones del componente
const addComponent = (component) => {
  currentComponent.value = component
  currentConfig.value = {}
  editingIndex.value = -1
  configDialog.value = true
}

const editComponent = (index) => {
  const item = configuredComponents.value[index]
  currentComponent.value = availableComponents.find(comp => comp.value === item.value)
  currentConfig.value = { ...item.config }
  editingIndex.value = index
  configDialog.value = true
}

const removeComponent = (index) => {
  configuredComponents.value.splice(index, 1)
}

const saveConfiguration = () => {
  const newItem = {
    ...currentComponent.value,
    config: { ...currentConfig.value }
  }
  
  if (editingIndex.value >= 0) {
    configuredComponents.value[editingIndex.value] = newItem
  } else {
    configuredComponents.value.push(newItem)
  }
  
  configDialog.value = false
  currentComponent.value = null
  currentConfig.value = {}
  editingIndex.value = -1
}

const cancelConfiguration = () => {
  configDialog.value = false
  currentComponent.value = null
  currentConfig.value = {}
  editingIndex.value = -1
}

const generateBicep = () => {
  try {
    errorMsg.value = ''
    
    if (!appName.value || !location.value || configuredComponents.value.length === 0) {
      errorMsg.value = 'Por favor completa todos los campos requeridos y agrega al menos un componente.'
      return
    }

    // Configuración del scope a nivel de suscripción para crear el grupo de recursos
    let content = 'targetScope = \'subscription\'\n\n'
    
    // Parámetros de la infraestructura
    content += '// Parámetros de la infraestructura\n'
    content += '@description(\'Nombre de la aplicación\')\n'
    content += 'param appName string = \'' + appName.value + '\'\n\n'
    
    content += '@description(\'Ambiente de despliegue\')\n'
    content += 'param environment string = \'' + selectedEnv.value + '\'\n\n'
    
    content += '@description(\'Ubicación de los recursos\')\n'
    content += 'param location string = \'' + location.value + '\'\n\n'
    
    content += '@description(\'Grupo de recursos donde se crearán los componentes\')\n'
    content += 'param resourceGroupName string = \'' + resourceGroup.value + '\'\n\n'
    
    content += '@description(\'Tags comunes para todos los recursos\')\n'
    content += 'param tags object = {\n'
    content += '  Environment: environment\n'
    content += '  Application: appName\n'
    content += '  ManagedBy: \'©CodeLand - Bicep Generator\'\n'
    content += '}\n\n'
    
    // Crear grupo de recursos si no existe
    content += '// ============================================================================\n'
    content += '// CREAR GRUPO DE RECURSOS SI NO EXISTE\n'
    content += '// ============================================================================\n'
    content += 'resource resourceGroup \'Microsoft.Resources/resourceGroups@2021-04-01\' = {\n'
    content += '  name: resourceGroupName\n'
    content += '  location: location\n'
    content += '  tags: tags\n'
    content += '}\n\n'
    
    // Recursos dentro del grupo de recursos
    content += '// ============================================================================\n'
    content += '// RECURSOS DENTRO DEL GRUPO DE RECURSOS\n'
    content += '// ============================================================================\n\n'

    configuredComponents.value.forEach(item => {
      const cfg = item.config
      
      if (item.value === 'StorageAccount') {
        content += '// Storage Account ' + cfg.name + '\n'
        content += 'resource storageAccount_' + cfg.name + ' \'Microsoft.Storage/storageAccounts@2022-09-01\' = {\n'
        content += '  scope: resourceGroup\n'
        content += '  name: \'' + cfg.name + '\'\n'
        content += '  location: location\n'
        content += '  sku: {\n'
        content += '    name: \'' + (cfg.sku || 'Standard_LRS') + '\'\n'
        content += '  }\n'
        content += '  kind: \'' + (cfg.kind || 'StorageV2') + '\'\n'
        content += '  properties: {\n'
        content += '    accessTier: \'' + (cfg.accessTier || 'Hot') + '\'\n'
        content += '    supportsHttpsTrafficOnly: ' + (cfg.httpsOnly !== false) + '\n'
        content += '    allowBlobPublicAccess: ' + (cfg.enableBlobPublicAccess === true) + '\n'
        content += '    minimumTlsVersion: \'TLS1_2\'\n'
        content += '  }\n'
        content += '  tags: tags\n'
        content += '}\n\n'
      }
      
      if (item.value === 'AppServicePlan') {
        content += '// App Service Plan ' + cfg.name + '\n'
        content += 'resource appServicePlan_' + cfg.name.replace(/[^a-zA-Z0-9]/g, '') + ' \'Microsoft.Web/serverfarms@2022-03-01\' = {\n'
        content += '  scope: resourceGroup\n'
        content += '  name: \'' + cfg.name + '\'\n'
        content += '  location: location\n'
        content += '  sku: {\n'
        content += '    name: \'' + (cfg.sku || 'B1') + '\'\n'
        content += '  }\n'
        content += '  kind: \'' + (cfg.os === 'Windows' ? 'app' : 'linux') + '\'\n'
        content += '  properties: {\n'
        content += '    reserved: ' + (cfg.os !== 'Windows') + '\n'
        content += '    perSiteScaling: ' + (cfg.perSiteScaling === true) + '\n'
        if (cfg.zoneRedundant && cfg.sku && cfg.sku.startsWith('P')) {
          content += '    zoneRedundant: ' + cfg.zoneRedundant + '\n'
        }
        if (cfg.maximumElasticWorkerCount && ['P1v2', 'P2v2', 'P3v2', 'P1v3', 'P2v3', 'P3v3'].includes(cfg.sku)) {
          content += '    maximumElasticWorkerCount: ' + cfg.maximumElasticWorkerCount + '\n'
        }
        content += '  }\n'
        content += '  tags: tags\n'
        content += '}\n\n'
      }
      
      if (item.value === 'AppService') {
        content += '// App Service ' + cfg.name + '\n'
        content += 'resource appService_' + cfg.name.replace(/[^a-zA-Z0-9]/g, '') + ' \'Microsoft.Web/sites@2022-03-01\' = {\n'
        content += '  scope: resourceGroup\n'
        content += '  name: \'' + cfg.name + '\'\n'
        content += '  location: location\n'
        content += '  kind: \'' + (cfg.kind || 'app') + '\'\n'
        if (cfg.appServicePlan) {
          content += '  dependsOn: [\n'
          content += '    appServicePlan_' + cfg.appServicePlan.replace(/[^a-zA-Z0-9]/g, '') + '\n'
          content += '  ]\n'
        }
        content += '  properties: {\n'
        if (cfg.appServicePlan) {
          content += '    serverFarmId: appServicePlan_' + cfg.appServicePlan.replace(/[^a-zA-Z0-9]/g, '') + '.id\n'
        }
        content += '    siteConfig: {\n'
        content += '      appSettings: [\n'
        if (cfg.appSettings && cfg.appSettings.length > 0) {
          cfg.appSettings.forEach(setting => {
            content += '        {\n'
            content += '          name: \'' + setting.name + '\'\n'
            content += '          value: \'' + setting.value + '\'\n'
            content += '        }\n'
          })
        }
        content += '      ]\n'
        if (cfg.ftpsState) {
          content += '      ftpsState: \'' + cfg.ftpsState + '\'\n'
        }
        if (cfg.minTlsVersion) {
          content += '      minTlsVersion: \'' + cfg.minTlsVersion + '\'\n'
        }
        if (cfg.http20Enabled) {
          content += '      http20Enabled: ' + cfg.http20Enabled + '\n'
        }
        if (cfg.alwaysOn !== undefined) {
          content += '      alwaysOn: ' + cfg.alwaysOn + '\n'
        }
        content += '    }\n'
        content += '    httpsOnly: ' + (cfg.httpsOnly !== false) + '\n'
        content += '    clientAffinityEnabled: ' + (cfg.clientAffinityEnabled !== false) + '\n'
        content += '  }\n'
        content += '  tags: tags\n'
        content += '}\n\n'
      }
      
      if (item.value === 'CognitiveService') {
        content += '// Cognitive Service ' + cfg.name + '\n'
        content += 'resource cognitiveService_' + cfg.name.replace(/[^a-zA-Z0-9]/g, '') + ' \'Microsoft.CognitiveServices/accounts@2023-05-01\' = {\n'
        content += '  scope: resourceGroup\n'
        content += '  name: \'' + cfg.name + '\'\n'
        content += '  location: location\n'
        content += '  sku: {\n'
        content += '    name: \'' + (cfg.sku || 'S0') + '\'\n'
        content += '  }\n'
        content += '  kind: \'' + (cfg.kind || 'OpenAI') + '\'\n'
        content += '  properties: {\n'
        content += '    apiProperties: {}\n'
        if (cfg.customSubDomainName) {
          content += '    customSubDomainName: \'' + cfg.customSubDomainName + '\'\n'
        }
        content += '    publicNetworkAccess: \'' + (cfg.publicNetworkAccess || 'Enabled') + '\'\n'
        content += '  }\n'
        content += '  tags: tags\n'
        content += '}\n\n'
      }
      
      if (item.value === 'SQLServer') {
        content += '// SQL Server ' + cfg.name + '\n'
        content += 'resource sqlServer_' + cfg.name.replace(/[^a-zA-Z0-9]/g, '') + ' \'Microsoft.Sql/servers@2022-05-01-preview\' = {\n'
        content += '  scope: resourceGroup\n'
        content += '  name: \'' + cfg.name + '\'\n'
        content += '  location: location\n'
        content += '  properties: {\n'
        content += '    administratorLogin: \'' + (cfg.adminUsername || 'sqladmin') + '\'\n'
        content += '    administratorLoginPassword: \'' + (cfg.adminPassword || 'P@ssw0rd123!') + '\'\n'
        content += '    version: \'' + (cfg.version || '12.0') + '\'\n'
        content += '    minimalTlsVersion: \'' + (cfg.minimalTlsVersion || '1.2') + '\'\n'
        content += '    publicNetworkAccess: \'' + (cfg.publicNetworkAccess || 'Enabled') + '\'\n'
        content += '  }\n'
        content += '  tags: tags\n'
        content += '}\n\n'
      }
      
      if (item.value === 'SQLDatabase') {
        content += '// SQL Database ' + cfg.name + '\n'
        content += 'resource sqlDatabase_' + cfg.name.replace(/[^a-zA-Z0-9]/g, '') + ' \'Microsoft.Sql/servers/databases@2022-05-01-preview\' = {\n'
        content += '  scope: resourceGroup\n'
        if (cfg.sqlServer) {
          content += '  parent: sqlServer_' + cfg.sqlServer.replace(/[^a-zA-Z0-9]/g, '') + '\n'
        }
        content += '  name: \'' + cfg.name + '\'\n'
        content += '  location: location\n'
        content += '  sku: {\n'
        content += '    name: \'' + (cfg.sku || 'Basic') + '\'\n'
        content += '    tier: \'' + (cfg.tier || 'Basic') + '\'\n'
        if (cfg.capacity) {
          content += '    capacity: ' + cfg.capacity + '\n'
        }
        content += '  }\n'
        content += '  properties: {\n'
        if (cfg.maxSizeBytes) {
          content += '    maxSizeBytes: ' + cfg.maxSizeBytes + '\n'
        }
        if (cfg.readScale) {
          content += '    readScale: \'' + cfg.readScale + '\'\n'
        }
        if (cfg.zoneRedundant) {
          content += '    zoneRedundant: ' + cfg.zoneRedundant + '\n'
        }
        content += '  }\n'
        content += '  tags: tags\n'
        content += '}\n\n'
      }
      
      if (item.value === 'MonitoringAlerts') {
        content += '// Application Insights ' + cfg.name + '\n'
        content += 'resource applicationInsights_' + cfg.name.replace(/[^a-zA-Z0-9]/g, '') + ' \'Microsoft.Insights/components@2020-02-02\' = {\n'
        content += '  scope: resourceGroup\n'
        content += '  name: \'' + cfg.name + '\'\n'
        content += '  location: location\n'
        content += '  kind: \'web\'\n'
        content += '  properties: {\n'
        content += '    Application_Type: \'web\'\n'
        content += '    publicNetworkAccessForIngestion: \'' + (cfg.publicNetworkAccessForIngestion || 'Enabled') + '\'\n'
        content += '    publicNetworkAccessForQuery: \'' + (cfg.publicNetworkAccessForQuery || 'Enabled') + '\'\n'
        content += '  }\n'
        content += '  tags: tags\n'
        content += '}\n\n'
      }
    })

    bicepContent.value = content
  } catch (error) {
    console.error('Error al generar Bicep:', error)
    errorMsg.value = 'Error al generar el código Bicep: ' + error.message
  }
}

const downloadBicep = () => {
  const blob = new Blob([bicepContent.value], { type: 'text/plain' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = 'infra.bicep'
  link.click()
}

const copyToClipboard = () => {
  navigator.clipboard.writeText(bicepContent.value).then(() => {
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
