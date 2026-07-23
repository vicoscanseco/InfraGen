<template>
  <v-card class="mb-4">
    <v-card-title class="bg-primary">
      <v-icon class="mr-2">mdi-web</v-icon>
      App Service Configuration
    </v-card-title>
    <v-card-text>
      <v-row dense class="mt-3">
        <v-col cols="12" md="6">
          <v-tooltip text="Define el nombre base de tu App Service. Se combinará automáticamente con el entorno (dev, test, qa) para crear el nombre final único en Azure. En producción no se incluye el environment.">
            <template v-slot:activator="{ props }">
              <v-text-field 
                v-bind="props"
                v-model="localAppBaseName" 
                label="Nombre Base del App Service" 
                :placeholder="appServiceNumber === 1 ? 'Ej: myapp' : `Ej: myapp${appServiceNumber}`"
                density="compact" 
                variant="outlined"
                :rules="[rules.required, rules.appServiceNameFormat]"
                :hint="appServiceNumber === 1 ? 'Solo letras, números y guiones. Se agregará automáticamente el environment. Sugerido: myapp' : `Solo letras, números y guiones. Se agregará automáticamente el environment. Sugerido: myapp${appServiceNumber}`"
                persistent-hint
                @input="updateAppBaseName($event.target.value)"
              />
            </template>
          </v-tooltip>
          <v-chip 
            v-if="computedAppName"
            size="small" 
            color="warning" 
            variant="outlined" 
            class="mt-1"
          >
            Nombre completo: {{ computedAppName }}
          </v-chip>
        </v-col>
        <v-col cols="12" md="6">
          <v-tooltip text="Referencia automática al App Service Plan configurado en tu infraestructura. Esto determina el rendimiento y costo de tu aplicación.">
            <template v-slot:activator="{ props }">
              <v-text-field 
                v-bind="props"
                v-model="localConfig.appServicePlanReference" 
                label="Referencia al App Service Plan" 
                placeholder="Seleccionar App Service Plan existente" 
                density="compact" 
                variant="outlined"
                readonly
                hint="Se asignará automáticamente al ASP configurado"
                persistent-hint
              />
            </template>
          </v-tooltip>
        </v-col>
      </v-row>

      <v-row dense>
        <v-col cols="12" md="6">
          <v-tooltip text="Selecciona la tecnología y versión que usará tu aplicación. Esto afecta las librerías disponibles y el rendimiento.">
            <template v-slot:activator="{ props }">
              <v-select
                v-bind="props"
                v-model="localConfig.runtimeStack"
                :items="runtimeStackOptions"
                label="Runtime Stack"
                item-title="label"
                item-value="value"
                density="compact"
                variant="outlined"
                hint="Tecnología de la aplicación"
                persistent-hint
                @update:model-value="updateConfig('runtimeStack', $event)"
              />
            </template>
          </v-tooltip>
        </v-col>
        <v-col cols="12" md="6" class="d-flex flex-column">
          <v-tooltip text="Cuando está activado, redirige automáticamente todo el tráfico HTTP a HTTPS para mayor seguridad. Recomendado para producción.">
            <template v-slot:activator="{ props }">
              <v-switch
                v-bind="props"
                v-model="localConfig.httpsOnly"
                label="Solo HTTPS"
                density="compact"
                color="primary"
                hint="Redirigir HTTP a HTTPS automáticamente"
                persistent-hint
                class="mb-1"
                @update:model-value="updateConfig('httpsOnly', $event)"
              />
            </template>
          </v-tooltip>
          <v-tooltip text="Mantiene tu aplicación siempre cargada en memoria, evitando arranques en frío. Recomendado para aplicaciones de producción con tráfico constante.">
            <template v-slot:activator="{ props }">
              <v-switch
                v-bind="props"
                v-model="localConfig.alwaysOn"
                label="Always On"
                density="compact"
                color="primary"
                hint="Mantener la aplicación cargada todo el tiempo"
                persistent-hint
                @update:model-value="updateConfig('alwaysOn', $event)"
              />
            </template>
          </v-tooltip>
        </v-col>
      </v-row>

      <v-row dense>
        <v-col cols="12" md="6">
          <v-tooltip text="Habilita afinidad de sesión para mantener las peticiones del mismo usuario en la misma instancia. Útil para aplicaciones con estado de sesión.">
            <template v-slot:activator="{ props }">
              <v-switch
                v-bind="props"
                v-model="localConfig.clientAffinityEnabled"
                label="Client Affinity"
                density="compact"
                color="primary"
                hint="Habilitar afinidad de sesión"
                persistent-hint
                @update:model-value="updateConfig('clientAffinityEnabled', $event)"
              />
            </template>
          </v-tooltip>
        </v-col>
        <v-col cols="12" md="6">
          <v-tooltip text="Permite que tu aplicación sea accesible desde internet. Desactívalo solo si usas redes privadas o VPN para mayor seguridad.">
            <template v-slot:activator="{ props }">
              <v-switch
                v-bind="props"
                v-model="localConfig.publicNetworkAccess"
                label="Acceso de Red Público"
                density="compact"
                color="primary"
                hint="Permitir acceso desde internet"
                persistent-hint
                @update:model-value="updateConfig('publicNetworkAccess', $event)"
              />
            </template>
          </v-tooltip>
        </v-col>
      </v-row>

      <!-- Variables de Entorno (App Settings) -->
      <v-row dense>
        <v-col cols="12">
          <v-label class="mb-2 font-weight-bold">Variables de Entorno</v-label>
          <v-tooltip text="Configura variables de entorno (App Settings) que necesita tu aplicación. Evita incluir secretos aquí, usa Key Vault para información sensible.">
            <template v-slot:activator="{ props }">
              <div v-bind="props">
                <v-row
                  v-for="(setting, index) in localConfig.appSettings"
                  :key="`appsetting-${index}`"
                  dense
                  class="align-center mb-2"
                >
                  <v-col cols="5">
                    <v-text-field
                      v-model="setting.name"
                      label="Nombre"
                      density="compact"
                      variant="outlined"
                      placeholder="Ej: API_URL"
                      @input="updateAppSetting(index, 'name', $event.target.value)"
                    />
                  </v-col>
                  <v-col cols="5">
                    <v-text-field
                      v-model="setting.value"
                      label="Valor"
                      density="compact"
                      variant="outlined"
                      placeholder="Ej: https://api.midominio.com"
                      @input="updateAppSetting(index, 'value', $event.target.value)"
                    />
                  </v-col>
                  <v-col cols="2" class="text-center">
                    <v-btn
                      color="red"
                      size="small"
                      icon="mdi-delete"
                      @click="removeAppSetting(index)"
                    />
                  </v-col>
                </v-row>
                <v-btn
                  color="primary"
                  size="small"
                  prepend-icon="mdi-plus"
                  @click="addAppSetting"
                >
                  Agregar Variable
                </v-btn>
              </div>
            </template>
          </v-tooltip>
        </v-col>
      </v-row>

      <!-- Connection Strings -->
      <v-row dense>
        <v-col cols="12">
          <v-label class="mb-2 font-weight-bold">Connection Strings</v-label>
          <v-tooltip text="Configura las cadenas de conexión (Connection Strings) que necesita tu aplicación, por ejemplo hacia bases de datos. Evita incluir secretos aquí, usa Key Vault para información sensible.">
            <template v-slot:activator="{ props }">
              <div v-bind="props">
                <v-row
                  v-for="(conn, index) in localConfig.connectionStrings"
                  :key="`connectionstring-${index}`"
                  dense
                  class="align-center mb-2"
                >
                  <v-col cols="4">
                    <v-text-field
                      v-model="conn.name"
                      label="Nombre"
                      density="compact"
                      variant="outlined"
                      placeholder="Ej: DefaultConnection"
                      @input="updateConnectionString(index, 'name', $event.target.value)"
                    />
                  </v-col>
                  <v-col cols="4">
                    <v-text-field
                      v-model="conn.value"
                      label="Connection String"
                      density="compact"
                      variant="outlined"
                      placeholder="Ej: Server=tcp:...;Database=...;"
                      @input="updateConnectionString(index, 'value', $event.target.value)"
                    />
                  </v-col>
                  <v-col cols="3">
                    <v-select
                      v-model="conn.type"
                      :items="connectionStringTypeOptions"
                      label="Tipo"
                      density="compact"
                      variant="outlined"
                      @update:model-value="updateConnectionString(index, 'type', $event)"
                    />
                  </v-col>
                  <v-col cols="1" class="text-center">
                    <v-btn
                      color="red"
                      size="small"
                      icon="mdi-delete"
                      @click="removeConnectionString(index)"
                    />
                  </v-col>
                </v-row>
                <v-btn
                  color="primary"
                  size="small"
                  prepend-icon="mdi-plus"
                  @click="addConnectionString"
                >
                  Agregar Connection String
                </v-btn>
              </div>
            </template>
          </v-tooltip>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed, onMounted, reactive, ref, toRefs, watch } from 'vue'

const props = defineProps({
  config: {
    type: Object,
    required: true
  },
  environment: {
    type: String,
    required: true,
    default: 'dev'
  },
  availableAppServicePlans: {
    type: Array,
    default: () => []
  },
  appServiceNumber: {
    type: Number,
    default: 1
  }
})

const emit = defineEmits(['update', 'update:config'])
const { appServiceNumber } = toRefs(props)

const runtimeStackOptions = [
  { label: '.NET 10.0', value: 'DOTNETCORE|10.0' },
  { label: '.NET 9.0', value: 'DOTNETCORE|9.0' },
  { label: '.NET 8.0', value: 'DOTNETCORE|8.0' },
  { label: '.NET 6.0', value: 'DOTNETCORE|6.0' },
  { label: '.NET Framework 4.8', value: 'ASPNET|4.8' },
  { label: 'Node.js 22 LTS', value: 'NODE|22-lts' },
  { label: 'Node.js 20 LTS', value: 'NODE|20-lts' },
  { label: 'Node.js 18 LTS', value: 'NODE|18-lts' },
  { label: 'Python 3.12', value: 'PYTHON|3.12' },
  { label: 'Python 3.11', value: 'PYTHON|3.11' },
  { label: 'Python 3.10', value: 'PYTHON|3.10' },
  { label: 'Java 21', value: 'JAVA|21-java21' },
  { label: 'Java 17', value: 'JAVA|17-java17' },
  { label: 'Java 11', value: 'JAVA|11-java11' },
  { label: 'PHP 8.3', value: 'PHP|8.3' },
  { label: 'PHP 8.2', value: 'PHP|8.2' }
]

const connectionStringTypeOptions = [
  'SQLAzure',
  'SQLServer',
  'MySql',
  'PostgreSQL',
  'Custom',
  'NotificationHub',
  'ServiceBus',
  'EventHub',
  'ApiHub',
  'DocDb',
  'RedisCache'
]

const rules = {
  required: value => !!value || 'Este campo es obligatorio',
  appServiceNameFormat: value => {
    if (!value) return true
    const regex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,58}[a-zA-Z0-9]$/
    return regex.test(value) || 'Solo letras, números y guiones, 2-60 caracteres. Debe empezar y terminar con letra o número'
  }
}

const localAppBaseName = ref('')

const localConfig = reactive({
  appServicePlanReference: 'Se asignará al ASP configurado',
  runtimeStack: 'DOTNETCORE|8.0',
  httpsOnly: true,
  alwaysOn: false,
  clientAffinityEnabled: false,
  publicNetworkAccess: true,
  appSettings: [],
  connectionStrings: [],
  ...props.config
})

// Deriva el nombre final del App Service respetando la regla de producción sin environment.
const computedAppName = computed(() => {
  const env = props.environment || 'dev'
  if (env === 'prod') {
    return localAppBaseName.value || ''
  }
  return localAppBaseName.value ? `${localAppBaseName.value}-${env}` : ''
})

// Toma automáticamente el primer App Service Plan disponible.
const assignedAppServicePlan = computed(() => {
  return props.availableAppServicePlans.length > 0 ? props.availableAppServicePlans[0].name : null
})

// Emite cambios hacia el padre manteniendo el contrato actual del componente.
const updateConfig = (key, value) => {
  localConfig[key] = value
  emit('update', { ...props.config, [key]: value })
  emit('update:config', { ...props.config, [key]: value })
}

const updateAppBaseName = (value) => {
  localAppBaseName.value = value
}

// Gestión de variables de entorno (App Settings)
const addAppSetting = () => {
  localConfig.appSettings.push({ name: '', value: '' })
  updateConfig('appSettings', [...localConfig.appSettings])
}

const removeAppSetting = (index) => {
  localConfig.appSettings.splice(index, 1)
  updateConfig('appSettings', [...localConfig.appSettings])
}

const updateAppSetting = (index, field, value) => {
  localConfig.appSettings[index][field] = value
  updateConfig('appSettings', [...localConfig.appSettings])
}

// Gestión de connection strings
const addConnectionString = () => {
  localConfig.connectionStrings.push({ name: '', value: '', type: 'SQLAzure' })
  updateConfig('connectionStrings', [...localConfig.connectionStrings])
}

const removeConnectionString = (index) => {
  localConfig.connectionStrings.splice(index, 1)
  updateConfig('connectionStrings', [...localConfig.connectionStrings])
}

const updateConnectionString = (index, field, value) => {
  localConfig.connectionStrings[index][field] = value
  updateConfig('connectionStrings', [...localConfig.connectionStrings])
}

watch(localAppBaseName, () => {
  updateConfig('name', computedAppName.value)
})

watch(assignedAppServicePlan, (newPlan) => {
  if (newPlan) {
    localConfig.appServicePlanReference = newPlan
    updateConfig('appServicePlan', newPlan)
  }
})

watch(() => props.config, (newConfig) => {
  Object.assign(localConfig, {
    appServicePlanReference: 'Se asignará al ASP configurado',
    runtimeStack: 'DOTNETCORE|8.0',
    httpsOnly: true,
    alwaysOn: false,
    clientAffinityEnabled: false,
    publicNetworkAccess: true,
    appSettings: [],
    connectionStrings: [],
    ...newConfig
  })
}, { deep: true, immediate: true })

onMounted(() => {
  if (props.config.name) {
    const env = props.environment || 'dev'
    let baseName = props.config.name

    if (env !== 'prod') {
      const suffix = `-${env}`
      if (baseName.endsWith(suffix)) {
        baseName = baseName.replace(suffix, '')
      }
    }

    localAppBaseName.value = baseName
  } else {
    localAppBaseName.value = appServiceNumber.value === 1 ? 'myapp' : `myapp${appServiceNumber.value}`
  }

  if (assignedAppServicePlan.value && !props.config.appServicePlan) {
    localConfig.appServicePlanReference = assignedAppServicePlan.value
    updateConfig('appServicePlan', assignedAppServicePlan.value)
  }
})
</script>


