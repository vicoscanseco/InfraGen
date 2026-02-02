<template>
  <v-container class="fill-height d-flex flex-column align-center justify-center pa-2" fluid>
    <v-card class="mx-auto my-4 pa-4" max-width="800">
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="text-h5 flex-grow-1 text-center pl-10">Generador de Infraestructura</span>
        <v-tooltip text="Limpiar configuración guardada y reiniciar formulario">
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              icon="mdi-delete-restore"
              variant="text"
              color="error"
              size="small"
              @click="clearLocalStorage"
            ></v-btn>
          </template>
        </v-tooltip>
      </v-card-title>
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
            <v-tooltip text="Selecciona la región de Azure donde se desplegarán tus recursos. Esto afecta los costos y la latencia.">
              <template v-slot:activator="{ props }">
                <v-select
                  v-bind="props"
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
              </template>
            </v-tooltip>
          </v-col>
        </v-row>
        
        <v-row dense>
          <v-col cols="12" md="6">
            <v-tooltip text="Nombre único para identificar tu aplicación en Azure. Se usará como prefijo para generar nombres de recursos.">
              <template v-slot:activator="{ props }">
                <v-text-field
                  v-bind="props"
                  v-model="appName"
                  label="Nombre de la aplicación"
                  density="compact"
                  variant="outlined"
                  :rules="[v => !!v || 'El nombre de la aplicación es obligatorio']"
                  required
                />
              </template>
            </v-tooltip>
          </v-col>
          <v-col cols="12" md="6">
            <v-tooltip text="El grupo de recursos se genera automáticamente combinando ubicación, nombre de la aplicación y ambiente. Para producción se omite el ambiente. Contiene todos los recursos relacionados.">
              <template v-slot:activator="{ props }">
                <v-text-field
                  v-bind="props"
                  v-model="resourceGroup"
                  label="Grupo de recursos"
                  density="compact"
                  variant="outlined"
                  readonly
                  append-inner-icon="mdi-lock"
                  hint="Se genera automáticamente: rg + ubicación + nombre de app + ambiente (prod sin ambiente)"
                  persistent-hint
                />
              </template>
            </v-tooltip>
            
            <!-- Chip de preview del nombre del grupo de recursos -->
            <div class="mt-2" v-if="computedResourceGroupName">
              <v-chip color="blue" variant="outlined" size="small">
                <v-icon left>mdi-eye</v-icon>
    <v-alert v-if="errorMsg" type="error" class="mt-4">
      {{ errorMsg }}
    </v-alert>

    <!-- Mensaje informativo -->
    <v-alert v-if="infoMsg" type="info" class="mt-4" dismissible @click:close="infoMsg = ''">
      {{ infoMsg }}
    </v-alert>

    <!-- Dialog de configuración -->
    <v-dialog v-model="configDialog" max-width="900px" persistent>
      <v-card>
        <v-card-title>
          Configurar {{ currentComponent?.label }}
        </v-card-title>
        <v-card-text>
          <!-- Aquí se cargarán dinámicamente los componentes de configuración -->
          <component
            :is="componentMapping[currentComponent?.value]"
            v-if="currentComponent && componentMapping[currentComponent?.value]"
            :config="currentConfig"
            :model-value="currentConfig"
            :app-name="appName"
            :environment="selectedEnv"
            :sql-server-name="sqlServerName"
            :available-app-service-plans="availableAppServicePlans"
            :available-sql-servers="availableSqlServers"
            :app-service-number="appServiceNumberForDialog"
            @update="updateCurrentConfig"
            @update:config="updateCurrentConfig"
            @update:model-value="updateCurrentConfig"
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

    <!-- Dialog de arquitectura -->
    <v-dialog v-model="showArchDialog" max-width="1000px">
      <v-card>
        <v-card-title class="text-h6">Vista de Arquitectura</v-card-title>
        <v-card-text style="min-height: 520px;">
          <ArchitectureView :components="configuredComponents" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" @click="showArchDialog = false">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <!-- Snackbar para notificaciones -->
    <v-snackbar v-model="showAutoSaveNotification" :timeout="2000" :color="notificationColor">
      <v-icon left>{{ notificationIcon }}</v-icon>
      {{ notificationMessage }}
    </v-snackbar>

    <!-- Footer -->
    <v-footer class="text-center d-flex flex-column mt-8">
      <div>
        <span class="text-body-2 text-grey-darken-2">
          © {{ new Date().getFullYear() }} CodeLand. Todos los derechos reservados.
        </span>
      </div>
    </v-footer>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import StorageAccountConfig from './StorageAccountConfig.vue'
import AppServicePlanConfig from './AppServicePlanConfig.vue'
import AppServiceConfig from './AppServiceConfig.vue'
import SqlDatabaseConfig from './SqlDatabaseConfig.vue'
import CognitiveServiceConfig from './CognitiveServiceConfig.vue'
import SQLServerConfig from './SQLServerConfig.vue'
import MonitoringAlertsConfig from './MonitoringAlertsConfig.vue'
import ContainerAppConfig from './ContainerAppConfig.vue'
import CostEstimator from './CostEstimator.vue'
import ArchitectureView from './ArchitectureView.vue'
import { generateMain } from '../utils/bicepGenerator.js'

// Mapeo de componentes
const componentMapping = {
  'StorageAccount': StorageAccountConfig,
  'AppServicePlan': AppServicePlanConfig,
  'AppService': AppServiceConfig,
  'CognitiveService': CognitiveServiceConfig,
  'SQLServer': SQLServerConfig,
  'SQLDatabase': SqlDatabaseConfig,
  'ContainerApp': ContainerAppConfig,
  'MonitoringAlerts': MonitoringAlertsConfig
}

// Reactive references
const environments = ref([])
const locations = ref([])
const selectedEnv = ref('dev')
const appName = ref('')
const resourceGroup = ref('')
const location = ref('mexicocentral')
const showArchDialog = ref(false)
const showAutoSaveNotification = ref(false)
const notificationMessage = ref('')
const notificationColor = ref('success')
const notificationIcon = ref('mdi-check')

// Estado del componente
const configuredComponents = ref([])
const bicepContent = ref('')
const deploymentCommands = ref('')
const errorMsg = ref('')
const infoMsg = ref('')
const configDialog = ref(false)
const currentComponent = ref(null)

// Computed property para generar nombre de grupo de recursos
const computedResourceGroupName = computed(() => {
  if (!appName.value || !location.value || !selectedEnv.value) return ''
  const currentLocation = locations.value.find(loc => loc.value === location.value)
  const shortName = currentLocation?.shortName || location.value.slice(0, 3)
  const cleanAppName = appName.value.toLowerCase().replace(/[^a-z0-9]/g, '')
  
  // Para producción, no incluir environment
  if (selectedEnv.value === 'prod') {
    return 'rg' + shortName + cleanAppName
  } else {
    return 'rg' + shortName + cleanAppName + selectedEnv.value
  }
})

// Watch para actualizar el resourceGroup cuando cambie el computed
watch(computedResourceGroupName, (newName) => {
  resourceGroup.value = newName
})

// Cargar datos iniciales
onMounted(async () => {
  try {
    // Cargar ambientes
    const envRes = await fetch('/environments.json')
    if (!envRes.ok) {
      throw new Error(`Error al cargar ambientes: ${envRes.status}`)
    }
    
    let envData
    try {
      envData = await envRes.json()
    } catch (jsonError) {
      throw new Error(`Error al parsear environments.json: ${jsonError.message}`)
    }
    
    if (!envData || !Array.isArray(envData)) {
      throw new Error('Formato inválido en environments.json - debe ser un array')
    }
    
    environments.value = envData
    
    // Cargar ubicaciones
    const locRes = await fetch('/locations.json')
    if (!locRes.ok) {
      throw new Error(`Error al cargar ubicaciones: ${locRes.status}`)
    }
    
    let locData
    try {
      locData = await locRes.json()
    } catch (jsonError) {
      throw new Error(`Error al parsear locations.json: ${jsonError.message}`)
    }
    
    if (!locData || !Array.isArray(locData)) {
      throw new Error('Formato inválido en locations.json - debe ser un array')
    }
    
    locations.value = locData
    

    
    // Cargar configuración guardada
    loadFromLocalStorage()
    
  } catch (error) {
    console.error('Error al cargar datos:', error)
    errorMsg.value = 'Error al cargar la configuración inicial: ' + error.message
  }
})

// Local Storage Logic
const saveToLocalStorage = () => {
  try {
    const config = {
      appName: appName.value,
      environment: selectedEnv.value,
      location: location.value,
      resourceGroupName: resourceGroup.value,
      components: configuredComponents.value,
      timestamp: new Date().toISOString()
    }
    localStorage.setItem('infragen-config', JSON.stringify(config))
    // No mostramos notificación en cada auto-save para no ser molestos
    // Solo logueamos en consola
    console.log('Configuration auto-saved', new Date().toLocaleTimeString())
  } catch (error) {
    console.error('Error saving to localStorage:', error)
  }
}

const loadFromLocalStorage = () => {
  try {
    const saved = localStorage.getItem('infragen-config')
    if (saved) {
      const config = JSON.parse(saved)
      
      // Validar que la configuración tenga la estructura esperada
      if (config.appName !== undefined) appName.value = config.appName
      if (config.environment !== undefined) selectedEnv.value = config.environment
      if (config.location !== undefined) location.value = config.location
      if (config.resourceGroupName !== undefined) resourceGroup.value = config.resourceGroupName
      if (config.components && Array.isArray(config.components)) {
        configuredComponents.value = config.components
      }
      
      showNotification('Configuración restaurada automáticamente', 'success', 'mdi-restore')
    }
  } catch (error) {
    console.error('Error loading from localStorage:', error)
    showNotification('Error al restaurar configuración', 'error', 'mdi-alert')
  }
}

const clearLocalStorage = () => {
  if (confirm('¿Estás seguro de que deseas borrar la configuración guardada y reiniciar el formulario?')) {
    localStorage.removeItem('infragen-config')
    
    // Resetear campos
    appName.value = ''
    selectedEnv.value = 'dev'
    location.value = 'mexicocentral'
    resourceGroup.value = ''
    configuredComponents.value = []
    bicepContent.value = ''
    errorMsg.value = ''
    infoMsg.value = ''
    
    showNotification('Configuración eliminada', 'info', 'mdi-delete')
  }
}

const showNotification = (msg, color = 'success', icon = 'mdi-check') => {
  notificationMessage.value = msg
  notificationColor.value = color
  notificationIcon.value = icon
  showAutoSaveNotification.value = true
}

// Watchers for auto-save
watch([appName, selectedEnv, location, configuredComponents], () => {
  saveToLocalStorage()
}, { deep: true })

// Componentes disponibles
const availableComponents = [
  { value: 'StorageAccount', label: 'Storage Account', description: 'Almacenamiento de Azure' },
  { value: 'AppServicePlan', label: 'App Service Plan', description: 'Plan de App Service' },
  { value: 'AppService', label: 'App Service', description: 'Aplicación web de Azure' },
  { value: 'ContainerApp', label: 'Container App', description: 'Aplicación containerizada en Azure' },
  // { value: 'CognitiveService', label: 'Cognitive Services', description: 'Servicios cognitivos de Azure' },
  { value: 'SQLServer', label: 'SQL Server', description: 'Servidor de base de datos SQL' },
  { value: 'SQLDatabase', label: 'SQL Database', description: 'Base de datos SQL' },
  { value: 'MonitoringAlerts', label: 'Application Insights', description: 'Monitoreo y telemetría' }
]


const currentConfig = ref({})
const editingIndex = ref(-1)

// Nueva ref para el número sugerido
const appServiceNumberForDialog = ref(1)

const updateCurrentConfig = (newConfig) => {
  currentConfig.value = newConfig
}

// Funciones de validación
const isBasicInfoComplete = computed(() => {
  return appName.value.trim() !== '' && resourceGroup.value.trim() !== ''
})

const hasAppServicePlan = computed(() => {
  return configuredComponents.value.some(item => item.value === 'AppServicePlan')
})

const hasSQLServer = computed(() => {
  return configuredComponents.value.some(item => item.value === 'SQLServer')
})

const sqlServerName = computed(() => {
  const sqlServerComponent = configuredComponents.value.find(item => item.value === 'SQLServer')
  return sqlServerComponent?.config?.name || ''
})

const availableAppServicePlans = computed(() => {
  return configuredComponents.value
    .filter(item => item.value === 'AppServicePlan')
    .map(item => ({
      name: item.config.name,
      config: item.config
    }))
})

const availableSqlServers = computed(() => {
  return configuredComponents.value
    .filter(item => item.value === 'SQLServer')
    .map(item => ({
      name: item.config.name,
      config: item.config
    }))
})

const canAddComponent = (componentValue) => {
  // Validación 1: Información básica requerida para todos los componentes
  if (!isBasicInfoComplete.value) {
    return {
      allowed: false,
      reason: 'Debe ingresar el nombre de la app y el grupo de recursos primero'
    }
  }
  
  // Validación 2: AppService requiere AppServicePlan
  if (componentValue === 'AppService' && !hasAppServicePlan.value) {
    return {
      allowed: false,
      reason: 'Debe agregar un App Service Plan antes de agregar un App Service'
    }
  }
  
  // Validación 3: SQLDatabase requiere SQLServer
  if (componentValue === 'SQLDatabase' && !hasSQLServer.value) {
    return {
      allowed: false,
      reason: 'Debe agregar un SQL Server antes de agregar una SQL Database'
    }
  }
  
  return { allowed: true, reason: '' }
}

// Funciones del componente
const addComponent = (component) => {
  const validation = canAddComponent(component.value)
  if (!validation.allowed) {
    errorMsg.value = validation.reason
    setTimeout(() => { errorMsg.value = '' }, 5000)
    return
  }
  errorMsg.value = ''
  infoMsg.value = ''
  currentComponent.value = component
  currentConfig.value = {}
  editingIndex.value = -1
  // Calcular número de App Services existentes + 1 si es AppService
  let appServiceNumber = 1
  if (component.value === 'AppService') {
    appServiceNumber = configuredComponents.value.filter(c => c.value === 'AppService').length + 1
  }
  appServiceNumberForDialog.value = appServiceNumber
  configDialog.value = true
}

const editComponent = (index) => {
  // Limpiar mensajes anteriores
  errorMsg.value = ''
  infoMsg.value = ''
  
  const item = configuredComponents.value[index]
  currentComponent.value = availableComponents.find(comp => comp.value === item.value)
  currentConfig.value = { ...item.config }
  editingIndex.value = index
  configDialog.value = true
}

const removeComponent = (index) => {
  const componentToRemove = configuredComponents.value[index]
  
  // Limpiar mensajes anteriores
  errorMsg.value = ''
  infoMsg.value = ''
  
  // Si se elimina un App Service Plan, también eliminar los App Services asociados
  if (componentToRemove.value === 'AppServicePlan') {
    const appServicePlanName = componentToRemove.config.name
    
    // Encontrar todos los App Services que usan este App Service Plan
    const associatedAppServices = []
    
    // Buscar App Services asociados y guardar su información antes de eliminarlos
    for (let i = configuredComponents.value.length - 1; i >= 0; i--) {
      const comp = configuredComponents.value[i]
      
      if (comp.value === 'AppService') {
        // Verificar múltiples propiedades posibles para la referencia del plan
        const planRef = comp.config.appServicePlan || 
                       comp.config.appServicePlanReference || 
                       comp.config.plan ||
                       comp.config.planName
        
        if (planRef === appServicePlanName) {
          associatedAppServices.push(comp.config.name || `App Service ${i}`)
          configuredComponents.value.splice(i, 1)
          // Ajustar el índice del componente principal si es necesario
          if (i < index) {
            index--
          }
        }
      }
    }
    
    // Mostrar mensaje informativo si se eliminaron App Services
    if (associatedAppServices.length > 0) {
      const appServiceNames = associatedAppServices.join(', ')
      infoMsg.value = `Se eliminaron automáticamente ${associatedAppServices.length} App Service(s) asociados: ${appServiceNames}. Los App Services dependen del App Service Plan "${appServicePlanName}".`
    }
  }
  
  // Si se elimina un SQL Server, también eliminar las SQL Databases asociadas
  if (componentToRemove.value === 'SQLServer') {
    const sqlServerName = componentToRemove.config.name
    
    // Encontrar todas las SQL Databases que usan este SQL Server
    const associatedDatabases = []
    
    // Buscar SQL Databases asociadas y guardar su información antes de eliminarlas
    for (let i = configuredComponents.value.length - 1; i >= 0; i--) {
      const comp = configuredComponents.value[i]
      
      if (comp.value === 'SQLDatabase') {
        // Verificar múltiples propiedades posibles para la referencia del servidor
        const serverRef = comp.config.sqlServer || 
                         comp.config.sqlServerReference || 
                         comp.config.server ||
                         comp.config.serverName
        
        if (serverRef === sqlServerName) {
          associatedDatabases.push(comp.config.name || `SQL Database ${i}`)
          configuredComponents.value.splice(i, 1)
          // Ajustar el índice del componente principal si es necesario
          if (i < index) {
            index--
          }
        }
      }
    }
    
    // Mostrar mensaje informativo si se eliminaron SQL Databases
    if (associatedDatabases.length > 0) {
      const databaseNames = associatedDatabases.join(', ')
      infoMsg.value = `Se eliminaron automáticamente ${associatedDatabases.length} SQL Database(s) asociadas: ${databaseNames}. Las SQL Databases dependen del SQL Server "${sqlServerName}".`
    }
  }
  
  // Eliminar el componente principal
  configuredComponents.value.splice(index, 1)
}

const saveConfiguration = () => {
  console.log('saveConfiguration called with currentConfig:', currentConfig.value)
  const newItem = {
    ...currentComponent.value,
    config: { ...currentConfig.value }
  }
  
  console.log('newItem being saved:', newItem)
  
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

// Canonical generator using src/utils/bicepGenerator.js
const generateBicep = () => {
  try {
    errorMsg.value = ''

    if (!appName.value || !location.value || configuredComponents.value.length === 0) {
      errorMsg.value = 'Por favor completa todos los campos requeridos y agrega al menos un componente.'
      return
    }

    const result = generateMain({
      appName: appName.value,
      location: location.value,
      components: configuredComponents.value,
      parameters: { environment: selectedEnv.value }
    })

    bicepContent.value = result.mainBicep

    // Básico: guía de comandos (mantener compatibilidad con UI)
    let commands = '# 1. Crear grupo de recursos (si no existe)\n'
    commands += `az group create --name ${resourceGroup.value} --location ${location.value}\n\n`

    commands += '# 2. Validar despliegue (What-If)\n'
    commands += `az deployment group what-if --resource-group ${resourceGroup.value} --template-file infra.bicep\n\n`

    commands += '# 3. Ejecutar despliegue\n'
    commands += `az deployment group create --resource-group ${resourceGroup.value} --template-file infra.bicep`

    deploymentCommands.value = commands
  } catch (error) {
    console.error('Error al generar Bicep (refactor):', error)
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
    showNotification('Código Bicep copiado al portapapeles', 'success', 'mdi-content-copy')
  }).catch(err => {
    console.error('Error al copiar:', err)
    showNotification('Error al copiar al portapapeles', 'error', 'mdi-alert')
  })
}

const copyCommands = () => {
  navigator.clipboard.writeText(deploymentCommands.value).then(() => {
    showNotification('Comandos copiados al portapapeles', 'success', 'mdi-content-copy')
  }).catch(err => {
    console.error('Error al copiar:', err)
    showNotification('Error al copiar al portapapeles', 'error', 'mdi-alert')
  })
}
</script>

<style scoped>
.text-disabled {
  opacity: 0.6;
}

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

.v-footer {
  margin-top: auto;
}
</style>
