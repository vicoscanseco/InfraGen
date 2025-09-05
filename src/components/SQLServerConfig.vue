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
                v-model="localConfig.name" 
                label="Nombre del SQL Server" 
                placeholder="Ej: my-sql-server" 
                density="compact" 
                variant="outlined" 
                :rules="[rules.required]"
                @input="updateConfig"
              />
            </template>
            <span>Nombre único global para el servidor SQL. Debe ser único en Azure, solo letras minúsculas, números y guiones. Será la base de la URL de conexión (nombreservidor.database.windows.net)</span>
          </v-tooltip>
        </v-col>
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
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
  config: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:config', 'update'])

const localConfig = ref({
  name: 'my-sql-server',
  adminUsername: 'sqladmin',
  adminPassword: 'P@ssw0rd123!',
  version: '12.0',
  minimalTlsVersion: '1.2',
  publicNetworkAccess: 'Enabled',
  ...props.config
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

const updateConfig = () => {
  emit('update:config', { ...localConfig.value })
  emit('update', { ...localConfig.value })
}

watch(localConfig, updateConfig, { deep: true })

onMounted(() => {
  updateConfig()
})
</script>
