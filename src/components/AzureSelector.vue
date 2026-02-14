<template>
  <v-container class="fill-height d-flex flex-column align-center justify-center pa-2" fluid>
    <v-card class="mx-auto my-4 pa-4 compact-ui surface-elev-1" max-width="1400">
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="text-h5 flex-grow-1 text-center pl-10">Generador de Infraestructura</span>

        <div class="d-flex align-center ga-2">
          <v-tooltip text="Limpiar configuración guardada y reiniciar formulario">
            <template v-slot:activator="{ props }">
              <v-btn
                v-bind="props"
                prepend-icon="mdi-delete-restore"
                variant="text"
                color="error"
                size="small"
                class="top-action-btn top-action-danger"
                @click="clearLocalStorage"
              >
                Limpiar
              </v-btn>
            </template>
          </v-tooltip>

          <v-tooltip text="Cargar configuración desde un archivo Bicep">
            <template v-slot:activator="{ props }">
              <v-btn
                v-bind="props"
                prepend-icon="mdi-file-import"
                variant="text"
                color="indigo"
                size="small"
                class="top-action-btn"
                @click="openBicepImporter"
              >
                Importar Bicep
              </v-btn>
            </template>
          </v-tooltip>

          <v-tooltip text="Abrir ventana de despliegue en Azure (requiere Bicep generado)">
            <template v-slot:activator="{ props }">
              <v-btn
                v-bind="props"
                prepend-icon="mdi-cloud-lock"
                variant="text"
                color="indigo"
                size="small"
                class="top-action-btn"
                :disabled="!bicepContent"
                @click="openAzureDeploymentWindow"
              >
                Administrador Azure
              </v-btn>
            </template>
          </v-tooltip>
        </div>
      </v-card-title>
      <v-divider class="mb-3" />
      <v-card-text>
        <input
          ref="bicepFileInput"
          type="file"
          accept=".bicep,.txt"
          class="d-none"
          @change="handleBicepImport"
        >

        <v-row dense class="layout-two-columns">
          <v-col cols="12" lg="5">
            <v-card variant="outlined" class="mb-3 surface-elev-2">
              <v-card-title class="text-subtitle-1">Configuración base</v-card-title>
              <v-divider />
              <v-card-text class="pb-2">
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

                  </v-col>
                </v-row>

                <v-row v-if="!isBasicInfoComplete" dense class="mt-2">
                  <v-col cols="12">
                    <v-alert
                      type="info"
                      variant="tonal"
                      closable
                      icon="mdi-information"
                      title="Información requerida"
                      text="Complete el nombre de la app y la configuración básica antes de agregar componentes."
                    />
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>

            <v-card variant="outlined" class="surface-elev-2">
              <v-card-title class="text-subtitle-1">Componentes disponibles</v-card-title>
              <v-divider />
              <v-card-text class="pa-2 available-panel">
                <div class="available-components-grid">
                  <v-hover v-for="comp in availableComponents" :key="comp.value" v-slot="{ isHovering, props }">
                    <v-card
                      v-bind="props"
                      variant="outlined"
                      :elevation="isHovering ? 2 : 0"
                      class="available-comp-card"
                      :class="{ 'text-disabled': !canAddComponent(comp.value).allowed }"
                      tabindex="0"
                      role="button"
                      @click="canAddComponent(comp.value).allowed && addComponent(comp)"
                      @keyup.enter="canAddComponent(comp.value).allowed && addComponent(comp)"
                    >
                      <v-card-text class="py-3 px-2 text-center">
                        <v-tooltip
                          :text="!canAddComponent(comp.value).allowed ? canAddComponent(comp.value).reason : ''"
                          :disabled="canAddComponent(comp.value).allowed"
                        >
                          <template v-slot:activator="{ props: tipProps }">
                            <div v-bind="tipProps" class="d-flex flex-column align-center">
                              <v-icon
                                size="22"
                                class="mb-1"
                                :color="canAddComponent(comp.value).allowed ? 'primary' : 'grey'"
                                :icon="getAvailableComponentIcon(comp.value)"
                              />
                              <div class="text-caption font-weight-bold text-truncate w-100">{{ comp.label }}</div>
                              <div class="text-caption text-medium-emphasis">Agregar</div>
                            </div>
                          </template>
                        </v-tooltip>
                      </v-card-text>
                    </v-card>
                  </v-hover>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" lg="4">
            <v-card variant="outlined" class="mb-3 surface-elev-2">
              <v-card-title class="text-subtitle-1">Componentes configurados</v-card-title>
              <v-divider />
              <v-card-text class="pa-0 panel-scroll">
                <v-list v-if="configuredComponents.length > 0" lines="two" density="compact" class="pa-0">
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
                            class="me-2 component-edit-btn"
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
                            class="component-remove-btn"
                            @click="removeComponent(index)"
                          >
                            Quitar
                          </v-btn>
                        </template>
                      </v-tooltip>
                    </template>
                  </v-list-item>
                </v-list>

                <div v-else class="pa-4">
                  <v-alert type="info" variant="tonal" density="compact">
                    Aún no hay componentes configurados.
                  </v-alert>
                </div>
              </v-card-text>
            </v-card>

            <v-row class="mb-2" dense>
              <v-col cols="12">
                <v-tooltip text="Genera el código Bicep para desplegar tu infraestructura en Azure. Requiere al menos un componente configurado.">
                  <template v-slot:activator="{ props }">
                    <v-btn
                      v-bind="props"
                      color="primary"
                      size="default"
                      block
                      :disabled="configuredComponents.length === 0 || !appName || !location"
                      @click="openGeneratedInfraDialog"
                    >
                      <v-icon left>mdi-cog</v-icon>
                      Generar Infraestructura
                    </v-btn>
                  </template>
                </v-tooltip>
              </v-col>
              <v-col cols="12">
                <v-tooltip text="Muestra la vista de arquitectura de los recursos configurados.">
                  <template v-slot:activator="{ props }">
                    <v-btn
                      v-bind="props"
                      color="secondary"
                      size="default"
                      block
                      :disabled="configuredComponents.length === 0"
                      @click="showArchDialog = true"
                    >
                      <v-icon left>mdi-graph</v-icon>
                      Vista de Arquitectura
                    </v-btn>
                  </template>
                </v-tooltip>
              </v-col>
            </v-row>

          </v-col>

          <v-col cols="12" lg="3">
            <v-card variant="outlined" class="mb-3 surface-elev-2">
              <v-card-title class="text-subtitle-1">Estimación de costos</v-card-title>
              <v-divider />
              <v-card-text class="pa-2 cost-panel-scroll">
                <CostEstimator :components="configuredComponents" :region="location" />
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
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
      <v-card class="surface-elev-1">
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

    <!-- Dialog de resultado de generación -->
    <v-dialog v-model="showGeneratedInfraDialog" max-width="1100px">
      <v-card>
        <v-card-title class="text-h6 d-flex align-center">
          Resultado de Generación
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" @click="showGeneratedInfraDialog = false" />
        </v-card-title>
        <v-divider class="mb-3" />

        <v-card-text>
          <v-card v-if="bicepContent" class="mb-4" variant="outlined">
            <v-card-title class="text-subtitle-1">
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
            <v-divider class="mb-2" />
            <div class="code-container">
              <pre class="code-block"><code>{{ bicepContent }}</code></pre>
            </div>
          </v-card>

          <v-card v-if="deploymentCommands" variant="outlined">
            <v-card-title class="text-subtitle-1">
              Guía de Despliegue (Azure CLI)
              <v-spacer />
              <v-btn color="primary" size="small" @click="copyCommands">
                <v-icon left>mdi-content-copy</v-icon>
                Copiar Comandos
              </v-btn>
            </v-card-title>
            <v-divider class="mb-2" />
            <v-alert type="info" variant="tonal" class="mb-3" density="compact">
              Se recomienda ejecutar primero el comando <strong>what-if</strong> para previsualizar los cambios antes de desplegar.
            </v-alert>
            <div class="code-container">
              <pre class="code-block"><code>{{ deploymentCommands }}</code></pre>
            </div>
          </v-card>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" @click="showGeneratedInfraDialog = false">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Ventana separada para administración de despliegue Azure -->
    <v-dialog
      v-model="showAzureDeploymentDialog"
      :max-width="azureAdminAuthenticated ? '1100px' : '620px'"
      persistent
      class="azure-admin-dialog"
    >
      <v-card class="azure-admin-card surface-elev-1">
        <v-card-title class="text-h6 d-flex align-center justify-space-between">
          <span>Acceso al Administrador de Despliegue Azure</span>
          <v-btn icon="mdi-close" variant="text" @click="closeAzureDeploymentWindow" />
        </v-card-title>
        <v-divider />

        <transition name="azure-auth-fade" mode="out-in">
          <v-card-text v-if="!azureAdminAuthenticated" key="login" class="pt-4 pb-3">
            <div class="azure-login-wrap">
              <div class="azure-login-hero mb-4">
                <v-avatar color="primary" size="46" class="mr-3">
                  <v-icon color="white" size="24">mdi-shield-lock</v-icon>
                </v-avatar>
                <div class="flex-grow-1">
                  <div class="text-subtitle-1 font-weight-bold">Inicio de sesión seguro</div>
                  <div class="text-body-2 text-medium-emphasis">Accede al módulo de despliegue con credenciales locales.</div>
                </div>
                <v-chip size="small" color="primary" variant="tonal" class="font-weight-medium">
                  Admin
                </v-chip>
              </div>

              <v-card variant="outlined" class="azure-login-form pa-4">
                <v-text-field
                  v-model="azureAdminUsername"
                  label="Usuario"
                  density="comfortable"
                  variant="outlined"
                  prepend-inner-icon="mdi-account"
                  hide-details="auto"
                  class="mb-3 azure-login-input"
                  :disabled="azureAuthLoading"
                  :rules="[v => !!v || 'El usuario es obligatorio']"
                />

                <v-text-field
                  v-model="azureAdminPassword"
                  :type="azureAdminShowPassword ? 'text' : 'password'"
                  label="Contraseña"
                  density="comfortable"
                  variant="outlined"
                  prepend-inner-icon="mdi-lock"
                  :append-inner-icon="azureAdminShowPassword ? 'mdi-eye-off' : 'mdi-eye'"
                  hide-details="auto"
                  class="azure-login-input"
                  :disabled="azureAuthLoading"
                  :rules="[v => !!v || 'La contraseña es obligatoria']"
                  @click:append-inner="azureAdminShowPassword = !azureAdminShowPassword"
                  @keyup.enter="authenticateAzureAdmin"
                />

                <v-btn
                  color="primary"
                  block
                  class="mt-4"
                  :loading="azureAuthLoading"
                  :disabled="azureAuthLoading"
                  @click="authenticateAzureAdmin"
                >
                  <v-icon left>mdi-login</v-icon>
                  Ingresar al Administrador
                </v-btn>
              </v-card>

              <v-alert v-if="azureAuthError" type="error" variant="tonal" density="compact" class="mt-3 mb-0">
                {{ azureAuthError }}
              </v-alert>
            </div>
          </v-card-text>

          <v-card-text v-else key="admin" class="pt-4">
            <v-alert type="success" variant="tonal" density="compact" class="mb-3">
              Sesión iniciada como {{ azureAdminUsername }}.
            </v-alert>

            <AzureDeploymentManager
              :bicep-content="bicepContent"
              :default-resource-group="resourceGroup"
              :default-location="location"
            />
          </v-card-text>
        </transition>

        <v-card-actions class="azure-admin-actions">
          <v-spacer />
          <v-btn color="grey" @click="closeAzureDeploymentWindow">
            Cerrar
          </v-btn>
          <v-btn
            v-if="azureAdminAuthenticated"
            color="warning"
            @click="logoutAzureAdmin"
          >
            Cerrar sesión
          </v-btn>
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
import { ref, computed, onMounted, watch, defineAsyncComponent } from 'vue'
import CostEstimator from './CostEstimator.vue'
import AzureDeploymentManager from './AzureDeploymentManager.vue'
import { useInfragenConfigPersistence } from '../utils/configPersistence'
import { parseInfragenBicep } from '../utils/bicepImportParser'

// Cargar la vista de arquitectura bajo demanda para reducir el bundle inicial.
const ArchitectureView = defineAsyncComponent(() => import('./ArchitectureView.vue'))

// Cargar configuradores bajo demanda para reducir la carga inicial.
const StorageAccountConfig = defineAsyncComponent(() => import('./StorageAccountConfig.vue'))
const AppServicePlanConfig = defineAsyncComponent(() => import('./AppServicePlanConfig.vue'))
const AppServiceConfig = defineAsyncComponent(() => import('./AppServiceConfig.vue'))
const SqlDatabaseConfig = defineAsyncComponent(() => import('./SqlDatabaseConfig.vue'))
const CognitiveServiceConfig = defineAsyncComponent(() => import('./CognitiveServiceConfig.vue'))
const SQLServerConfig = defineAsyncComponent(() => import('./SQLServerConfig.vue'))
const MonitoringAlertsConfig = defineAsyncComponent(() => import('./MonitoringAlertsConfig.vue'))
const ContainerAppConfig = defineAsyncComponent(() => import('./ContainerAppConfig.vue'))

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
const showGeneratedInfraDialog = ref(false)
const showAutoSaveNotification = ref(false)
const notificationMessage = ref('')
const notificationColor = ref('success')
const notificationIcon = ref('mdi-check')
const bicepFileInput = ref(null)
const showAzureDeploymentDialog = ref(false)
const azureAdminAuthenticated = ref(false)
const azureAdminUsername = ref('')
const azureAdminPassword = ref('')
const azureAdminShowPassword = ref(false)
const azureAuthLoading = ref(false)
const azureAuthError = ref('')

// Estado del componente
const configuredComponents = ref([])
const bicepContent = ref('')
const deploymentCommands = ref('')
const errorMsg = ref('')
const infoMsg = ref('')
const configDialog = ref(false)
const currentComponent = ref(null)

// Limpia el nombre de aplicación para usarlo en nombres de recursos.
const sanitizeAppName = (value) => {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '')
}

const escapeRegExp = (value) => {
  return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Ajusta un nombre de recurso cuando cambia el ambiente (dev/test/qa/prod).
const syncEnvironmentToken = (value, oldEnv, newEnv) => {
  if (typeof value !== 'string' || !value) return value
  if (!oldEnv || !newEnv || oldEnv === newEnv) return value

  let updated = value
  const oldEscaped = escapeRegExp(oldEnv)
  const envSuffixWithDash = new RegExp(`-${oldEscaped}(?=-asp$|-ca$|-cae$|-ain$|$)`, 'gi')
  const envSuffixNoDash = new RegExp(`${oldEscaped}$`, 'gi')

  if (oldEnv !== 'prod' && newEnv !== 'prod') {
    updated = updated.replace(envSuffixWithDash, `-${newEnv}`)
    updated = updated.replace(envSuffixNoDash, newEnv)
    return updated
  }

  if (oldEnv !== 'prod' && newEnv === 'prod') {
    updated = updated.replace(envSuffixWithDash, '')
    updated = updated.replace(envSuffixNoDash, '')
    return updated
  }

  const hasDashedName = updated.includes('-')
  const hasKnownSuffix = /-(asp|ca|cae|ain)$/i.test(updated)
  const noDashConventions = /^(rg|sta|func|cog|log)[a-z0-9]+$/i.test(updated)

  if (hasKnownSuffix) {
    return updated.replace(/-(asp|ca|cae|ain)$/i, `-${newEnv}-$1`)
  }

  if (noDashConventions) {
    return `${updated}${newEnv}`
  }

  if (hasDashedName) {
    return `${updated}-${newEnv}`
  }

  return `${updated}${newEnv}`
}

// Computed property para generar nombre de grupo de recursos
const computedResourceGroupName = computed(() => {
  if (!appName.value || !location.value || !selectedEnv.value) return ''
  const currentLocation = locations.value.find(loc => loc.value === location.value)
  const shortName = currentLocation?.shortName || location.value.slice(0, 3)
  const cleanAppName = sanitizeAppName(appName.value)
  
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

// Mantiene sincronizados los nombres/referencias de componentes al cambiar el nombre de la app.
watch(appName, (newAppName, oldAppName) => {
  const oldToken = sanitizeAppName(oldAppName)
  const newToken = sanitizeAppName(newAppName)

  if (!oldToken || !newToken || oldToken === newToken || configuredComponents.value.length === 0) {
    return
  }

  const fieldsToSync = [
    'name',
    'appServicePlan',
    'appServicePlanReference',
    'plan',
    'planName',
    'sqlServer',
    'sqlServerReference',
    'server',
    'serverName',
    'storageAccountName',
    'applicationInsightsName',
    'containerEnvironmentName',
    'workspaceName',
    'logAnalyticsName'
  ]

  configuredComponents.value = configuredComponents.value.map(component => {
    const updatedConfig = { ...component.config }

    fieldsToSync.forEach((field) => {
      const currentValue = updatedConfig[field]
      if (typeof currentValue !== 'string' || !currentValue) {
        return
      }

      updatedConfig[field] = currentValue.replace(new RegExp(oldToken, 'gi'), newToken)
    })

    return {
      ...component,
      config: updatedConfig
    }
  })
})

// Mantiene sincronizados los nombres/referencias de componentes al cambiar el ambiente.
watch(selectedEnv, (newEnv, oldEnv) => {
  if (!oldEnv || !newEnv || oldEnv === newEnv || configuredComponents.value.length === 0) {
    return
  }

  const fieldsToSync = [
    'name',
    'appServicePlan',
    'appServicePlanReference',
    'plan',
    'planName',
    'sqlServer',
    'sqlServerReference',
    'server',
    'serverName',
    'storageAccountName',
    'applicationInsightsName',
    'containerEnvironmentName',
    'workspaceName',
    'logAnalyticsName'
  ]

  configuredComponents.value = configuredComponents.value.map(component => {
    const updatedConfig = { ...component.config }

    fieldsToSync.forEach((field) => {
      const currentValue = updatedConfig[field]
      if (typeof currentValue !== 'string' || !currentValue) {
        return
      }

      updatedConfig[field] = syncEnvironmentToken(currentValue, oldEnv, newEnv)
    })

    return {
      ...component,
      config: updatedConfig
    }
  })
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

    // Validar valor del ambiente por defecto contra el catálogo cargado.
    if (!environments.value.some(env => env.value === selectedEnv.value)) {
      selectedEnv.value = environments.value[0]?.value || 'dev'
    }
    
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

    // Validar ubicación actual contra el catálogo cargado.
    if (!locations.value.some(loc => loc.value === location.value)) {
      location.value = locations.value[0]?.value || ''
    }
    

    
    // Cargar configuración guardada
    loadFromLocalStorage()
    
  } catch (error) {
    console.error('Error al cargar datos:', error)
    errorMsg.value = 'Error al cargar la configuración inicial: ' + error.message
  }
})

const showNotification = (msg, color = 'success', icon = 'mdi-check') => {
  notificationMessage.value = msg
  notificationColor.value = color
  notificationIcon.value = icon
  showAutoSaveNotification.value = true
}

// Credenciales locales temporales para proteger acceso al módulo.
// Pendiente: reemplazar por autenticación real con backend/identity provider.
const localAzureAdminCredentials = {
  username: 'admin',
  password: 'Admin123!'
}

const openAzureDeploymentWindow = () => {
  azureAuthError.value = ''
  azureAuthLoading.value = false
  azureAdminShowPassword.value = false
  showAzureDeploymentDialog.value = true
}

const closeAzureDeploymentWindow = () => {
  showAzureDeploymentDialog.value = false
  azureAuthError.value = ''
  azureAuthLoading.value = false
  azureAdminShowPassword.value = false
}

const authenticateAzureAdmin = async () => {
  if (azureAuthLoading.value) return

  if (!azureAdminUsername.value || !azureAdminPassword.value) {
    azureAuthError.value = 'Captura usuario y contraseña para continuar.'
    return
  }

  azureAuthLoading.value = true
  await new Promise(resolve => setTimeout(resolve, 320))

  const isValidUser = azureAdminUsername.value === localAzureAdminCredentials.username
  const isValidPassword = azureAdminPassword.value === localAzureAdminCredentials.password

  if (!isValidUser || !isValidPassword) {
    azureAuthError.value = 'Usuario o contraseña inválidos.'
    azureAdminAuthenticated.value = false
    azureAuthLoading.value = false
    return
  }

  azureAuthError.value = ''
  azureAdminAuthenticated.value = true
  azureAuthLoading.value = false
}

const logoutAzureAdmin = () => {
  azureAdminAuthenticated.value = false
  azureAdminPassword.value = ''
  azureAdminShowPassword.value = false
  azureAuthLoading.value = false
  azureAuthError.value = ''
}

const {
  loadFromLocalStorage,
  clearLocalStorage
} = useInfragenConfigPersistence({
  appName,
  selectedEnv,
  location,
  resourceGroup,
  configuredComponents,
  bicepContent,
  errorMsg,
  infoMsg,
  environments,
  locations,
  showNotification
})

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

// Íconos visuales para cada tarjeta de componente disponible.
const availableComponentIcons = {
  StorageAccount: 'mdi-database',
  AppServicePlan: 'mdi-view-dashboard',
  AppService: 'mdi-web',
  ContainerApp: 'mdi-docker',
  SQLServer: 'mdi-database-cog',
  SQLDatabase: 'mdi-database-outline',
  MonitoringAlerts: 'mdi-chart-line'
}

const getAvailableComponentIcon = (componentValue) => {
  return availableComponentIcons[componentValue] || 'mdi-cube-outline'
}


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
    bicepContent.value = ''
    deploymentCommands.value = ''
    
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
    
    // Parámetros de la infraestructura
    content += '// Parámetros de la infraestructura\n'
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
    
    // Recursos dentro del grupo de recursos
    content += '// ============================================================================\n'
    content += '// RECURSOS DE LA INFRAESTRUCTURA\n'
    content += '// ============================================================================\n\n'

    configuredComponents.value.forEach(item => {
      const cfg = item.config
      
      if (item.value === 'StorageAccount') {
        if (!cfg.name) throw new Error('StorageAccount configuration is missing a name')
        content += '// Storage Account ' + cfg.name + '\n'
        content += 'resource storageAccount_' + cfg.name + ' \'Microsoft.Storage/storageAccounts@2022-09-01\' = {\n'

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

      if (item.value === 'FunctionApp') {
        if (!cfg.name) throw new Error('FunctionApp configuration is missing a name')
        
        // 1. Storage Account for Function App
        const funcStorageName = cfg.storageAccountName || ('sta' + cfg.name.replace(/[^a-z0-9]/g, ''))
        content += '// Storage Account for Function App ' + cfg.name + '\n'
        content += 'resource storageAccount_' + funcStorageName + ' \'Microsoft.Storage/storageAccounts@2022-09-01\' = {\n'
        content += '  scope: resourceGroup\n'
        content += '  name: \'' + funcStorageName + '\'\n'
        content += '  location: location\n'
        content += '  sku: {\n'
        content += '    name: \'Standard_LRS\'\n'
        content += '  }\n'
        content += '  kind: \'StorageV2\'\n'
        content += '  properties: {\n'
        content += '    supportsHttpsTrafficOnly: true\n'
        content += '    minimumTlsVersion: \'TLS1_2\'\n'
        content += '  }\n'
        content += '  tags: tags\n'
        content += '}\n\n'

        // 2. App Service Plan for Function App
        const funcPlanName = cfg.appServicePlanName || (cfg.name + '-plan')
        content += '// App Service Plan for Function App ' + cfg.name + '\n'
        content += 'resource appServicePlan_' + funcPlanName.replace(/[^a-zA-Z0-9]/g, '') + ' \'Microsoft.Web/serverfarms@2022-03-01\' = {\n'
        content += '  scope: resourceGroup\n'
        content += '  name: \'' + funcPlanName + '\'\n'
        content += '  location: location\n'
        content += '  sku: {\n'
        content += '    name: \'' + (cfg.sku || 'Y1') + '\'\n'
        content += '    tier: \'' + (cfg.hostingPlan === 'Consumption' ? 'Dynamic' : (cfg.hostingPlan === 'Premium' ? 'ElasticPremium' : 'Standard')) + '\'\n'
        content += '  }\n'
        content += '  properties: {\n'
        content += '    reserved: ' + (cfg.operatingSystem === 'Linux') + '\n'
        content += '  }\n'
        content += '  tags: tags\n'
        content += '}\n\n'

        // 3. Function App Resource
        content += '// Function App ' + cfg.name + '\n'
        content += 'resource functionApp_' + cfg.name.replace(/[^a-zA-Z0-9]/g, '') + ' \'Microsoft.Web/sites@2022-03-01\' = {\n'
        content += '  scope: resourceGroup\n'
        content += '  name: \'' + cfg.name + '\'\n'
        content += '  location: location\n'
        content += '  kind: \'' + (cfg.operatingSystem === 'Linux' ? 'functionapp,linux' : 'functionapp') + '\'\n'
        content += '  identity: {\n'
        content += '    type: \'SystemAssigned\'\n'
        content += '  }\n'
        content += '  properties: {\n'
        content += '    serverFarmId: appServicePlan_' + funcPlanName.replace(/[^a-zA-Z0-9]/g, '') + '.id\n'
        content += '    siteConfig: {\n'
        content += '      appSettings: [\n'
        content += '        {\n'
        content += '          name: \'AzureWebJobsStorage\'\n'
        content += '          value: \'DefaultEndpointsProtocol=https;AccountName=${storageAccount_' + funcStorageName + '.name};EndpointSuffix=${environment().suffixes.storage};AccountKey=${storageAccount_' + funcStorageName + '.listKeys().keys[0].value}\'\n'
        content += '        }\n'
        content += '        {\n'
        content += '          name: \'WEBSITE_CONTENTAZUREFILECONNECTIONSTRING\'\n'
        content += '          value: \'DefaultEndpointsProtocol=https;AccountName=${storageAccount_' + funcStorageName + '.name};EndpointSuffix=${environment().suffixes.storage};AccountKey=${storageAccount_' + funcStorageName + '.listKeys().keys[0].value}\'\n'
        content += '        }\n'
        content += '        {\n'
        content += '          name: \'WEBSITE_CONTENTSHARE\'\n'
        content += '          value: toLower(\'' + cfg.name + '\')\n'
        content += '        }\n'
        content += '        {\n'
        content += '          name: \'FUNCTIONS_EXTENSION_VERSION\'\n'
        content += '          value: \'~4\'\n'
        content += '        }\n'
        content += '        {\n'
        content += '          name: \'FUNCTIONS_WORKER_RUNTIME\'\n'
        content += '          value: \'' + (cfg.runtimeStack ? cfg.runtimeStack.split('|')[0].toLowerCase().replace('-isolated', '') : 'dotnet') + '\'\n'
        content += '        }\n'
        if (cfg.enableApplicationInsights) {
             content += '        {\n'
             content += '          name: \'APPINSIGHTS_INSTRUMENTATIONKEY\'\n'
             content += '          value: applicationInsights_' + cfg.name.replace(/[^a-zA-Z0-9]/g, '') + '.properties.InstrumentationKey\n'
             content += '        }\n'
        }
        content += '      ]\n'
        content += '      ftpsState: \'FtpsOnly\'\n'
        content += '      minTlsVersion: \'1.2\'\n'
        if (cfg.operatingSystem === 'Linux') {
             content += '      linuxFxVersion: \'' + (cfg.runtimeStack || 'DOTNET-ISOLATED|8.0') + '\'\n'
        } else {
             content += '      netFrameworkVersion: \'v8.0\'\n'
        }
        content += '    }\n'
        content += '    httpsOnly: ' + (cfg.httpsOnly !== false) + '\n'
        content += '  }\n'
        content += '  tags: tags\n'
        content += '}\n\n'
        if (!cfg.name) throw new Error('CognitiveService configuration is missing a name')
        content += '// Cognitive Service ' + cfg.name + '\n'
        content += 'resource cognitiveService_' + cfg.name.replace(/[^a-zA-Z0-9]/g, '') + ' \'Microsoft.CognitiveServices/accounts@2023-05-01\' = {\n'

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
        if (cfg.collation) {
          content += '    collation: \'' + cfg.collation + '\'\n'
        }
        if (cfg.maxSizeBytes) {
          content += '    maxSizeBytes: ' + cfg.maxSizeBytes + '\n'
        }
        if (cfg.readScale) {
          content += '    readScale: \'' + cfg.readScale + '\'\n'
        }
        if (cfg.zoneRedundant !== undefined) {
          content += '    zoneRedundant: ' + cfg.zoneRedundant + '\n'
        }
        if (cfg.enableThreatDetection !== undefined) {
          content += '    threatDetectionSettings: {\n'
          content += '      state: \'' + (cfg.enableThreatDetection ? 'Enabled' : 'Disabled') + '\'\n'
          content += '    }\n'
        }
        content += '  }\n'
        content += '  tags: tags\n'
        content += '}\n\n'
      }
      
      if (item.value === 'ContainerApp') {
        if (!cfg.name) throw new Error('ContainerApp configuration is missing a name')
        
        // Container Apps Environment
        const envName = cfg.containerAppEnvironment || (appName.value + '-' + selectedEnv.value + '-cae')
        content += '// Container Apps Environment ' + envName + '\n'
        content += 'resource containerAppEnvironment_' + envName.replace(/[^a-zA-Z0-9]/g, '') + ' \'Microsoft.App/managedEnvironments@2023-05-01\' = {\n'
        content += '  name: \'' + envName + '\'\n'
        content += '  location: location\n'
        content += '  properties: {\n'
        content += '    zoneRedundant: false\n'
        content += '  }\n'
        content += '  tags: tags\n'
        content += '}\n\n'
        
        // Container App
        content += '// Container App ' + cfg.name + '\n'
        content += 'resource containerApp_' + cfg.name.replace(/[^a-zA-Z0-9]/g, '') + ' \'Microsoft.App/containerApps@2023-05-01\' = {\n'
        content += '  name: \'' + cfg.name + '\'\n'
        content += '  location: location\n'
        content += '  dependsOn: [\n'
        content += '    containerAppEnvironment_' + envName.replace(/[^a-zA-Z0-9]/g, '') + '\n'
        content += '  ]\n'
        content += '  properties: {\n'
        content += '    managedEnvironmentId: containerAppEnvironment_' + envName.replace(/[^a-zA-Z0-9]/g, '') + '.id\n'
        content += '    configuration: {\n'
        if (cfg.enableIngress) {
          content += '      ingress: {\n'
          content += '        external: true\n'
          content += '        targetPort: ' + (cfg.targetPort || 80) + '\n'
          content += '        allowInsecure: ' + (cfg.allowInsecure || false) + '\n'
          content += '        traffic: [\n'
          content += '          {\n'
          content += '            weight: 100\n'
          content += '            latestRevision: true\n'
          content += '          }\n'
          content += '        ]\n'
          content += '      }\n'
        }
        content += '      secrets: []\n'
        content += '    }\n'
        content += '    template: {\n'
        content += '      containers: [\n'
        content += '        {\n'
        content += '          name: \'' + cfg.name.toLowerCase().replace(/[^a-z0-9-]/g, '-') + '\'\n'
        content += '          image: \'' + (cfg.containerImage || 'ubuntu:latest') + '\'\n'
        content += '          resources: {\n'
        content += '            cpu: ' + (cfg.cpu || '0.25') + '\n'
        content += '            memory: \'' + (cfg.memory || '0.5Gi') + '\'\n'
        content += '          }\n'
        if (cfg.environmentVariables && cfg.environmentVariables.length > 0) {
          content += '          env: [\n'
          cfg.environmentVariables.forEach(envVar => {
            if (envVar.name && envVar.value) {
              content += '            {\n'
              content += '              name: \'' + envVar.name + '\'\n'
              content += '              value: \'' + envVar.value + '\'\n'
              content += '            }\n'
            }
          })
          content += '          ]\n'
        }
        content += '        }\n'
        content += '      ]\n'
        content += '      scale: {\n'
        content += '        minReplicas: ' + (cfg.minReplicas || 0) + '\n'
        content += '        maxReplicas: ' + (cfg.maxReplicas || 10) + '\n'
        content += '      }\n'
        content += '    }\n'
        content += '  }\n'
        content += '  tags: tags\n'
        content += '}\n\n'
      }
      
      if (item.value === 'MonitoringAlerts') {
        if (!cfg.name) throw new Error('MonitoringAlerts configuration is missing a name')
        content += '// Application Insights ' + cfg.name + '\n'
        content += 'resource applicationInsights_' + cfg.name.replace(/[^a-zA-Z0-9]/g, '') + ' \'Microsoft.Insights/components@2020-02-02\' = {\n'

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
    
    // Generar comandos de despliegue
    let commands = '# 1. Crear grupo de recursos (si no existe)\n'
    commands += `az group create --name ${resourceGroup.value} --location ${location.value}\n\n`
    
    commands += '# 2. Validar despliegue (What-If)\n'
    commands += `az deployment group what-if --resource-group ${resourceGroup.value} --template-file infra.bicep\n\n`
    
    commands += '# 3. Ejecutar despliegue\n'
    commands += `az deployment group create --resource-group ${resourceGroup.value} --template-file infra.bicep`
    
    deploymentCommands.value = commands

  } catch (error) {
    console.error('Error al generar Bicep:', error)
    errorMsg.value = 'Error al generar el código Bicep: ' + error.message
  }
}

const openGeneratedInfraDialog = () => {
  generateBicep()

  if (bicepContent.value) {
    showGeneratedInfraDialog.value = true
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

const buildDeploymentCommands = (groupName, deployLocation) => {
  if (!groupName || !deployLocation) return ''

  let commands = '# 1. Crear grupo de recursos (si no existe)\n'
  commands += `az group create --name ${groupName} --location ${deployLocation}\n\n`
  commands += '# 2. Validar despliegue (What-If)\n'
  commands += `az deployment group what-if --resource-group ${groupName} --template-file infra.bicep\n\n`
  commands += '# 3. Ejecutar despliegue\n'
  commands += `az deployment group create --resource-group ${groupName} --template-file infra.bicep`

  return commands
}

const openBicepImporter = () => {
  bicepFileInput.value?.click()
}

const toConfiguredComponents = (components) => {
  return components.map(component => {
    const metadata = availableComponents.find(item => item.value === component.value)

    return {
      value: component.value,
      label: metadata?.label || component.value,
      description: metadata?.description || '',
      config: component.config || {}
    }
  })
}

const handleBicepImport = async (event) => {
  try {
    errorMsg.value = ''
    infoMsg.value = ''

    const file = event.target?.files?.[0]
    if (!file) return

    const bicepSource = await file.text()
    const imported = parseInfragenBicep(bicepSource)

    appName.value = imported.appName || ''
    selectedEnv.value = imported.environment || 'dev'
    location.value = imported.location || location.value
    configuredComponents.value = toConfiguredComponents(imported.components)
    bicepContent.value = bicepSource

    if (imported.resourceGroupName) {
      resourceGroup.value = imported.resourceGroupName
    }

    deploymentCommands.value = buildDeploymentCommands(
      imported.resourceGroupName || resourceGroup.value,
      imported.location || location.value
    )

    showNotification(
      `Configuración importada desde Bicep (${configuredComponents.value.length} componentes).`,
      'success',
      'mdi-file-check'
    )
  } catch (error) {
    console.error('Error al importar Bicep:', error)
    errorMsg.value = `No se pudo importar el archivo Bicep: ${error.message}`
  } finally {
    if (event.target) {
      event.target.value = ''
    }
  }
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

.panel-scroll {
  max-height: 360px;
  overflow-y: auto;
}

.available-panel {
  max-height: none;
  overflow: visible;
}

.available-components-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.available-comp-card {
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease, background-color 0.18s ease;
  min-height: 92px;
}

.available-comp-card:hover,
.available-comp-card:focus-visible,
.available-comp-card:focus-within {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
}

:deep(.v-theme--dark .available-comp-card) {
  border-color: rgba(255, 255, 255, 0.2) !important;
  background-color: rgba(255, 255, 255, 0.02);
}

:deep(.v-theme--dark .available-comp-card:hover),
:deep(.v-theme--dark .available-comp-card:focus-visible),
:deep(.v-theme--dark .available-comp-card:focus-within) {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.35);
  border-color: rgba(255, 255, 255, 0.32) !important;
}

.cost-panel-scroll {
  max-height: 760px;
  overflow-y: auto;
}

.azure-admin-card {
  border-radius: 12px;
  overflow: hidden;
}

.azure-login-wrap {
  max-width: 520px;
  margin: 0 auto;
}

.azure-login-hero {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.14), rgba(25, 118, 210, 0.05));
  border: 1px solid rgba(25, 118, 210, 0.2);
}

.azure-login-form {
  border-color: rgba(0, 0, 0, 0.12) !important;
  border-radius: 10px;
}

:deep(.v-theme--dark .azure-login-form) {
  border-color: rgba(255, 255, 255, 0.2) !important;
}

.azure-login-form :deep(.azure-login-input .v-field) {
  transition: box-shadow 0.18s ease, transform 0.18s ease, border-color 0.18s ease;
}

.azure-login-form :deep(.azure-login-input .v-field.v-field--focused) {
  transform: translateY(-1px);
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.14);
}

.azure-auth-fade-enter-active,
.azure-auth-fade-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}

.azure-auth-fade-enter-from,
.azure-auth-fade-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

.azure-admin-actions {
  padding: 10px 16px 14px;
}

:deep(.v-theme--dark .top-action-btn) {
  color: #c9d1d9 !important;
}

:deep(.v-theme--dark .top-action-btn.top-action-danger) {
  color: #ff7b72 !important;
}

:deep(.v-theme--dark .top-action-btn.v-btn--disabled) {
  color: rgba(201, 209, 217, 0.45) !important;
}

:deep(.v-theme--dark .component-edit-btn) {
  background-color: #d29922 !important;
  color: #0d1117 !important;
}

:deep(.v-theme--dark .component-remove-btn) {
  background-color: #f85149 !important;
  color: #ffffff !important;
}

.compact-ui :deep(.v-card--variant-outlined) {
  border-color: rgba(0, 0, 0, 0.14) !important;
}

:deep(.v-theme--dark .compact-ui .v-card--variant-outlined) {
  border-color: rgba(255, 255, 255, 0.18) !important;
}

:deep(.v-theme--dark .compact-ui .text-medium-emphasis) {
  color: rgba(255, 255, 255, 0.78) !important;
}

:deep(.v-theme--dark .compact-ui .text-grey-darken-1) {
  color: rgba(255, 255, 255, 0.72) !important;
}

:deep(.v-theme--dark .compact-ui .text-grey-darken-2) {
  color: rgba(255, 255, 255, 0.62) !important;
}

.compact-ui :deep(.text-h5) {
  font-size: 1.45rem !important;
}

.compact-ui :deep(.v-card-title) {
  font-size: 0.86rem;
  padding-top: 8px;
  padding-bottom: 8px;
}

.compact-ui :deep(.v-list-item-title) {
  font-size: 0.8rem;
  line-height: 1.15;
}

.compact-ui :deep(.v-list-item-subtitle) {
  font-size: 0.68rem;
  line-height: 1.1;
}

.compact-ui :deep(.v-field__input),
.compact-ui :deep(.v-field__field .v-label) {
  font-size: 0.78rem;
}

.compact-ui :deep(.v-field__input) {
  min-height: 30px;
}

.compact-ui :deep(.v-btn) {
  font-size: 0.7rem;
  letter-spacing: 0.02em;
  min-height: 30px;
  padding-left: 10px;
  padding-right: 10px;
}

.compact-ui :deep(.v-btn--size-small) {
  min-height: 26px;
  padding-left: 8px;
  padding-right: 8px;
}

.compact-ui :deep(.v-list-item .v-btn--size-small) {
  min-height: 22px;
  padding-left: 6px;
  padding-right: 6px;
  font-size: 0.64rem;
  letter-spacing: 0.01em;
}

.compact-ui :deep(.v-btn--icon) {
  width: 28px;
  height: 28px;
}

.compact-ui :deep(.v-chip) {
  font-size: 0.7rem;
}

.compact-ui :deep(.text-body-2) {
  font-size: 0.74rem;
}

.compact-ui :deep(.text-caption) {
  font-size: 0.64rem;
}

.compact-ui :deep(.cost-panel-scroll .text-h6) {
  font-size: 0.96rem !important;
}

.compact-ui :deep(.cost-panel-scroll .text-subtitle-2) {
  font-size: 0.74rem !important;
}

@media (min-width: 1900px) {
  .compact-ui :deep(.text-h5) {
    font-size: 1.3rem !important;
  }

  .compact-ui :deep(.v-list-item-title) {
    font-size: 0.76rem;
  }

  .compact-ui :deep(.v-list-item-subtitle) {
    font-size: 0.64rem;
  }
}

@media (max-width: 1260px) {
  .available-panel {
    max-height: 360px;
    overflow-y: auto;
  }

  .available-components-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 700px) {
  .available-components-grid {
    grid-template-columns: 1fr;
  }
}
</style>
