import { ref, watch, onBeforeUnmount } from 'vue'

const ADO_STORAGE_KEY = 'infragen-ado-settings'

/** Carga la configuración de Azure DevOps desde localStorage. */
export const loadAdoSettings = () => {
  try {
    const raw = localStorage.getItem(ADO_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

/** Persiste la configuración de Azure DevOps en localStorage. */
export const saveAdoSettings = (settings) => {
  try {
    localStorage.setItem(ADO_STORAGE_KEY, JSON.stringify(settings))
  } catch (error) {
    console.error('Error guardando ADO settings:', error)
  }
}

export const useInfragenConfigPersistence = ({
  appName,
  selectedEnv,
  location,
  resourceGroup,
  configuredComponents,
  bicepContent,
  errorMsg,
  infoMsg,
  environments,
  locations,
  showNotification,
  storageKey = 'infragen-config',
  saveDelayMs = 500
}) => {
  const isAutoSavePaused = ref(false)
  let autoSaveTimerId = null

  const saveToLocalStorage = () => {
    try {
      const config = {
        appName: appName.value,
        environment: selectedEnv.value,
        location: location.value,
        resourceGroupName: resourceGroup.value,
        components: configuredComponents.value,
        timestamp: new Date().toISOString()
      }

      localStorage.setItem(storageKey, JSON.stringify(config))
    } catch (error) {
      console.error('Error saving to localStorage:', error)
    }
  }

  const scheduleSaveToLocalStorage = () => {
    if (isAutoSavePaused.value) return

    if (autoSaveTimerId) {
      clearTimeout(autoSaveTimerId)
    }

    autoSaveTimerId = setTimeout(() => {
      saveToLocalStorage()
      autoSaveTimerId = null
    }, saveDelayMs)
  }

  const runWithAutoSavePaused = (callback) => {
    isAutoSavePaused.value = true
    try {
      callback()
    } finally {
      setTimeout(() => {
        isAutoSavePaused.value = false
      }, 0)
    }
  }

  const loadFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (!saved) return

      const config = JSON.parse(saved)

      runWithAutoSavePaused(() => {
        if (config.appName !== undefined) appName.value = config.appName
        if (config.environment !== undefined) selectedEnv.value = config.environment
        if (config.location !== undefined) location.value = config.location
        if (config.resourceGroupName !== undefined) resourceGroup.value = config.resourceGroupName
        if (config.components && Array.isArray(config.components)) {
          configuredComponents.value = config.components
        }
      })

      showNotification('Configuración restaurada automáticamente', 'success', 'mdi-restore')
    } catch (error) {
      console.error('Error loading from localStorage:', error)
      showNotification('Error al restaurar configuración', 'error', 'mdi-alert')
    }
  }

  const clearLocalStorage = () => {
    if (!confirm('¿Estás seguro de que deseas borrar la configuración guardada y reiniciar el formulario?')) {
      return
    }

    localStorage.removeItem(storageKey)

    runWithAutoSavePaused(() => {
      appName.value = ''
      selectedEnv.value = environments.value.some(env => env.value === 'dev')
        ? 'dev'
        : (environments.value[0]?.value || 'dev')
      location.value = locations.value.some(loc => loc.value === 'mexicocentral')
        ? 'mexicocentral'
        : (locations.value[0]?.value || '')
      resourceGroup.value = ''
      configuredComponents.value = []
      bicepContent.value = ''
      errorMsg.value = ''
      infoMsg.value = ''
    })

    showNotification('Configuración eliminada', 'info', 'mdi-delete')
  }

  watch([appName, selectedEnv, location], scheduleSaveToLocalStorage)
  watch(configuredComponents, scheduleSaveToLocalStorage, { deep: true })

  onBeforeUnmount(() => {
    if (autoSaveTimerId) {
      clearTimeout(autoSaveTimerId)
      autoSaveTimerId = null
    }
  })

  return {
    loadFromLocalStorage,
    clearLocalStorage
  }
}
