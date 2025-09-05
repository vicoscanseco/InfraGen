<template>
  <v-card class="mb-4">
    <v-card-title class="bg-primary">
      <v-icon class="mr-2">mdi-database</v-icon>
      SQL Server Configuration
    </v-card-title>
    <v-card-text>
      <v-row dense class="mt-3">
        <v-col cols="12" md="6">
          <v-tooltip location="top">
            <template v-slot:activator="{ props }">
              <v-text-field 
                v-bind="props"
                v-model="localConfig.baseName" 
                label="Nombre Base del Servidor" 
                placeholder="Ej: myserver" 
                density="compact" 
                variant="outlined" 
                :rules="[rules.required]"
                @input="updateConfig"
              />
            </template>
            <span>Nombre base para el servidor SQL. Se combinará automáticamente con el formato: sqls-{nombre}-{environment}. Solo para producción se omite el environment.</span>
          </v-tooltip>
        </v-col>
        <v-col cols="12" md="6">
          <v-tooltip location="top">
            <template v-slot:activator="{ props }">
              <v-text-field 
                v-bind="props"
                v-model="localConfig.name" 
                label="Nombre Final del SQL Server" 
                placeholder="Se genera automáticamente" 
                density="compact" 
                variant="outlined" 
                readonly
                append-inner-icon="mdi-lock"
                hint="Se genera automáticamente: sqls-{nombre}-{environment}"
                persistent-hint
                :rules="[rules.required]"
              />
            </template>
            <span>Nombre final único global para el servidor SQL. Se genera automáticamente basado en el nombre base y ambiente. Será la URL de conexión (nombreservidor.database.windows.net)</span>
          </v-tooltip>
          
          <!-- Chip de preview del nombre del SQL Server -->
          <div class="mt-2" v-if="computedSqlServerName">
            <v-chip color="blue" variant="outlined" size="small">
              <v-icon left>mdi-eye</v-icon>
              Preview: {{ computedSqlServerName }}
            </v-chip>
          </div>
        </v-col>
      </v-row>
      
      <v-row dense>
        <v-col cols="12" md="6">
          <v-tooltip location="top">
            <template v-slot:activator="{ props }">
              <v-text-field 
                v-bind="props"
                v-model="localConfig.adminUsername" 
                label="Usuario Administrador" 
                placeholder="Ej: sqladmin" 
                density="compact" 
                variant="outlined"
                :rules="[rules.required]"
                @input="updateConfig"
              />
            </template>
            <span>Nombre del usuario administrador del servidor SQL. No puede ser 'admin', 'administrator', 'sa', 'root', etc. Será usado para crear bases de datos y gestionar permisos</span>
          </v-tooltip>
        </v-col>
      </v-row>
      
      <v-row dense>
        <v-col cols="12" md="6">
          <v-tooltip location="top">
            <template v-slot:activator="{ props }">
              <v-text-field 
                v-bind="props"
                v-model="localConfig.adminPassword" 
                label="Contraseña Administrador" 
                type="password"
                placeholder="Contraseña segura" 
                density="compact" 
                variant="outlined"
                :rules="[rules.required, rules.passwordStrength]"
                @input="updateConfig"
              />
            </template>
            <span>Contraseña del administrador. Debe tener mínimo 8 caracteres, incluir mayúsculas, minúsculas, números y símbolos. Se usa para autenticación SQL Server y acceso completo al servidor</span>
          </v-tooltip>
        </v-col>
        <v-col cols="12" md="6">
          <v-tooltip location="top">
            <template v-slot:activator="{ props }">
              <v-select 
                v-bind="props"
                v-model="localConfig.version" 
                :items="versionOptions" 
                label="Versión de SQL Server" 
                density="compact" 
                variant="outlined"
                @update:modelValue="updateConfig"
              />
            </template>
            <span>Versión del motor de SQL Server. 12.0 corresponde a SQL Server 2014. Determina las características disponibles y compatibilidad con aplicaciones legacy</span>
          </v-tooltip>
        </v-col>
      </v-row>

      <v-row dense>
        <v-col cols="12" md="6">
          <v-tooltip location="top">
            <template v-slot:activator="{ props }">
              <v-select 
                v-bind="props"
                v-model="localConfig.minimalTlsVersion" 
                :items="tlsVersionOptions" 
                label="Versión Mínima TLS" 
                density="compact" 
                variant="outlined"
                @update:modelValue="updateConfig"
              />
            </template>
            <span>Versión mínima de TLS (Transport Layer Security) requerida para conexiones. TLS 1.2 es recomendado para máxima seguridad. Versiones inferiores pueden ser vulnerables</span>
          </v-tooltip>
        </v-col>
        <v-col cols="12" md="6">
          <v-tooltip location="top">
            <template v-slot:activator="{ props }">
              <v-select 
                v-bind="props"
                v-model="localConfig.publicNetworkAccess" 
                :items="networkAccessOptions" 
                label="Acceso de Red Pública" 
                density="compact" 
                variant="outlined"
                @update:modelValue="updateConfig"
              />
            </template>
            <span>Controla si el servidor SQL es accesible desde internet público. 'Deshabilitado' requiere configurar Private Endpoints o Service Endpoints para acceso seguro desde redes específicas</span>
          </v-tooltip>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'

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
    default: ''
  }
})

const emit = defineEmits(['update:config', 'update'])

const localConfig = ref({
  name: '',
  baseName: '', // Nombre base editable por el usuario
  adminUsername: 'sqladmin',
  adminPassword: 'P@ssw0rd123!',
  version: '12.0',
  minimalTlsVersion: '1.2',
  publicNetworkAccess: 'Enabled',
  ...props.config
})

// Computed property para generar el nombre automáticamente
const computedSqlServerName = computed(() => {
  if (!localConfig.value.baseName) return 'sqls-myserver-dev'
  
  const cleanBaseName = localConfig.value.baseName.toLowerCase().replace(/[^a-z0-9]/g, '')
  const env = props.environment || 'dev'
  
  // Para producción, no incluir environment
  if (env === 'prod') {
    return `sqls-${cleanBaseName}`
  } else {
    return `sqls-${cleanBaseName}-${env}`
  }
})

const versionOptions = [
  { title: '12.0', value: '12.0' }
]

const tlsVersionOptions = [
  { title: '1.0', value: '1.0' },
  { title: '1.1', value: '1.1' },
  { title: '1.2', value: '1.2' }
]

const networkAccessOptions = [
  { title: 'Habilitado', value: 'Enabled' },
  { title: 'Deshabilitado', value: 'Disabled' }
]

const rules = {
  required: value => !!value || 'Este campo es obligatorio',
  passwordStrength: value => {
    if (!value) return 'La contraseña es obligatoria'
    if (value.length < 8) return 'La contraseña debe tener al menos 8 caracteres'
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(value)) {
      return 'La contraseña debe contener al menos: una minúscula, una mayúscula, un número y un carácter especial'
    }
    return true
  }
}

// Función updateConfig debe declararse antes de los watchers
const updateConfig = () => {
  emit('update:config', { ...localConfig.value })
  emit('update', { ...localConfig.value })
}

// Watch para actualizar el nombre cuando cambien baseName o environment
watch([() => localConfig.value.baseName, () => props.environment], () => {
  localConfig.value.name = computedSqlServerName.value
  updateConfig()
})

// Watch para cambios en localConfig
watch(localConfig, updateConfig, { deep: true })

onMounted(() => {
  // Inicializar baseName si no existe
  if (!localConfig.value.baseName && props.appName) {
    localConfig.value.baseName = props.appName.toLowerCase().replace(/[^a-z0-9]/g, '')
  }
  // Inicializar con el nombre generado automáticamente
  localConfig.value.name = computedSqlServerName.value
  updateConfig()
})
</script>
