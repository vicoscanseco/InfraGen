<template>
  <v-card class="mb-4">
    <v-card-title class="bg-primary">
      <v-icon class="mr-2">mdi-kubernetes</v-icon>
      Container App Configuration
    </v-card-title>
    <v-card-text>
      <v-row dense class="mt-3">
        <v-col cols="12" md="6">
          <v-tooltip text="Define el nombre base de tu Container App. Se combinará automáticamente con el entorno (dev, test, stage) para crear el nombre final único en Azure. En producción no se incluye el environment.">
            <template v-slot:activator="{ props }">
              <v-text-field 
                v-bind="props"
                v-model="localContainerAppBaseName" 
                label="Nombre Base del Container App" 
                placeholder="Ej: mycontainerapp"
                density="compact" 
                variant="outlined"
                :rules="[rules.required, rules.containerAppNameFormat]"
                hint="Solo letras minúsculas, números y guiones. Se agregará automáticamente el environment."
                persistent-hint
                @input="updateContainerAppBaseName($event.target.value)"
              />
            </template>
          </v-tooltip>
          <v-chip 
            v-if="computedContainerAppName"
            size="small" 
            color="warning" 
            variant="outlined" 
            class="mt-1"
          >
            Nombre completo: {{ computedContainerAppName }}
          </v-chip>
        </v-col>
        <v-col cols="12" md="6">
          <v-tooltip text="Nombre del Container Apps Environment que alojará tu aplicación. Se crea automáticamente si no existe.">
            <template v-slot:activator="{ props }">
              <v-text-field 
                v-bind="props"
                v-model="localConfig.containerAppEnvironment" 
                label="Container Apps Environment" 
                placeholder="Se genera automáticamente" 
                density="compact" 
                variant="outlined"
                readonly
                hint="Environment compartido para tus Container Apps"
                persistent-hint
              />
            </template>
          </v-tooltip>
        </v-col>
      </v-row>

      <v-row dense>
        <v-col cols="12" md="6">
          <v-tooltip text="Imagen del container que se desplegará. Puede ser desde Docker Hub, Azure Container Registry o cualquier registry público.">
            <template v-slot:activator="{ props }">
              <v-text-field
                v-bind="props"
                v-model="localConfig.containerImage"
                label="Container Image"
                placeholder="Ej: ubuntu:latest"
                density="compact"
                variant="outlined"
                :rules="[rules.required]"
                hint="Formato: registry/image:tag"
                persistent-hint
                @input="updateConfig('containerImage', $event.target.value)"
              />
            </template>
          </v-tooltip>
        </v-col>
        <v-col cols="12" md="6">
          <v-tooltip text="Puerto que expone tu aplicación container. Típicamente 80 para HTTP, 443 para HTTPS, 3000 para Node.js, 8080 para Java, etc.">
            <template v-slot:activator="{ props }">
              <v-text-field
                v-bind="props"
                v-model.number="localConfig.targetPort"
                label="Puerto del Container"
                placeholder="80"
                type="number"
                density="compact"
                variant="outlined"
                :rules="[rules.required, rules.validPort]"
                hint="Puerto que expone tu aplicación (1-65535)"
                persistent-hint
                @input="updateConfig('targetPort', parseInt($event.target.value))"
              />
            </template>
          </v-tooltip>
        </v-col>
      </v-row>

      <v-row dense>
        <v-col cols="12" md="6">
          <v-tooltip text="Recursos de CPU asignados al container. Valores típicos: 0.25, 0.5, 1.0, 2.0 vCPUs.">
            <template v-slot:activator="{ props }">
              <v-select
                v-bind="props"
                v-model="localConfig.cpu"
                :items="cpuOptions"
                label="CPU"
                item-title="label"
                item-value="value"
                density="compact"
                variant="outlined"
                hint="vCPUs asignadas al container"
                persistent-hint
                @update:model-value="updateConfig('cpu', $event)"
              />
            </template>
          </v-tooltip>
        </v-col>
        <v-col cols="12" md="6">
          <v-tooltip text="Memoria RAM asignada al container. Debe ser proporcional a la CPU seleccionada.">
            <template v-slot:activator="{ props }">
              <v-select
                v-bind="props"
                v-model="localConfig.memory"
                :items="memoryOptions"
                label="Memoria"
                item-title="label"
                item-value="value"
                density="compact"
                variant="outlined"
                hint="Memoria RAM en GB"
                persistent-hint
                @update:model-value="updateConfig('memory', $event)"
              />
            </template>
          </v-tooltip>
        </v-col>
      </v-row>

      <v-row dense>
        <v-col cols="12" md="6">
          <v-tooltip text="Número mínimo de réplicas que siempre estarán ejecutándose. 0 permite scale-to-zero para ahorrar costos.">
            <template v-slot:activator="{ props }">
              <v-text-field
                v-bind="props"
                v-model.number="localConfig.minReplicas"
                label="Réplicas Mínimas"
                type="number"
                min="0"
                max="25"
                density="compact"
                variant="outlined"
                :rules="[rules.validReplicas]"
                hint="0-25 réplicas (0 = scale-to-zero)"
                persistent-hint
                @input="updateConfig('minReplicas', parseInt($event.target.value))"
              />
            </template>
          </v-tooltip>
        </v-col>
        <v-col cols="12" md="6">
          <v-tooltip text="Número máximo de réplicas para auto-scaling. El sistema escalará automáticamente basado en la carga.">
            <template v-slot:activator="{ props }">
              <v-text-field
                v-bind="props"
                v-model.number="localConfig.maxReplicas"
                label="Réplicas Máximas"
                type="number"
                min="1"
                max="25"
                density="compact"
                variant="outlined"
                :rules="[rules.validReplicas, rules.maxGreaterThanMin]"
                hint="1-25 réplicas máximas"
                persistent-hint
                @input="updateConfig('maxReplicas', parseInt($event.target.value))"
              />
            </template>
          </v-tooltip>
        </v-col>
      </v-row>

      <v-row dense>
        <v-col cols="12" md="6" class="d-flex flex-column">
          <v-tooltip text="Permite acceso público desde Internet. Desactivar para aplicaciones internas que solo necesitan acceso desde dentro del environment.">
            <template v-slot:activator="{ props }">
              <v-switch
                v-bind="props"
                v-model="localConfig.enableIngress"
                label="Acceso Público (Ingress)"
                density="compact"
                color="primary"
                hint="Permitir tráfico desde Internet"
                persistent-hint
                class="mb-1"
                @update:model-value="updateConfig('enableIngress', $event)"
              />
            </template>
          </v-tooltip>
          <v-tooltip text="Habilita el tráfico HTTPS/TLS para tu Container App. Recomendado para aplicaciones en producción.">
            <template v-slot:activator="{ props }">
              <v-switch
                v-bind="props"
                v-model="localConfig.allowInsecure"
                :disabled="!localConfig.enableIngress"
                label="Permitir HTTP (No seguro)"
                density="compact"
                color="orange"
                hint="Permitir tráfico HTTP además de HTTPS"
                persistent-hint
                @update:model-value="updateConfig('allowInsecure', $event)"
              />
            </template>
          </v-tooltip>
        </v-col>
        <v-col cols="12" md="6">
          <v-tooltip text="Política de reinicio del container cuando falla o se detiene.">
            <template v-slot:activator="{ props }">
              <v-select
                v-bind="props"
                v-model="localConfig.restartPolicy"
                :items="restartPolicyOptions"
                label="Política de Reinicio"
                item-title="label"
                item-value="value"
                density="compact"
                variant="outlined"
                hint="Comportamiento ante fallos"
                persistent-hint
                @update:model-value="updateConfig('restartPolicy', $event)"
              />
            </template>
          </v-tooltip>
        </v-col>
      </v-row>

      <!-- Variables de Entorno -->
      <v-row dense>
        <v-col cols="12">
          <v-label class="mb-2 font-weight-bold">Variables de Entorno</v-label>
          <v-tooltip text="Configura variables de entorno que necesita tu aplicación. Evita incluir secretos aquí, usa Key Vault para información sensible.">
            <template v-slot:activator="{ props }">
              <div v-bind="props">
                <v-row 
                  v-for="(envVar, index) in localConfig.environmentVariables" 
                  :key="`env-${index}`" 
                  dense 
                  class="align-center mb-2"
                >
                  <v-col cols="5">
                    <v-text-field
                      v-model="envVar.name"
                      label="Nombre"
                      density="compact"
                      variant="outlined"
                      placeholder="Ej: PORT"
                      @input="updateEnvVar(index, 'name', $event.target.value)"
                    />
                  </v-col>
                  <v-col cols="5">
                    <v-text-field
                      v-model="envVar.value"
                      label="Valor"
                      density="compact"
                      variant="outlined"
                      placeholder="Ej: 80"
                      @input="updateEnvVar(index, 'value', $event.target.value)"
                    />
                  </v-col>
                  <v-col cols="2" class="text-center">
                    <v-btn
                      color="red"
                      size="small"
                      icon="mdi-delete"
                      @click="removeEnvVar(index)"
                    />
                  </v-col>
                </v-row>
                <v-btn
                  color="primary"
                  size="small"
                  prepend-icon="mdi-plus"
                  @click="addEnvVar"
                >
                  Agregar Variable
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
import { ref, computed, watch, onMounted } from 'vue'

const props = defineProps({
  config: {
    type: Object,
    default: () => ({})
  },
  appName: {
    type: String,
    default: ''
  },
  environment: {
    type: String,
    default: 'dev'
  }
})

const emit = defineEmits(['update:config'])

// Reactive local config
const localConfig = ref({
  name: '',
  containerAppEnvironment: '',
  containerImage: 'ubuntu:latest',
  targetPort: 80,
  cpu: '0.25',
  memory: '0.5Gi',
  minReplicas: 0,
  maxReplicas: 10,
  enableIngress: true,
  allowInsecure: false,
  restartPolicy: 'Always',
  environmentVariables: [],
  ...props.config
})

// Base name handling
const localContainerAppBaseName = ref('')

// Computed container app name
const computedContainerAppName = computed(() => {
  if (!localContainerAppBaseName.value || !props.appName || !props.environment) return ''
  const cleanAppName = props.appName.toLowerCase().replace(/[^a-z0-9]/g, '')
  const cleanBaseName = localContainerAppBaseName.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
  
  // Para producción, no incluir environment
  if (props.environment === 'prod') {
    return `${cleanAppName}-${cleanBaseName}-ca`
  } else {
    return `${cleanAppName}-${cleanBaseName}-${props.environment}-ca`
  }
})

// CPU options
const cpuOptions = ref([
  { label: '0.25 vCPU', value: '0.25' },
  { label: '0.5 vCPU', value: '0.5' },
  { label: '0.75 vCPU', value: '0.75' },
  { label: '1.0 vCPU', value: '1.0' },
  { label: '1.25 vCPU', value: '1.25' },
  { label: '1.5 vCPU', value: '1.5' },
  { label: '1.75 vCPU', value: '1.75' },
  { label: '2.0 vCPU', value: '2.0' }
])

// Memory options
const memoryOptions = ref([
  { label: '0.5 Gi', value: '0.5Gi' },
  { label: '1.0 Gi', value: '1.0Gi' },
  { label: '1.5 Gi', value: '1.5Gi' },
  { label: '2.0 Gi', value: '2.0Gi' },
  { label: '3.0 Gi', value: '3.0Gi' },
  { label: '4.0 Gi', value: '4.0Gi' }
])

// Restart policy options
const restartPolicyOptions = ref([
  { label: 'Always - Siempre reiniciar', value: 'Always' },
  { label: 'OnFailure - Solo en caso de fallo', value: 'OnFailure' },
  { label: 'Never - Nunca reiniciar', value: 'Never' }
])

// Validation rules
const rules = {
  required: value => !!value || 'Este campo es obligatorio',
  containerAppNameFormat: value => {
    const pattern = /^[a-z0-9-]+$/
    return pattern.test(value) || 'Solo letras minúsculas, números y guiones'
  },
  validPort: value => {
    const port = parseInt(value)
    return (port >= 1 && port <= 65535) || 'Puerto debe estar entre 1 y 65535'
  },
  validReplicas: value => {
    const replicas = parseInt(value)
    return (replicas >= 0 && replicas <= 25) || 'Réplicas deben estar entre 0 y 25'
  },
  maxGreaterThanMin: value => {
    const max = parseInt(value)
    const min = parseInt(localConfig.value.minReplicas)
    return max >= min || 'Réplicas máximas deben ser >= mínimas'
  }
}

// Generate container app environment name
const generateContainerAppEnvironment = () => {
  if (props.appName && props.environment) {
    const cleanAppName = props.appName.toLowerCase().replace(/[^a-z0-9]/g, '')
    if (props.environment === 'prod') {
      return `${cleanAppName}-cae`
    } else {
      return `${cleanAppName}-${props.environment}-cae`
    }
  }
  return ''
}

// Initialize environment variables if empty
const initializeEnvironmentVariables = () => {
  if (!localConfig.value.environmentVariables || localConfig.value.environmentVariables.length === 0) {
    localConfig.value.environmentVariables = []
  }
}

// Environment variables management
const addEnvVar = () => {
  localConfig.value.environmentVariables.push({
    name: '',
    value: ''
  })
  emitUpdate()
}

const removeEnvVar = (index) => {
  localConfig.value.environmentVariables.splice(index, 1)
  emitUpdate()
}

const updateEnvVar = (index, field, value) => {
  localConfig.value.environmentVariables[index][field] = value
  emitUpdate()
}

// Update functions
const updateContainerAppBaseName = (value) => {
  localContainerAppBaseName.value = value
  localConfig.value.name = computedContainerAppName.value
  emitUpdate()
}

const updateConfig = (key, value) => {
  localConfig.value[key] = value
  emitUpdate()
}

const emitUpdate = () => {
  emit('update:config', { ...localConfig.value })
}

// Watch for external config changes
watch(() => props.config, (newConfig) => {
  if (newConfig) {
    localConfig.value = { ...localConfig.value, ...newConfig }
  }
}, { deep: true, immediate: true })

// Watch for computed name changes
watch(computedContainerAppName, (newName) => {
  if (newName) {
    localConfig.value.name = newName
    emitUpdate()
  }
})

// Watch for app name or environment changes to update container app environment
watch([() => props.appName, () => props.environment], () => {
  localConfig.value.containerAppEnvironment = generateContainerAppEnvironment()
  emitUpdate()
}, { immediate: true })

// Initialize component
onMounted(() => {
  initializeEnvironmentVariables()
  localConfig.value.containerAppEnvironment = generateContainerAppEnvironment()
  
  // Set default container app base name if not provided
  if (!localContainerAppBaseName.value && !localConfig.value.name) {
    localContainerAppBaseName.value = 'webapp'
  }
  
  emitUpdate()
})
</script>

<style scoped>
.v-label {
  opacity: 1;
  font-size: 14px;
}
</style>