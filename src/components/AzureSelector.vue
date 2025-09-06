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
                Preview: {{ computedResourceGroupName }}
              </v-chip>
            </div>
          </v-col>
        </v-row>
        
        <!-- Mensaje informativo -->
        <v-row v-if="!isBasicInfoComplete" dense class="mt-2">
          <v-col cols="12">
            <v-alert
              type="info"
              variant="tonal"
              closable
              icon="mdi-information"
              title="Información requerida"
              text="Complete el nombre de la aplicación y la configuración básica antes de agregar componentes."
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
                :class="{ 'text-disabled': !canAddComponent(comp.value).allowed }"
                class="px-2"
              >
                <template v-slot:prepend>
                  <v-icon 
                    :color="canAddComponent(comp.value).allowed ? 'primary' : 'grey'"
                    :icon="canAddComponent(comp.value).allowed ? 'mdi-check-circle' : 'mdi-lock'"
                  />
                </template>
                <template v-slot:append>
                  <v-tooltip 
                    :text="!canAddComponent(comp.value).allowed ? canAddComponent(comp.value).reason : ''"
                    :disabled="canAddComponent(comp.value).allowed"
                  >
                    <template v-slot:activator="{ props }">
                      <v-btn
                        v-bind="props"
                        :color="canAddComponent(comp.value).allowed ? 'primary' : 'grey'"
                        :disabled="!canAddComponent(comp.value).allowed"
                        size="small"
                        @click="addComponent(comp)"
                      >
                        Agregar
                      </v-btn>
                    </template>
                  </v-tooltip>
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
                  <v-tooltip text="Edita la configuración de este componente">
                    <template v-slot:activator="{ props }">
                      <v-btn
                        v-bind="props"
                        color="orange"
                        size="small"
                        class="me-2"
                        @click="editComponent(index)"
                      >
                        Editar
                      </v-btn>
                    </template>
                  </v-tooltip>
                  <v-tooltip text="Elimina este componente de la configuración">
                    <template v-slot:activator="{ props }">
                      <v-btn
                        v-bind="props"
                        color="red"
                        size="small"
                        @click="removeComponent(index)"
                      >
                        Quitar
                      </v-btn>
                    </template>
                  </v-tooltip>
                </template>
              </v-list-item>
            </v-list>
          </v-col>
        </v-row>

        <!-- Estimador de costos -->
        <CostEstimator :components="configuredComponents" :region="location" />
        
        <!-- Botón para generar -->
        <v-row class="mt-4">
          <v-col cols="12" class="text-center">
            <v-tooltip text="Genera el código Bicep para desplegar tu infraestructura en Azure. Requiere al menos un componente configurado.">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  color="primary"
                  size="large"
                  :disabled="configuredComponents.length === 0 || !appName || !location"
                  @click="generateBicep"
                >
                  <v-icon left>mdi-cog</v-icon>
                  Generar Infraestructura
                </v-btn>
              </template>
            </v-tooltip>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Resultado del código Bicep -->
    <v-card v-if="bicepContent" class="mx-auto my-4 pa-4" max-width="800">
      <v-card-title class="text-h6 mb-3">
        Código Bicep Generado
        <v-spacer />
        <v-tooltip text="Copia el código Bicep al portapapeles para usarlo en tus deployments">
          <template v-slot:activator="{ props }">
            <v-btn v-bind="props" color="primary" size="small" class="me-2" @click="copyToClipboard">
              <v-icon left>mdi-content-copy</v-icon>
              Copiar
            </v-btn>
          </template>
        </v-tooltip>
        <v-tooltip text="Descarga el código Bicep como archivo .bicep para usar con Azure CLI o Azure PowerShell">
          <template v-slot:activator="{ props }">
            <v-btn v-bind="props" color="success" size="small" @click="downloadBicep">
              <v-icon left>mdi-download</v-icon>
              Descargar
            </v-btn>
          </template>
        </v-tooltip>
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
import CostEstimator from './CostEstimator.vue'

// Mapeo de componentes
const componentMapping = {
  'StorageAccount': StorageAccountConfig,
  'AppServicePlan': AppServicePlanConfig,
  'AppService': AppServiceConfig,
  'CognitiveService': CognitiveServiceConfig,
  'SQLServer': SQLServerConfig,
  'SQLDatabase': SqlDatabaseConfig,
  'MonitoringAlerts': MonitoringAlertsConfig
}

// Reactive references
const environments = ref([])
const locations = ref([])
const selectedEnv = ref('dev')
const appName = ref('')
const resourceGroup = ref('')
const location = ref('mexicocentral')

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
    const envRes = await fetch('/src/environments.json')
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
    const locRes = await fetch('/src/locations.json')
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
  // { value: 'CognitiveService', label: 'Cognitive Services', description: 'Servicios cognitivos de Azure' },
  { value: 'SQLServer', label: 'SQL Server', description: 'Servidor de base de datos SQL' },
  { value: 'SQLDatabase', label: 'SQL Database', description: 'Base de datos SQL' },
  { value: 'MonitoringAlerts', label: 'Application Insights', description: 'Monitoreo y telemetría' }
]

// Estado del componente
const configuredComponents = ref([])
const bicepContent = ref('')
const errorMsg = ref('')
const infoMsg = ref('')
const configDialog = ref(false)
const currentComponent = ref(null)
const currentConfig = ref({})
const editingIndex = ref(-1)

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
    // Mostrar mensaje de error
    errorMsg.value = validation.reason
    setTimeout(() => {
      errorMsg.value = ''
    }, 5000)
    return
  }
  
  // Limpiar mensajes anteriores
  errorMsg.value = ''
  infoMsg.value = ''
  
  currentComponent.value = component
  currentConfig.value = {}
  editingIndex.value = -1
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

const generateBicep = () => {
  try {
    errorMsg.value = ''
    
    if (!appName.value || !location.value || configuredComponents.value.length === 0) {
      errorMsg.value = 'Por favor completa todos los campos requeridos y agrega al menos un componente.'
      return
    }

    // Cabecera del archivo Bicep
    const now = new Date()
    const formattedDate = now.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
    
    let content = '// ============================================================================\n'
    content += '//  AppName: ' + appName.value + '\n'
    content += '//  ResourceGroup: ' + resourceGroup.value + '\n'
    content += '//  Location: ' + location.value + '\n'
    content += '//  Environment: ' + selectedEnv.value + '\n'
    content += '//  Generated by: InfraGen v1.0\n'
    content += '//  Created: ' + formattedDate + '\n'
    content += '// ============================================================================\n\n'

    // Configuración del scope a nivel de suscripción para crear el grupo de recursos
    content += 'targetScope = \'subscription\'\n\n'
    
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
        if (!cfg.name) throw new Error('StorageAccount configuration is missing a name')
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
        content += '    accessTier: \'' + (cfg.accessTier || 'Cool') + '\'\n'
        content += '    supportsHttpsTrafficOnly: ' + (cfg.httpsOnly !== false) + '\n'
        content += '    allowBlobPublicAccess: ' + (cfg.enableBlobPublicAccess === true) + '\n'
        content += '    minimumTlsVersion: \'TLS1_2\'\n'
        content += '  }\n'
        content += '  tags: tags\n'
        content += '}\n\n'
      }
      
      if (item.value === 'AppServicePlan') {
        if (!cfg.name) {
          throw new Error('App Service Plan requiere un nombre válido')
        }
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
        if (!cfg.name) {
          throw new Error('App Service requiere un nombre válido')
        }
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
        // Runtime Stack configuration
        if (cfg.runtimeStack) {
          // Determine if the App Service Plan is Linux or Windows
          const appServicePlanComponent = configuredComponents.value.find(comp => comp.value === 'AppServicePlan')
          const isLinux = appServicePlanComponent && appServicePlanComponent.config.os === 'Linux'
          
          if (isLinux) {
            content += '      linuxFxVersion: \'' + cfg.runtimeStack + '\'\n'
          } else {
            // For Windows, we need to handle different runtime stacks differently
            if (cfg.runtimeStack.startsWith('DOTNETCORE')) {
              content += '      netFrameworkVersion: \'v8.0\'\n'
            } else if (cfg.runtimeStack.startsWith('ASPNET')) {
              const version = cfg.runtimeStack.split('|')[1] || '4.8'
              content += '      netFrameworkVersion: \'v' + version + '\'\n'
            } else if (cfg.runtimeStack.startsWith('NODE')) {
              const version = cfg.runtimeStack.split('|')[1] || '20-lts'
              content += '      nodeVersion: \'' + version + '\'\n'
            } else if (cfg.runtimeStack.startsWith('PYTHON')) {
              const version = cfg.runtimeStack.split('|')[1] || '3.11'
              content += '      pythonVersion: \'' + version + '\'\n'
            } else if (cfg.runtimeStack.startsWith('JAVA')) {
              const version = cfg.runtimeStack.split('|')[1] || '17-java17'
              content += '      javaVersion: \'' + version + '\'\n'
            } else if (cfg.runtimeStack.startsWith('PHP')) {
              const version = cfg.runtimeStack.split('|')[1] || '8.2'
              content += '      phpVersion: \'' + version + '\'\n'
            }
          }
        }
        content += '    }\n'
        content += '    httpsOnly: ' + (cfg.httpsOnly !== false) + '\n'
        content += '    clientAffinityEnabled: ' + (cfg.clientAffinityEnabled !== false) + '\n'
        content += '  }\n'
        content += '  tags: tags\n'
        content += '}\n\n'
      }
      
      if (item.value === 'CognitiveService') {
        if (!cfg.name) throw new Error('CognitiveService configuration is missing a name')
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
        if (!cfg.name) throw new Error('SQLServer configuration is missing a name')
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
        if (!cfg.name) throw new Error('SQLDatabase configuration is missing a name')
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
        if (!cfg.name) throw new Error('MonitoringAlerts configuration is missing a name')
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
