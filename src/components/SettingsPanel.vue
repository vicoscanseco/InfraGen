<script setup>
import { ref, watch } from 'vue'
import { testConnection } from '../utils/azureDevOpsService'
import { loadAdoSettings, saveAdoSettings } from '../utils/configPersistence'

const props = defineProps({
  modelValue: { type: Boolean, default: false }
})
const emit = defineEmits(['update:modelValue'])

const form = ref({
  organization: '',
  project: '',
  repository: '',
  filePath: 'infra/main.bicep',
  pat: ''
})

const showPat = ref(false)
const testing = ref(false)
const testResult = ref(null) // { ok, message }

// Carga la configuración guardada al abrir el panel
watch(() => props.modelValue, (open) => {
  if (open) {
    const saved = loadAdoSettings()
    if (saved) Object.assign(form.value, saved)
    testResult.value = null
  }
})

const handleTestConnection = async () => {
  testing.value = true
  testResult.value = null
  testResult.value = await testConnection(form.value)
  testing.value = false
}

const handleSave = () => {
  saveAdoSettings({ ...form.value })
  emit('update:modelValue', false)
}

const handleCancel = () => {
  emit('update:modelValue', false)
}
</script>

<template>
  <v-dialog :model-value="modelValue" max-width="560px" @update:model-value="emit('update:modelValue', $event)">
    <v-card>
      <v-card-title class="text-h6 d-flex align-center">
        <v-icon start>mdi-cog</v-icon>
        Configuración — Azure DevOps
        <v-spacer />
        <v-btn icon="mdi-close" variant="text" @click="handleCancel" />
      </v-card-title>
      <v-divider />

      <v-card-text class="pt-4">
        <v-alert type="info" variant="tonal" density="compact" class="mb-4">
          El Personal Access Token se guarda en el almacenamiento local del navegador (localStorage).
          No se envía a ningún servidor externo distinto de Azure DevOps.
        </v-alert>

        <v-text-field
          v-model="form.organization"
          label="Organización"
          placeholder="myorg  o  https://dev.azure.com/myorg"
          prepend-inner-icon="mdi-office-building"
          variant="outlined"
          density="compact"
          class="mb-3"
          hide-details="auto"
        />

        <v-text-field
          v-model="form.project"
          label="Proyecto"
          prepend-inner-icon="mdi-folder"
          variant="outlined"
          density="compact"
          class="mb-3"
          hide-details="auto"
        />

        <v-text-field
          v-model="form.repository"
          label="Repositorio"
          prepend-inner-icon="mdi-source-repository"
          variant="outlined"
          density="compact"
          class="mb-3"
          hide-details="auto"
        />

        <v-text-field
          v-model="form.filePath"
          label="Ruta del archivo"
          prepend-inner-icon="mdi-file-code"
          variant="outlined"
          density="compact"
          class="mb-3"
          hide-details="auto"
        />

        <v-alert type="info" variant="tonal" density="compact" class="mb-3" icon="mdi-source-branch">
          La rama se genera automáticamente como <strong>feature/{nombre-app}</strong>.
        </v-alert>

        <v-text-field
          v-model="form.pat"
          label="Personal Access Token (PAT)"
          :type="showPat ? 'text' : 'password'"
          prepend-inner-icon="mdi-key"
          :append-inner-icon="showPat ? 'mdi-eye-off' : 'mdi-eye'"
          variant="outlined"
          density="compact"
          hide-details="auto"
          @click:append-inner="showPat = !showPat"
        />

        <v-alert
          v-if="testResult"
          :type="testResult.ok ? 'success' : 'error'"
          variant="tonal"
          density="compact"
          class="mt-4"
        >
          {{ testResult.message }}
        </v-alert>
      </v-card-text>

      <v-card-actions class="pb-4 px-4">
        <v-btn
          variant="tonal"
          :loading="testing"
          :disabled="!form.organization || !form.project || !form.repository || !form.pat"
          prepend-icon="mdi-connection"
          @click="handleTestConnection"
        >
          Probar conexión
        </v-btn>
        <v-spacer />
        <v-btn variant="text" @click="handleCancel">Cancelar</v-btn>
        <v-btn
          color="primary"
          variant="flat"
          :disabled="!form.organization || !form.project || !form.repository || !form.pat"
          @click="handleSave"
        >
          Guardar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
