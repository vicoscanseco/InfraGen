<template>
  <v-card class="mb-4">
    <v-card-title class="bg-primary">
      <v-icon class="mr-2">mdi-database-outline</v-icon>
      SQL Database Configuration
    </v-card-title>
    <v-card-text class="pa-6">
      <v-row class="mb-2 mt-3">
        <v-col cols="12" md="6">
          <v-tooltip location="top">
            <template v-slot:activator="{ props }">
              <v-text-field 
                v-bind="props"
                v-model="localDatabaseBaseName" 
                label="Nombre Base de la Base de Datos" 
                placeholder="Ej: mydatabase" 
                density="comfortable" 
                variant="outlined"
                :rules="[rules.required, rules.databaseNameFormat]"
                hint="Solo letras, números, guiones y guiones bajos. Se agregará automáticamente 'db-' y el environment (excepto en producción)"
                persistent-hint
                @input="updateDatabaseBaseName($event.target.value)"
              />
            </template>
            <span>Nombre base de la base de datos. Se generará el nombre completo agregando prefijo 'db-' y sufijo del entorno (dev/test/stage). En producción no se incluye el environment. Solo letras, números, guiones y guiones bajos</span>
          </v-tooltip>
          <v-chip 
            v-if="computedDatabaseName"
            size="small" 
            color="secondary" 
            variant="outlined" 
            class="mt-1"
          >
            Nombre completo: {{ computedDatabaseName }}
          </v-chip>
        </v-col>
        <v-col cols="12" md="6">
          <v-tooltip location="top">
            <template v-slot:activator="{ props }">
              <v-text-field 
                v-bind="props"
                v-model="computedServerName" 
                label="SQL Server Asociado" 
                density="comfortable" 
                variant="outlined"
                readonly
                hint="Referencia automática al SQL Server configurado"
                persistent-hint
              />
            </template>
            <span>Nombre del SQL Server al que se asociará esta base de datos. Se obtiene automáticamente del componente SQL Server configurado en la infraestructura</span>
          </v-tooltip>
          <v-chip 
            v-if="computedServerName"
            size="small" 
            color="primary" 
            variant="outlined" 
            class="mt-1"
          >
            Server: {{ computedServerName }}
          </v-chip>
        </v-col>
      </v-row>

      <v-row class="mb-2">
        <v-col cols="12" md="6">
          <v-tooltip location="top">
            <template v-slot:activator="{ props }">
              <v-text-field 
                v-bind="props"
                v-model="localConfig.adminUsername" 
                label="Usuario Administrador" 
                placeholder="Ej: sqladmin" 
                density="comfortable" 
                variant="outlined"
                :rules="[rules.required, rules.adminUsernameFormat]"
                hint="No puede ser 'admin', 'administrator', 'sa', etc."
                persistent-hint
                @input="updateConfigField('adminUsername', $event.target.value)"
              />
            </template>
            <span>Nombre del usuario administrador del servidor SQL. No puede usar nombres reservados como 'admin', 'administrator', 'sa', 'root'. Debe empezar con letra y contener solo letras, números y guión bajo</span>
          </v-tooltip>
        </v-col>
        <v-col cols="12" md="6">
          <v-tooltip location="top">
            <template v-slot:activator="{ props }">
              <v-text-field 
                v-bind="props"
                v-model="localConfig.adminPassword" 
                label="Contraseña del Administrador" 
                placeholder="Contraseña segura" 
                type="password"
                density="comfortable" 
                variant="outlined"
                :rules="[rules.required, rules.passwordFormat]"
                hint="Mínimo 8 caracteres: 1 mayúscula, 1 minúscula, 1 número, 1 carácter especial"
                persistent-hint
                @input="updateConfigField('adminPassword', $event.target.value)"
              />
            </template>
            <span>Contraseña del administrador del servidor SQL. Debe cumplir con políticas de seguridad: mínimo 8 caracteres, incluir mayúsculas, minúsculas, números y caracteres especiales (!@#$%^&*)</span>
          </v-tooltip>
        </v-col>
      </v-row>

      <v-row class="mb-2">
        <v-col cols="12" md="6">
          <v-tooltip location="top">
            <template v-slot:activator="{ props }">
              <v-select
                v-bind="props"
                v-model="localConfig.edition"
                :items="editionOptions"
                label="Edición de la Base de Datos"
                item-title="label"
                item-value="value"
                density="comfortable"
                variant="outlined"
                hint="Nivel de rendimiento y características"
                persistent-hint
                @update:model-value="updateConfigField('edition', $event)"
              />
            </template>
            <span>Nivel de servicio de la base de datos. Basic: desarrollo/testing. Standard: aplicaciones generales con DTUs. Premium: alto rendimiento. vCore tiers (GP/BC/Hyperscale): última generación con vCores</span>
          </v-tooltip>
        </v-col>
        <v-col cols="12" md="6">
          <v-tooltip location="top">
            <template v-slot:activator="{ props }">
              <v-select
                v-bind="props"
                v-model="localConfig.serviceObjective"
                :items="currentServiceObjectiveOptions"
                label="Objetivo de Servicio"
                item-title="label"
                item-value="value"
                density="comfortable"
                variant="outlined"
                hint="DTU o vCore según la edición"
                persistent-hint
                @update:model-value="updateConfigField('serviceObjective', $event)"
              />
            </template>
            <span>Tamaño específico del rendimiento. DTU (Database Transaction Units) para tiers básicos, o vCore (núcleos virtuales) para tiers modernos. Determina CPU, memoria y IOPS disponibles</span>
          </v-tooltip>
        </v-col>
      </v-row>

      <v-row class="mb-2">
        <v-col cols="12" md="6">
          <v-tooltip location="top">
            <template v-slot:activator="{ props }">
              <v-select
                v-bind="props"
                v-model="localConfig.collation"
                :items="collationOptions"
                label="Collation"
                item-title="label"
                item-value="value"
                density="comfortable"
                variant="outlined"
                hint="Reglas de ordenamiento y comparación"
                persistent-hint
                @update:model-value="updateConfigField('collation', $event)"
              />
            </template>
            <span>Reglas de ordenamiento, comparación y sensibilidad a mayúsculas/acentos. CI_AS = Case Insensitive, Accent Sensitive. CS_AS = Case Sensitive. Determina cómo se comparan strings en consultas</span>
          </v-tooltip>
        </v-col>
        <v-col cols="12" md="6" class="d-flex flex-column">
          <v-tooltip location="top">
            <template v-slot:activator="{ props }">
              <v-switch
                v-bind="props"
                v-model="localConfig.enableFirewallRules"
                label="Habilitar reglas de Firewall"
                density="compact"
                color="primary"
                hint="Permitir acceso desde Azure y IPs específicas"
                persistent-hint
                class="mb-1"
                @update:model-value="updateConfigField('enableFirewallRules', $event)"
              />
            </template>
            <span>Habilita reglas de firewall para permitir conexiones desde servicios de Azure y rangos de IP específicos. Cuando está deshabilitado, solo conexiones locales son permitidas</span>
          </v-tooltip>
          <v-tooltip location="top">
            <template v-slot:activator="{ props }">
              <v-switch
                v-bind="props"
                v-model="localConfig.enableThreatDetection"
                label="Detección de Amenazas"
                density="compact"
                color="primary"
                hint="Advanced Threat Protection"
                persistent-hint
                @update:model-value="updateConfigField('enableThreatDetection', $event)"
              />
            </template>
            <span>Advanced Threat Protection: detecta actividades anómalas como intentos de acceso inusuales, inyección SQL potencial, acceso desde ubicaciones inusuales. Incluye alertas y recomendaciones de seguridad</span>
          </v-tooltip>
        </v-col>
      </v-row>

      <v-row class="mb-2" v-if="localConfig.enableFirewallRules">
        <v-col cols="12">
          <v-tooltip location="top">
            <template v-slot:activator="{ props }">
              <v-text-field 
                v-bind="props"
                v-model="localConfig.allowedIpRanges" 
                label="Rangos de IP Permitidos (opcional)" 
                placeholder="Ej: 192.168.1.0-192.168.1.255" 
                density="comfortable" 
                variant="outlined"
                hint="Formato: IP_INICIO-IP_FIN, separados por comas"
                persistent-hint
                @input="updateConfigField('allowedIpRanges', $event.target.value)"
              />
            </template>
            <span>Rangos de direcciones IP permitidas para conectarse al servidor SQL. Formato: IP_INICIO-IP_FIN (ej: 192.168.1.0-192.168.1.255). Múltiples rangos separados por comas. 0.0.0.0-0.0.0.0 permite todos los servicios Azure</span>
          </v-tooltip>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
const editionOptions = [
  { label: 'Basic (Desarrollo/Testing)', value: 'Basic' },
  { label: 'Standard (Aplicaciones Generales)', value: 'Standard' },
  { label: 'Premium (Alto Rendimiento)', value: 'Premium' },
  { label: 'GeneralPurpose (vCore)', value: 'GeneralPurpose' },
  { label: 'BusinessCritical (vCore)', value: 'BusinessCritical' },
  { label: 'Hyperscale (vCore)', value: 'Hyperscale' }
]

const serviceObjectiveOptions = {
  Basic: [
    { label: 'Basic (5 DTU)', value: 'Basic' }
  ],
  Standard: [
    { label: 'S0 (10 DTU)', value: 'S0' },
    { label: 'S1 (20 DTU)', value: 'S1' },
    { label: 'S2 (50 DTU)', value: 'S2' },
    { label: 'S3 (100 DTU)', value: 'S3' },
    { label: 'S4 (200 DTU)', value: 'S4' }
  ],
  Premium: [
    { label: 'P1 (125 DTU)', value: 'P1' },
    { label: 'P2 (250 DTU)', value: 'P2' },
    { label: 'P4 (500 DTU)', value: 'P4' },
    { label: 'P6 (1000 DTU)', value: 'P6' }
  ],
  GeneralPurpose: [
    { label: 'GP_Gen5_2 (2 vCore)', value: 'GP_Gen5_2' },
    { label: 'GP_Gen5_4 (4 vCore)', value: 'GP_Gen5_4' },
    { label: 'GP_Gen5_8 (8 vCore)', value: 'GP_Gen5_8' }
  ],
  BusinessCritical: [
    { label: 'BC_Gen5_2 (2 vCore)', value: 'BC_Gen5_2' },
    { label: 'BC_Gen5_4 (4 vCore)', value: 'BC_Gen5_4' },
    { label: 'BC_Gen5_8 (8 vCore)', value: 'BC_Gen5_8' }
  ],
  Hyperscale: [
    { label: 'HS_Gen5_2 (2 vCore)', value: 'HS_Gen5_2' },
    { label: 'HS_Gen5_4 (4 vCore)', value: 'HS_Gen5_4' },
    { label: 'HS_Gen5_8 (8 vCore)', value: 'HS_Gen5_8' }
  ]
}

const collationOptions = [
  { label: 'SQL_Latin1_General_CP1_CI_AS (Predeterminado)', value: 'SQL_Latin1_General_CP1_CI_AS' },
  { label: 'Spanish_Modern_Sort_CI_AS', value: 'Spanish_Modern_Sort_CI_AS' },
  { label: 'Latin1_General_CI_AS', value: 'Latin1_General_CI_AS' },
  { label: 'SQL_Latin1_General_CP1_CS_AS (Case Sensitive)', value: 'SQL_Latin1_General_CP1_CS_AS' }
]

export default {
  name: 'SqlDatabaseConfig',
  props: {
    config: {
      type: Object,
      required: true
    },
    environment: {
      type: String,
      required: true,
      default: 'dev'
    },
    sqlServerName: {
      type: String,
      default: ''
    }
  },
  emits: ['update:config', 'update:model-value'],
  data() {
    return {
      localDatabaseBaseName: 'mydb',
      localConfig: {
        adminUsername: 'sqladmin',
        adminPassword: 'P@ssw0rd123!',
        edition: 'Basic',
        serviceObjective: 'Basic',
        collation: 'SQL_Latin1_General_CP1_CI_AS',
        enableFirewallRules: true,
        enableThreatDetection: false,
        allowedIpRanges: '0.0.0.0-0.0.0.0',
        ...this.config
      }
    }
  },
  computed: {
    computedServerName() {
      // Usar el nombre del SQL Server que viene del componente padre
      return this.sqlServerName || ''
    },
    computedDatabaseName() {
      const env = this.environment || 'dev'
      if (env === 'prod') {
        return this.localDatabaseBaseName ? `db-${this.localDatabaseBaseName}` : ''
      }
      return this.localDatabaseBaseName ? `db-${this.localDatabaseBaseName}-${env}` : ''
    },
    editionOptions() {
      return editionOptions
    },
    currentServiceObjectiveOptions() {
      return serviceObjectiveOptions[this.localConfig.edition] || serviceObjectiveOptions.Basic
    },
    collationOptions() {
      return collationOptions
    },
    rules() {
      return {
        required: value => !!value || 'Este campo es obligatorio',
        databaseNameFormat: value => {
          if (!value) return true
          const regex = /^[a-zA-Z0-9_-]+$/
          return regex.test(value) || 'Solo letras, números, guiones y guiones bajos'
        },
        serverNameFormat: value => {
          if (!value) return true
          const regex = /^[a-z0-9-]+$/
          return regex.test(value) || 'Solo letras minúsculas, números y guiones'
        },
        adminUsernameFormat: value => {
          if (!value) return true
          const forbidden = ['admin', 'administrator', 'sa', 'root', 'dbmanager', 'loginmanager', 'dbo', 'guest', 'public']
          if (forbidden.includes(value.toLowerCase())) {
            return 'No se permiten nombres reservados como admin, administrator, sa, etc.'
          }
          const regex = /^[a-zA-Z][a-zA-Z0-9_]{0,127}$/
          return regex.test(value) || 'Debe empezar con letra, solo letras, números y guión bajo'
        },
        passwordFormat: value => {
          if (!value) return true
          if (value.length < 8) return 'Mínimo 8 caracteres'
          if (!/(?=.*[a-z])/.test(value)) return 'Debe contener al menos una letra minúscula'
          if (!/(?=.*[A-Z])/.test(value)) return 'Debe contener al menos una letra mayúscula'
          if (!/(?=.*\d)/.test(value)) return 'Debe contener al menos un número'
          if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(value)) return 'Debe contener al menos un carácter especial (!@#$%^&*()_+-=[]{}|;:,.<>?)'
          return true
        }
      }
    }
  },
  watch: {
    sqlServerName: {
      immediate: true,
      handler(newValue) {
        if (newValue) {
          this.updateConfig('sqlServer', newValue)
          this.updateConfig('serverName', newValue)
        }
      }
    },
    localDatabaseBaseName(newValue) {
      if (newValue) {
        this.updateConfig('databaseName', this.computedDatabaseName)
        this.updateConfig('name', this.computedDatabaseName) // Para generateBicep
      }
    },
    config: {
      handler(newConfig) {
        // Solo actualizar si hay cambios reales para evitar bucles
        const hasChanges = Object.keys(newConfig).some(key => 
          this.localConfig[key] !== newConfig[key]
        )
        if (hasChanges) {
          this.localConfig = {
            adminUsername: 'sqladmin',
            adminPassword: 'P@ssw0rd123!',
            edition: 'Basic',
            serviceObjective: 'Basic',
            collation: 'SQL_Latin1_General_CP1_CI_AS',
            enableFirewallRules: true,
            enableThreatDetection: false,
            allowedIpRanges: '0.0.0.0-0.0.0.0',
            ...newConfig
          }
        }
      },
      deep: true,
      immediate: true
    }
  },
  mounted() {
    console.log('SqlDatabaseConfig mounted - about to initialize')
    
    // Forzar inicialización inmediata de nombres
    setTimeout(() => {
      // Initialize localDatabaseBaseName from existing databaseName
      if (this.config.databaseName) {
        const env = this.environment || 'dev'
        const prefix = 'db-'
        
        let baseName = this.config.databaseName
        
        // Remove db prefix if present
        if (baseName.startsWith(prefix)) {
          baseName = baseName.slice(prefix.length)
        }
        
        // For non-production environments, remove environment suffix if present
        if (env !== 'prod') {
          const fullSuffix = `-${env}`
          if (baseName.endsWith(fullSuffix)) {
            baseName = baseName.slice(0, -fullSuffix.length)
          }
        }
        // For production, the name after removing 'db-' is already the base name
        
        this.localDatabaseBaseName = baseName
      }
      
      // Asegurar que los nombres se establezcan
      this.updateConfig('name', this.computedDatabaseName)
      this.updateConfig('sqlServer', this.computedServerName)
      this.updateConfig('databaseName', this.computedDatabaseName)
      this.updateConfig('serverName', this.computedServerName)
      
      // Forzar emisión de la configuración completa inicial
      const fullConfig = {
        ...this.localConfig,
        name: this.computedDatabaseName,
        sqlServer: this.computedServerName,
        databaseName: this.computedDatabaseName,
        serverName: this.computedServerName
      }
      
      this.$emit('update:config', fullConfig)
      this.$emit('update:model-value', fullConfig)
      this.$emit('update', fullConfig)
    }, 100)
  },
  methods: {
    updateConfig(key, value) {
      // Emitir la configuración completa con el nuevo valor
      const updatedConfig = { ...this.localConfig, [key]: value }
      console.log(`SqlDatabaseConfig updateConfig(${key}, ${value}) - emitting:`, updatedConfig)
      this.$emit('update:config', updatedConfig)
      this.$emit('update:model-value', updatedConfig)
    },
    updateConfigField(key, value) {
      // Actualizar localConfig directamente y emitir cambios
      this.localConfig[key] = value
      this.updateConfig(key, value)
      
      // Manejar lógica especial para edition
      if (key === 'edition') {
        const firstOption = this.currentServiceObjectiveOptions[0]?.value || 'Basic'
        this.localConfig.serviceObjective = firstOption
        this.updateConfig('serviceObjective', firstOption)
      }
    },
    updateDatabaseBaseName(value) {
      this.localDatabaseBaseName = value
    },
    updateEdition(value) {
      // Reset service objective when edition changes
      const firstOption = this.currentServiceObjectiveOptions[0]?.value || ''
      this.localConfig.edition = value
      this.localConfig.serviceObjective = firstOption
      this.updateConfig('edition', value)
      this.updateConfig('serviceObjective', firstOption)
    }
  }
}
</script>

<style scoped>
.v-chip {
  font-size: 0.75rem;
}
</style>


