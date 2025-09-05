<template>
  <v-card class="mb-4">
    <v-card-title class="bg-primary">
      <v-icon class="mr-2">mdi-database</v-icon>
      SQL Server Configuration
    </v-card-title>
    <v-card-text>
      <v-row dense class="mt-3">
        <v-col cols="12" md="6">
          <v-text-field 
            v-model="localConfig.name" 
            label="Nombre del SQL Server" 
            placeholder="Ej: my-sql-server" 
            density="compact" 
            variant="outlined" 
            :rules="[rules.required]"
            @input="updateConfig"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field 
            v-model="localConfig.adminUsername" 
            label="Usuario Administrador" 
            placeholder="Ej: sqladmin" 
            density="compact" 
            variant="outlined"
            :rules="[rules.required]"
            @input="updateConfig"
          />
        </v-col>
      </v-row>
      
      <v-row dense>
        <v-col cols="12" md="6">
          <v-text-field 
            v-model="localConfig.adminPassword" 
            label="Contraseña Administrador" 
            type="password"
            placeholder="Contraseña segura" 
            density="compact" 
            variant="outlined"
            :rules="[rules.required, rules.passwordStrength]"
            @input="updateConfig"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-select 
            v-model="localConfig.version" 
            :items="versionOptions" 
            label="Versión de SQL Server" 
            density="compact" 
            variant="outlined"
            @update:modelValue="updateConfig"
          />
        </v-col>
      </v-row>

      <v-row dense>
        <v-col cols="12" md="6">
          <v-select 
            v-model="localConfig.minimalTlsVersion" 
            :items="tlsVersionOptions" 
            label="Versión Mínima TLS" 
            density="compact" 
            variant="outlined"
            @update:modelValue="updateConfig"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-select 
            v-model="localConfig.publicNetworkAccess" 
            :items="networkAccessOptions" 
            label="Acceso de Red Pública" 
            density="compact" 
            variant="outlined"
            @update:modelValue="updateConfig"
          />
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
