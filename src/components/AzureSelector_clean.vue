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
          const generateBicep = () => {
            try {
              errorMsg.value = ''

              if (!appName.value || !location.value || configuredComponents.value.length === 0) {
                errorMsg.value = 'Por favor completa todos los campos requeridos y agrega al menos un componente.'
                return
              }

              const { generateMain } = await import('../utils/bicepGenerator.js')

              const result = generateMain({
                appName: appName.value,
                location: location.value,
                components: configuredComponents.value,
                parameters: { environment: selectedEnv.value }
              })

              bicepContent.value = result.mainBicep
            } catch (error) {
              console.error('Error al generar Bicep (clean):', error)
              errorMsg.value = 'Error al generar el código Bicep: ' + error.message
            }
          }
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

    // Parámetros de la infraestructura
    let content = '// Parámetros de la infraestructura\n'
    content += '@description(\'Nombre de la aplicación\')\n'
    content += 'param appName string = \'' + appName.value + '\'\n\n'
    
    content += '@description(\'Ambiente de despliegue\')\n'
    content += 'param environment string = \'' + selectedEnv.value + '\'\n\n'
    
    content += '@description(\'Ubicación de los recursos\')\n'
    content += 'param location string = \'' + location.value + '\'\n\n'
    
    content += '@description(\'Tags comunes para todos los recursos\')\n'
    content += 'param tags object = {\n'
    content += '  Environment: environment\n'
    content += '  Application: appName\n'
    content += '  ManagedBy: \'©CodeLand - Bicep Generator\'\n'
    content += '}\n\n'
    
    // Recursos de la infraestructura
    content += '// ============================================================================\n'
    content += '// RECURSOS DE LA INFRAESTRUCTURA\n'
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
