<template>
  <v-card v-if="bicepContent" class="mx-auto my-4 pa-4" max-width="800">
    <v-card-title class="text-h6 mb-3">
      Administrador de Despliegue Azure
    </v-card-title>
    <v-divider class="mb-3" />

    <v-alert type="info" variant="tonal" class="mb-3" density="compact">
      Este módulo genera comandos para autenticación, selección de suscripción, creación/selección de grupo de recursos y despliegue.
    </v-alert>

    <v-row dense>
      <v-col cols="12" md="6">
        <v-select
          v-model="authMode"
          :items="authModes"
          item-title="label"
          item-value="value"
          label="Modo de autenticación"
          density="compact"
          variant="outlined"
        />
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="subscriptionId"
          label="Subscription ID"
          density="compact"
          variant="outlined"
          :rules="[value => !!value || 'La suscripción es obligatoria']"
          required
        />
      </v-col>
    </v-row>

    <v-row v-if="authMode === 'servicePrincipal'" dense>
      <v-col cols="12" md="4">
        <v-text-field
          v-model="tenantId"
          label="Tenant ID"
          density="compact"
          variant="outlined"
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field
          v-model="clientId"
          label="Client ID"
          density="compact"
          variant="outlined"
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field
          v-model="clientSecret"
          label="Client Secret"
          type="password"
          density="compact"
          variant="outlined"
        />
      </v-col>
    </v-row>

    <v-row dense>
      <v-col cols="12" md="6">
        <v-select
          v-model="resourceGroupMode"
          :items="resourceGroupModes"
          item-title="label"
          item-value="value"
          label="Grupo de recursos"
          density="compact"
          variant="outlined"
        />
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="location"
          label="Ubicación"
          density="compact"
          variant="outlined"
          :rules="[value => !!value || 'La ubicación es obligatoria']"
          required
        />
      </v-col>
    </v-row>

    <v-row dense>
      <v-col cols="12" md="6" v-if="resourceGroupMode === 'existing'">
        <v-text-field
          v-model="existingResourceGroupName"
          label="Resource Group existente"
          density="compact"
          variant="outlined"
          :rules="[value => !!value || 'El grupo de recursos es obligatorio']"
          required
        />
      </v-col>
      <v-col cols="12" md="6" v-else>
        <v-text-field
          v-model="newResourceGroupName"
          label="Nuevo Resource Group"
          density="compact"
          variant="outlined"
          :rules="[value => !!value || 'El grupo de recursos es obligatorio']"
          required
        />
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="templateFileName"
          label="Archivo Bicep"
          density="compact"
          variant="outlined"
        />
      </v-col>
    </v-row>

    <v-alert v-if="!canGenerateCommands" type="warning" variant="tonal" class="mb-3" density="compact">
      Completa suscripción, ubicación y grupo de recursos para generar comandos de despliegue.
    </v-alert>

    <v-card variant="outlined" class="mb-3">
      <v-card-title class="text-subtitle-1">Comandos Azure CLI</v-card-title>
      <v-divider />
      <v-card-text>
        <div class="code-container mb-3">
          <pre class="code-block"><code>{{ cliCommands }}</code></pre>
        </div>
        <v-btn color="primary" size="small" @click="copyText(cliCommands)">
          <v-icon left>mdi-content-copy</v-icon>
          Copiar comandos CLI
        </v-btn>
      </v-card-text>
    </v-card>

    <v-card variant="outlined">
      <v-card-title class="text-subtitle-1">Referencia REST API (opcional)</v-card-title>
      <v-divider />
      <v-card-text>
        <div class="code-container mb-3">
          <pre class="code-block"><code>{{ restGuide }}</code></pre>
        </div>
        <v-btn color="secondary" size="small" @click="copyText(restGuide)">
          <v-icon left>mdi-content-copy</v-icon>
          Copiar guía REST
        </v-btn>
      </v-card-text>
    </v-card>
  </v-card>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  bicepContent: {
    type: String,
    default: ''
  },
  defaultResourceGroup: {
    type: String,
    default: ''
  },
  defaultLocation: {
    type: String,
    default: 'eastus'
  }
})

const authModes = [
  { value: 'azureCli', label: 'Azure CLI (usuario interactivo)' },
  { value: 'servicePrincipal', label: 'Service Principal (app registration)' }
]

const resourceGroupModes = [
  { value: 'existing', label: 'Seleccionar existente' },
  { value: 'new', label: 'Crear nuevo' }
]

// Estado del asistente de despliegue.
const authMode = ref('azureCli')
const subscriptionId = ref('')
const tenantId = ref('')
const clientId = ref('')
const clientSecret = ref('')
const resourceGroupMode = ref('existing')
const existingResourceGroupName = ref(props.defaultResourceGroup || '')
const newResourceGroupName = ref('')
const location = ref(props.defaultLocation || 'eastus')
const templateFileName = ref('infra.bicep')

watch(() => props.defaultResourceGroup, (newValue) => {
  if (!existingResourceGroupName.value) {
    existingResourceGroupName.value = newValue || ''
  }
})

watch(() => props.defaultLocation, (newValue) => {
  if (!location.value) {
    location.value = newValue || 'eastus'
  }
})

const effectiveResourceGroup = computed(() => {
  return resourceGroupMode.value === 'new'
    ? newResourceGroupName.value.trim()
    : existingResourceGroupName.value.trim()
})

const canGenerateCommands = computed(() => {
  return Boolean(
    props.bicepContent &&
    subscriptionId.value.trim() &&
    effectiveResourceGroup.value &&
    location.value.trim()
  )
})

const loginCommand = computed(() => {
  if (authMode.value === 'servicePrincipal') {
    if (!tenantId.value || !clientId.value || !clientSecret.value) {
      return '# Completa tenantId, clientId y clientSecret para generar el login por service principal.'
    }

    return `az login --service-principal -u "${clientId.value}" -p "${clientSecret.value}" --tenant "${tenantId.value}"`
  }

  return 'az login'
})

const cliCommands = computed(() => {
  if (!canGenerateCommands.value) {
    return '# Completa los campos requeridos para generar comandos.'
  }

  const lines = []
  lines.push('# 1. Autenticación')
  lines.push(loginCommand.value)
  lines.push('')
  lines.push('# 2. Seleccionar suscripción')
  lines.push(`az account set --subscription "${subscriptionId.value.trim()}"`)
  lines.push('')

  if (resourceGroupMode.value === 'new') {
    lines.push('# 3. Crear grupo de recursos')
    lines.push(`az group create --name "${effectiveResourceGroup.value}" --location "${location.value.trim()}"`)
    lines.push('')
    lines.push('# 4. What-If')
  } else {
    lines.push('# 3. What-If')
  }

  lines.push(
    `az deployment group what-if --resource-group "${effectiveResourceGroup.value}" --template-file "${templateFileName.value.trim()}"`
  )
  lines.push('')

  if (resourceGroupMode.value === 'new') {
    lines.push('# 5. Deploy')
  } else {
    lines.push('# 4. Deploy')
  }

  lines.push(
    `az deployment group create --resource-group "${effectiveResourceGroup.value}" --template-file "${templateFileName.value.trim()}"`
  )

  return lines.join('\n')
})

const restGuide = computed(() => {
  if (!canGenerateCommands.value) {
    return '# Completa los campos requeridos para generar la referencia REST.'
  }

  return [
    '# 1) Compilar Bicep a ARM JSON',
    `az bicep build --file "${templateFileName.value.trim()}" --outfile "infra.json"`,
    '',
    '# 2) Endpoint REST (group scope)',
    `PUT https://management.azure.com/subscriptions/${subscriptionId.value.trim()}/resourcegroups/${effectiveResourceGroup.value}/providers/Microsoft.Resources/deployments/infragen-deploy?api-version=2024-03-01`,
    '',
    '# 3) Body mínimo',
    '{',
    '  "properties": {',
    '    "mode": "Incremental",',
    '    "template": { ...contenido de infra.json... }',
    '  }',
    '}'
  ].join('\n')
})

const copyText = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
  } catch (error) {
    console.error('Error al copiar texto:', error)
  }
}
</script>

<style scoped>
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
</style>
