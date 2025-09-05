<template>
  <v-card class="mb-4">
    <v-card-title class="bg-primary">
      <v-icon class="mr-2">mdi-database</v-icon>
      Storage Account Configuration
    </v-card-title>
    <v-card-text>
      <v-row dense class="mt-3">
        <v-col cols="12" md="6">
          <v-tooltip text="Define el nombre base de tu Storage Account. Se combinará automáticamente con 'sta' y el entorno. Debe ser único globalmente en Azure.">
            <template v-slot:activator="{ props }">
              <v-text-field 
                v-bind="props"
                v-model="localStorageBaseName" 
                label="Nombre Base del Storage Account" 
                placeholder="Ej: mystorageaccount" 
                density="compact" 
                variant="outlined" 
                :rules="[rules.required, rules.storageNameFormat]"
                hint="Solo letras minúsculas y números, 3-24 caracteres. Se agregará automáticamente 'sta' y el environment"
                persistent-hint
                @input="updateStorageBaseName($event.target.value)"
              />
            </template>
          </v-tooltip>
          <v-chip 
            v-if="computedStorageName"
            size="small" 
            color="success" 
            variant="outlined" 
            class="mt-1"
          >
            Nombre completo: {{ computedStorageName }}
          </v-chip>
        </v-col>
        <v-col cols="12" md="6">
          <v-tooltip text="Tipo de redundancia que determina cómo se replican tus datos. LRS (local), GRS (geográfica), ZRS (zonas). Afecta disponibilidad y costo.">
            <template v-slot:activator="{ props }">
              <v-select
                v-bind="props"
                v-model="localConfig.sku"
                :items="skuOptions"
                label="Tipo de redundancia (SKU)"
                item-title="label"
                item-value="value"
                density="compact"
                variant="outlined"
                hint="Selecciona el nivel de redundancia para tus datos"
                persistent-hint
                @update:model-value="updateConfig('sku', $event)"
              />
            </template>
          </v-tooltip>
        </v-col>
      </v-row>

      <v-row dense>
        <v-col cols="12" md="6">
          <v-tooltip text="Tipo de cuenta que determina qué servicios están disponibles. StorageV2 es la recomendada para uso general, BlobStorage solo para archivos.">
            <template v-slot:activator="{ props }">
              <v-select
                v-bind="props"
                v-model="localConfig.kind"
                :items="kindOptions"
                label="Tipo de cuenta"
                item-title="label"
                item-value="value"
                density="compact"
                variant="outlined"
                hint="Tipo de storage account según el uso"
                persistent-hint
                @update:model-value="updateConfig('kind', $event)"
              />
            </template>
          </v-tooltip>
        </v-col>
        <v-col cols="12" md="6">
          <v-tooltip text="Nivel de acceso que optimiza costos según frecuencia de uso. Hot para acceso frecuente (más caro), Cool para acceso ocasional (más barato).">
            <template v-slot:activator="{ props }">
              <v-select
                v-bind="props"
                v-model="localConfig.accessTier"
                :items="accessTierOptions"
                label="Nivel de acceso"
                item-title="label"
                item-value="value"
                density="compact"
                variant="outlined"
                hint="Optimización de costos según frecuencia de acceso"
                persistent-hint
                @update:model-value="updateConfig('accessTier', $event)"
              />
            </template>
          </v-tooltip>
        </v-col>
      </v-row>

      <v-row dense>
        <v-col cols="12" md="6" class="d-flex flex-column">
          <v-tooltip text="Fuerza todas las conexiones a usar HTTPS para mayor seguridad. Recomendado para ambientes de producción y datos sensibles.">
            <template v-slot:activator="{ props }">
              <v-switch
                v-bind="props"
                v-model="localConfig.httpsOnly"
                label="Solo HTTPS"
                density="compact"
                color="primary"
                hint="Requiere conexiones seguras HTTPS"
                persistent-hint
                class="mb-1"
                @update:model-value="updateConfig('httpsOnly', $event)"
              />
            </template>
          </v-tooltip>
          <v-tooltip text="Permite acceso público anónimo a contenedores y blobs. Desactívalo para mayor seguridad, solo permite acceso autenticado.">
            <template v-slot:activator="{ props }">
              <v-switch
                v-bind="props"
                v-model="localConfig.enableBlobPublicAccess"
                label="Permitir acceso público a blobs"
                density="compact"
                color="primary"
                hint="Permite acceso anónimo a contenedores y blobs"
                persistent-hint
                @update:model-value="updateConfig('enableBlobPublicAccess', $event)"
              />
            </template>
          </v-tooltip>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
const skuOptions = [
  { label: 'Standard LRS (Locally Redundant)', value: 'Standard_LRS' },
  { label: 'Standard GRS (Geo Redundant)', value: 'Standard_GRS' },
  { label: 'Standard RAGRS (Read-Access Geo Redundant)', value: 'Standard_RAGRS' },
  { label: 'Standard ZRS (Zone Redundant)', value: 'Standard_ZRS' },
  { label: 'Premium LRS (Premium Locally Redundant)', value: 'Premium_LRS' },
  { label: 'Premium ZRS (Premium Zone Redundant)', value: 'Premium_ZRS' }
]

const kindOptions = [
  { label: 'StorageV2 (General Purpose v2)', value: 'StorageV2' },
  { label: 'Storage (General Purpose v1)', value: 'Storage' },
  { label: 'BlobStorage (Blob Storage)', value: 'BlobStorage' },
  { label: 'FileStorage (Premium File)', value: 'FileStorage' },
  { label: 'BlockBlobStorage (Premium Block Blob)', value: 'BlockBlobStorage' }
]

const accessTierOptions = [
  { label: 'Hot (Acceso frecuente)', value: 'Hot' },
  { label: 'Cool (Acceso poco frecuente)', value: 'Cool' }
]

export default {
  name: 'StorageAccountConfig',
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
  emits: ['update:config', 'update'],
  data() {
    return {
      localStorageBaseName: '',
      localConfig: {
        sku: 'Standard_LRS',
        kind: 'StorageV2', 
        accessTier: 'Cool',
        httpsOnly: true,
        enableBlobPublicAccess: false,
        ...this.config
      }
    }
  },
  computed: {
    computedStorageName() {
      const env = this.environment || 'dev'
      // Storage accounts no pueden tener guiones, solo letras minúsculas y números
      return this.localStorageBaseName ? `sta${this.localStorageBaseName}${env}` : ''
    },
    skuOptions() {
      return skuOptions
    },
    kindOptions() {
      return kindOptions
    },
    accessTierOptions() {
      return accessTierOptions
    },
    rules() {
      return {
        required: value => !!value || 'Este campo es obligatorio',
        storageNameFormat: value => {
          if (!value) return true
          const regex = /^[a-z0-9]{3,24}$/
          return regex.test(value) || 'Solo letras minúsculas y números, 3-24 caracteres'
        }
      }
    }
  },
  watch: {
    localStorageBaseName(newValue) {
      this.updateConfig('name', this.computedStorageName)
    },
    config: {
      handler(newConfig) {
        this.localConfig = {
          sku: 'Standard_LRS',
          kind: 'StorageV2', 
          accessTier: 'Cool',
          httpsOnly: true,
          enableBlobPublicAccess: false,
          ...newConfig
        }
      },
      deep: true,
      immediate: true
    }
  },
  mounted() {
    // Initialize localStorageBaseName from existing name
    if (this.config.name) {
      const env = this.environment || 'dev'
      const prefix = 'sta'
      
      let baseName = this.config.name
      
      // Remove environment suffix if present
      if (baseName.endsWith(env)) {
        baseName = baseName.slice(0, -env.length)
      }
      
      // Remove sta prefix if present
      if (baseName.startsWith(prefix)) {
        baseName = baseName.slice(prefix.length)
      }
      
      this.localStorageBaseName = baseName
    } else {
      // Set default storage base name if none exists
      this.localStorageBaseName = 'mystorage'
      // Trigger name update immediately
      this.updateConfig('name', this.computedStorageName)
    }
  },
  methods: {
    updateConfig(key, value) {
      this.localConfig[key] = value
      this.$emit('update', { ...this.config, [key]: value })
      this.$emit('update:config', { ...this.config, [key]: value })
    },
    updateStorageBaseName(value) {
      this.localStorageBaseName = value
    }
  }
}
</script>


