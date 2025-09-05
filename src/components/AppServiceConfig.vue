<template>
  <v-card class="mb-4">
    <v-card-title class="bg-primary">
      <v-icon class="mr-2">mdi-web</v-icon>
      App Service Configuration
    </v-card-title>
    <v-card-text>
      <v-row dense class="mt-3">
        <v-col cols="12" md="6">
          <v-text-field 
            v-model="localAppBaseName" 
            label="Nombre Base del App Service" 
            placeholder="Ej: myappservice" 
            density="compact" 
            variant="outlined"
            :rules="[rules.required, rules.appServiceNameFormat]"
            hint="Solo letras, números y guiones. Se agregará automáticamente '-' y el environment"
            persistent-hint
            @input="updateAppBaseName($event.target.value)"
          />
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
          <v-text-field 
            v-model="localConfig.appServicePlanReference" 
            label="Referencia al App Service Plan" 
            placeholder="Seleccionar App Service Plan existente" 
            density="compact" 
            variant="outlined"
            readonly
            hint="Se asignará automáticamente al ASP configurado"
            persistent-hint
          />
        </v-col>
      </v-row>

      <v-row dense>
        <v-col cols="12" md="6">
          <v-select
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
        </v-col>
        <v-col cols="12" md="6" class="d-flex flex-column">
          <v-switch
            v-model="localConfig.httpsOnly"
            label="Solo HTTPS"
            density="compact"
            color="primary"
            hint="Redirigir HTTP a HTTPS automáticamente"
            persistent-hint
            class="mb-1"
            @update:model-value="updateConfig('httpsOnly', $event)"
          />
          <v-switch
            v-model="localConfig.alwaysOn"
            label="Always On"
            density="compact"
            color="primary"
            hint="Mantener la aplicación cargada todo el tiempo"
            persistent-hint
            @update:model-value="updateConfig('alwaysOn', $event)"
          />
        </v-col>
      </v-row>

      <v-row dense>
        <v-col cols="12" md="6">
          <v-switch
            v-model="localConfig.clientAffinityEnabled"
            label="Client Affinity"
            density="compact"
            color="primary"
            hint="Habilitar afinidad de sesión"
            persistent-hint
            @update:model-value="updateConfig('clientAffinityEnabled', $event)"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-switch
            v-model="localConfig.publicNetworkAccess"
            label="Acceso de Red Público"
            density="compact"
            color="primary"
            hint="Permitir acceso desde internet"
            persistent-hint
            @update:model-value="updateConfig('publicNetworkAccess', $event)"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
const runtimeStackOptions = [
  { label: '.NET 8.0', value: 'DOTNETCORE|8.0' },
  { label: '.NET 6.0', value: 'DOTNETCORE|6.0' },
  { label: '.NET Framework 4.8', value: 'ASPNET|4.8' },
  { label: 'Node.js 20 LTS', value: 'NODE|20-lts' },
  { label: 'Node.js 18 LTS', value: 'NODE|18-lts' },
  { label: 'Python 3.11', value: 'PYTHON|3.11' },
  { label: 'Python 3.10', value: 'PYTHON|3.10' },
  { label: 'Java 17', value: 'JAVA|17-java17' },
  { label: 'Java 11', value: 'JAVA|11-java11' },
  { label: 'PHP 8.2', value: 'PHP|8.2' }
]

export default {
  name: 'AppServiceConfig',
  props: {
    config: {
      type: Object,
      required: true
    },
    environment: {
      type: String,
      required: true,
      default: 'dev'
    }
  },
  emits: ['update', 'update:config'],
  data() {
    return {
      localAppBaseName: '',
      localConfig: {
        appServicePlanReference: 'Se asignará al ASP configurado',
        runtimeStack: 'DOTNETCORE|8.0',
        httpsOnly: true,
        alwaysOn: false,
        clientAffinityEnabled: false,
        publicNetworkAccess: true,
        ...this.config
      }
    }
  },
  computed: {
    computedAppName() {
      const env = this.environment || 'dev'
      return this.localAppBaseName ? `${this.localAppBaseName}-${env}` : ''
    },
    runtimeStackOptions() {
      return runtimeStackOptions
    },
    rules() {
      return {
        required: value => !!value || 'Este campo es obligatorio',
        appServiceNameFormat: value => {
          if (!value) return true
          const regex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,58}[a-zA-Z0-9]$/
          return regex.test(value) || 'Solo letras, números y guiones, 2-60 caracteres. Debe empezar y terminar con letra o número'
        }
      }
    }
  },
  watch: {
    localAppBaseName(newValue) {
      this.updateConfig('name', this.computedAppName)
    },
    config: {
      handler(newConfig) {
        this.localConfig = {
          appServicePlanReference: 'Se asignará al ASP configurado',
          runtimeStack: 'DOTNETCORE|8.0',
          httpsOnly: true,
          alwaysOn: false,
          clientAffinityEnabled: false,
          publicNetworkAccess: true,
          ...newConfig
        }
      },
      deep: true,
      immediate: true
    }
  },
  mounted() {
    // Initialize localAppBaseName from existing name
    if (this.config.name) {
      const env = this.environment || 'dev'
      const suffix = `-${env}`
      
      let baseName = this.config.name
      
      // Remove environment suffix if present
      if (baseName.endsWith(suffix)) {
        baseName = baseName.replace(suffix, '')
      }
      
      this.localAppBaseName = baseName
    } else {
      // Set default app base name if none exists
      this.localAppBaseName = 'myapp'
    }
  },
  methods: {
    updateConfig(key, value) {
      this.localConfig[key] = value
      this.$emit('update', { ...this.config, [key]: value })
      this.$emit('update:config', { ...this.config, [key]: value })
    },
    updateAppBaseName(value) {
      this.localAppBaseName = value
    }
  }
}
</script>


