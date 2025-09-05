<template>
  <v-card class="mb-4" flat>
    <v-card-title class="text-subtitle-1 py-2">Configurar Storage Account</v-card-title>
    <v-card-text class="pt-2">
      <v-row dense>
        <v-col cols="12" md="6">
          <v-text-field 
            v-model="config.name" 
            label="Nombre del Storage Account" 
            placeholder="Ej: mystorageaccount" 
            density="compact" 
            variant="outlined" 
            :rules="[rules.required, rules.storageNameFormat]"
            hint="Solo letras minúsculas y números, 3-24 caracteres"
            persistent-hint
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-select
            v-model="config.sku"
            :items="skuOptions"
            label="Tipo de redundancia (SKU)"
            item-title="label"
            item-value="value"
            density="compact"
            variant="outlined"
            hint="Selecciona el nivel de redundancia para tus datos"
            persistent-hint
          />
        </v-col>
      </v-row>

      <v-row dense>
        <v-col cols="12" md="6">
          <v-select
            v-model="config.kind"
            :items="kindOptions"
            label="Tipo de cuenta"
            item-title="label"
            item-value="value"
            density="compact"
            variant="outlined"
            hint="Tipo de storage account según el uso"
            persistent-hint
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-select
            v-model="config.accessTier"
            :items="accessTierOptions"
            label="Nivel de acceso"
            item-title="label"
            item-value="value"
            density="compact"
            variant="outlined"
            hint="Optimización de costos según frecuencia de acceso"
            persistent-hint
          />
        </v-col>
      </v-row>

      <v-row dense>
        <v-col cols="12" md="6" class="d-flex flex-column">
          <v-switch
            v-model="config.httpsOnly"
            label="Solo HTTPS"
            density="compact"
            color="primary"
            hint="Requiere conexiones seguras HTTPS"
            persistent-hint
            class="mb-1"
          />
          <v-switch
            v-model="config.enableBlobPublicAccess"
            label="Permitir acceso público a blobs"
            density="compact"
            color="primary"
            hint="Permite acceso anónimo a contenedores y blobs"
            persistent-hint
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { defineProps, reactive } from 'vue'

const props = defineProps({
  config: {
    type: Object,
    required: true
  }
})

// Inicializar valores por defecto si no existen
if (!props.config.sku) props.config.sku = 'Standard_LRS'
if (!props.config.kind) props.config.kind = 'StorageV2'
if (!props.config.accessTier) props.config.accessTier = 'Hot'
if (props.config.httpsOnly === undefined) props.config.httpsOnly = true
if (props.config.enableBlobPublicAccess === undefined) props.config.enableBlobPublicAccess = false

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

const rules = {
  required: value => !!value || 'Este campo es obligatorio',
  storageNameFormat: value => {
    if (!value) return true
    const regex = /^[a-z0-9]{3,24}$/
    return regex.test(value) || 'Solo letras minúsculas y números, 3-24 caracteres'
  }
}
</script>


