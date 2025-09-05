# 🚀 InfraGen - Próximos Features v1.1+

Este documento contiene las mejoras y características planificadas para futuras versiones de InfraGen.

## 📋 Tabla de Contenidos

- [🎯 Alta Prioridad - Funcionalidad Core](#-alta-prioridad---funcionalidad-core)
- [🎨 Media Prioridad - UX/UI](#-media-prioridad---uxui)
- [⚡ Baja Prioridad - Características Avanzadas](#-baja-prioridad---características-avanzadas)
- [🛠️ Mejoras Técnicas](#️-mejoras-técnicas)
- [📦 Mejoras de Package](#-mejoras-de-package)
- [🏆 Top 3 Recomendaciones Inmediatas](#-top-3-recomendaciones-inmediatas)

---

## 🎯 **ALTA PRIORIDAD - Funcionalidad Core**

### 1. 🔍 **Validación de Código Bicep**

**Descripción**: Validador de sintaxis Bicep en tiempo real antes de mostrar el código generado.

**Implementación**:
```javascript
// Agregar en AzureSelector.vue
validateBicepSyntax() {
  const errors = []
  if (!this.bicepContent.includes('targetScope = \'subscription\'')) {
    errors.push('Missing targetScope')
  }
  if (!this.bicepContent.includes('resource rg \'Microsoft.Resources/resourceGroups@')) {
    errors.push('Missing resource group definition')
  }
  return errors
}

showBicepValidationErrors() {
  const errors = this.validateBicepSyntax()
  if (errors.length > 0) {
    // Mostrar errores en UI
    this.validationErrors = errors
  }
}
```

**Beneficios**:
- ✅ Previene errores de deployment
- ✅ Mejora la confianza del usuario
- ✅ Feedback inmediato

**Estimación**: 2-3 días

---

### 2. 💾 **Persistencia Local (LocalStorage)**

**Descripción**: Auto-guardado de configuración en progreso para prevenir pérdida de datos al recargar la página.

**Implementación**:
```javascript
// Auto-guardar configuración en progreso
saveToLocalStorage() {
  const config = {
    appName: this.appName,
    environment: this.selectedEnv,
    location: this.location,
    resourceGroupName: this.resourceGroupName,
    components: this.components,
    timestamp: new Date().toISOString()
  }
  localStorage.setItem('infragen-config', JSON.stringify(config))
  console.log('Configuration auto-saved')
}

loadFromLocalStorage() {
  try {
    const saved = localStorage.getItem('infragen-config')
    if (saved) {
      const config = JSON.parse(saved)
      this.appName = config.appName
      this.selectedEnv = config.environment
      this.location = config.location
      this.resourceGroupName = config.resourceGroupName
      this.components = config.components || []
      
      // Mostrar notificación de restauración
      this.showSnackbar('Configuración restaurada automáticamente', 'success')
    }
  } catch (error) {
    console.error('Error loading from localStorage:', error)
  }
}

// Auto-save en cada cambio importante
watch([appName, selectedEnv, location, components], () => {
  this.saveToLocalStorage()
}, { deep: true })
```

**UI Components**:
```vue
<v-snackbar v-model="showAutoSaveNotification" timeout="2000" color="success">
  <v-icon left>mdi-content-save</v-icon>
  Configuración guardada automáticamente
</v-snackbar>

<v-btn @click="clearLocalStorage" variant="outlined" color="warning" size="small">
  <v-icon left>mdi-delete</v-icon>
  Limpiar configuración guardada
</v-btn>
```

**Beneficios**:
- ✅ No perder progreso al recargar
- ✅ Mejor experiencia de usuario
- ✅ Recuperación automática

**Estimación**: 1-2 días

---

### 3. 📊 **Estimación de Costos**

**Descripción**: Calculadora de costos estimados mensuales para los recursos seleccionados.

**Implementación**:
```javascript
// Datos de precios base (estimados)
const azurePricing = {
  'StorageAccount': { 
    'Standard_LRS': 0.018, // per GB
    'Standard_GRS': 0.036,
    'Premium_LRS': 0.15
  },
  'AppService': {
    'B1': 13.14, // per month
    'S1': 56.94,
    'P1V2': 82.13
  },
  'SQLDatabase': {
    'Basic': 4.99,
    'Standard': 15.00,
    'Premium': 465.00
  },
  'FunctionApp': {
    'Consumption': 0.000016, // per execution
    'Premium': 159.00
  }
}

estimateCost(component) {
  switch(component.type) {
    case 'StorageAccount':
      return azurePricing.StorageAccount[component.config.sku] * 100 || 5 // 100GB estimado
    case 'AppService':
      return azurePricing.AppService[component.config.sku] || 15
    case 'SQLDatabase':
      return azurePricing.SQLDatabase[component.config.edition] || 5
    case 'FunctionApp':
      return component.config.hostingPlan === 'Consumption' ? 10 : 159 // 10$ estimado para consumption
    default:
      return 5 // Costo base
  }
}

get totalEstimatedCost() {
  return this.components.reduce((total, comp) => total + this.estimateCost(comp), 0)
}
```

**UI Component**:
```vue
<v-card class="mt-4" v-if="components.length > 0">
  <v-card-title class="bg-success">
    <v-icon class="mr-2">mdi-calculator</v-icon>
    💰 Estimación de Costos Mensual
  </v-card-title>
  <v-card-text>
    <v-list density="compact">
      <v-list-item v-for="component in components" :key="component.id">
        <template v-slot:prepend>
          <v-icon>{{ getComponentIcon(component.type) }}</v-icon>
        </template>
        <v-list-item-title>{{ component.type }}</v-list-item-title>
        <v-list-item-subtitle>{{ component.config.sku || component.config.edition }}</v-list-item-subtitle>
        <template v-slot:append>
          <v-chip color="green" size="small">~${{ estimateCost(component) }}/mes</v-chip>
        </template>
      </v-list-item>
    </v-list>
    
    <v-divider class="my-3"></v-divider>
    
    <v-row>
      <v-col>
        <v-chip color="primary" size="large" variant="elevated">
          <v-icon left>mdi-cash</v-icon>
          Total Estimado: ~${{ totalEstimatedCost }}/mes
        </v-chip>
      </v-col>
    </v-row>
    
    <v-alert type="info" density="compact" class="mt-3">
      <v-icon>mdi-information</v-icon>
      Los costos son estimaciones basadas en precios estándar de Azure. 
      Los costos reales pueden variar según el uso, región y descuentos aplicables.
    </v-alert>
  </v-card-text>
</v-card>
```

**Beneficios**:
- ✅ Visibilidad de costos antes del deployment
- ✅ Ayuda en la toma de decisiones
- ✅ Planificación presupuestaria

**Estimación**: 3-4 días

---

## 🎨 **MEDIA PRIORIDAD - UX/UI**

### 4. 🔄 **Modo Oscuro/Claro**

**Descripción**: Toggle entre tema claro y oscuro para mejor experiencia visual.

**Implementación**:
```javascript
// En main.js
const theme = {
  defaultTheme: 'light',
  themes: {
    light: {
      colors: {
        primary: '#0078D4',
        secondary: '#106EBE',
        success: '#107C10',
        warning: '#FF8C00',
        error: '#D13438'
      }
    },
    dark: {
      colors: {
        primary: '#4FC3F7',
        secondary: '#81C784',
        success: '#66BB6A',
        warning: '#FFB74D',
        error: '#EF5350'
      }
    }
  }
}

// En AzureSelector.vue
data() {
  return {
    darkMode: false
  }
},
methods: {
  toggleTheme() {
    this.darkMode = !this.darkMode
    this.$vuetify.theme.global.name = this.darkMode ? 'dark' : 'light'
    localStorage.setItem('darkMode', this.darkMode)
  }
}
```

**UI Component**:
```vue
<v-btn @click="toggleTheme" icon variant="text">
  <v-icon>{{ darkMode ? 'mdi-white-balance-sunny' : 'mdi-moon-waning-crescent' }}</v-icon>
</v-btn>
```

**Estimación**: 1 día

---

### 5. 📱 **Export/Import de Configuraciones**

**Descripción**: Exportar configuraciones a archivos JSON e importar configuraciones existentes.

**Implementación**:
```javascript
exportConfiguration() {
  const config = {
    version: '1.0',
    appName: this.appName,
    environment: this.selectedEnv,
    location: this.location,
    resourceGroupName: this.resourceGroupName,
    components: this.components,
    metadata: {
      exportedAt: new Date().toISOString(),
      exportedBy: 'InfraGen v1.0'
    }
  }
  
  const blob = new Blob([JSON.stringify(config, null, 2)], { 
    type: 'application/json' 
  })
  
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${this.appName || 'infragen'}-config.json`
  link.click()
}

importConfiguration(event) {
  const file = event.target.files[0]
  if (!file) return
  
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const config = JSON.parse(e.target.result)
      
      // Validar estructura
      if (!config.version || !config.components) {
        throw new Error('Formato de archivo inválido')
      }
      
      // Restaurar configuración
      this.appName = config.appName
      this.selectedEnv = config.environment
      this.location = config.location
      this.resourceGroupName = config.resourceGroupName
      this.components = config.components
      
      this.showSnackbar('Configuración importada exitosamente', 'success')
    } catch (error) {
      this.showSnackbar('Error al importar configuración: ' + error.message, 'error')
    }
  }
  reader.readAsText(file)
}
```

**UI Components**:
```vue
<v-row class="mb-4">
  <v-col>
    <v-btn @click="exportConfiguration" color="primary" variant="outlined">
      <v-icon left>mdi-download</v-icon>
      Exportar Configuración
    </v-btn>
    
    <v-file-input
      @change="importConfiguration"
      accept=".json"
      label="Importar Configuración"
      prepend-icon="mdi-upload"
      variant="outlined"
      density="compact"
      class="ml-4"
      style="max-width: 300px; display: inline-block;"
    />
  </v-col>
</v-row>
```

**Estimación**: 2 días

---

### 6. 🎯 **Templates Predefinidos**

**Descripción**: Plantillas predefinidas para escenarios comunes de infraestructura.

**Implementación**:
```javascript
const templates = {
  'web-app-basic': {
    name: 'Web App Básica',
    description: 'App Service con Storage Account',
    icon: 'mdi-web',
    components: [
      { type: 'AppServicePlan', config: { sku: 'B1' }},
      { type: 'AppService', config: { runtimeStack: '.NET 8' }},
      { type: 'StorageAccount', config: { sku: 'Standard_LRS' }}
    ]
  },
  'full-stack': {
    name: 'Full Stack con DB',
    description: 'Web app completa con base de datos',
    icon: 'mdi-database-plus',
    components: [
      { type: 'AppServicePlan', config: { sku: 'S1' }},
      { type: 'AppService', config: { runtimeStack: '.NET 8' }},
      { type: 'SQLServer', config: {}},
      { type: 'SQLDatabase', config: { edition: 'Standard' }},
      { type: 'StorageAccount', config: { sku: 'Standard_LRS' }}
    ]
  },
  'serverless': {
    name: 'Arquitectura Serverless',
    description: 'Function App con Cognitive Services',
    icon: 'mdi-function',
    components: [
      { type: 'FunctionApp', config: { hostingPlan: 'Consumption' }},
      { type: 'CognitiveService', config: { kind: 'CognitiveServices' }},
      { type: 'StorageAccount', config: { sku: 'Standard_LRS' }}
    ]
  }
}
```

**UI Component**:
```vue
<v-dialog v-model="showTemplates" max-width="800">
  <v-card>
    <v-card-title>🎯 Plantillas Predefinidas</v-card-title>
    <v-card-text>
      <v-row>
        <v-col v-for="(template, key) in templates" :key="key" cols="12" md="6">
          <v-card @click="applyTemplate(key)" class="template-card" hover>
            <v-card-text class="text-center">
              <v-icon size="48" color="primary">{{ template.icon }}</v-icon>
              <h3 class="mt-2">{{ template.name }}</h3>
              <p class="text-body-2">{{ template.description }}</p>
              <v-chip-group>
                <v-chip v-for="comp in template.components" :key="comp.type" size="small">
                  {{ comp.type }}
                </v-chip>
              </v-chip-group>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</v-dialog>
```

**Estimación**: 2-3 días

---

## ⚡ **BAJA PRIORIDAD - Características Avanzadas**

### 7. 🔍 **Búsqueda en Componentes**

**Descripción**: Campo de búsqueda para filtrar componentes disponibles.

**Implementación**:
```javascript
data() {
  return {
    searchQuery: '',
    allComponents: [...] // Lista completa
  }
},
computed: {
  filteredComponents() {
    if (!this.searchQuery) return this.allComponents
    return this.allComponents.filter(comp => 
      comp.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      comp.description.toLowerCase().includes(this.searchQuery.toLowerCase())
    )
  }
}
```

**Estimación**: 1 día

---

### 8. 📈 **Analytics de Uso**

**Descripción**: Tracking de componentes más utilizados para mejorar la UX.

**Implementación**:
```javascript
trackComponentUsage(componentType) {
  const usage = JSON.parse(localStorage.getItem('component-usage') || '{}')
  usage[componentType] = (usage[componentType] || 0) + 1
  localStorage.setItem('component-usage', JSON.stringify(usage))
}

get popularComponents() {
  const usage = JSON.parse(localStorage.getItem('component-usage') || '{}')
  return Object.entries(usage)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([component]) => component)
}
```

**Estimación**: 1 día

---

### 9. 🔔 **Notificaciones de Actualización**

**Descripción**: Notificar cuando hay nuevas versiones disponibles.

**Implementación**:
```javascript
async checkForUpdates() {
  try {
    const response = await fetch('/api/version')
    const { latest } = await response.json()
    if (latest !== this.currentVersion) {
      this.showUpdateNotification = true
      this.latestVersion = latest
    }
  } catch (error) {
    console.error('Error checking updates:', error)
  }
}
```

**Estimación**: 2 días

---

## 🛠️ **MEJORAS TÉCNICAS**

### 10. 📝 **Sistema de Logging Mejorado**

**Implementación**:
```javascript
// utils/logger.js
export const logger = {
  info: (msg, data) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${msg}`, data)
  },
  error: (msg, error) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`, error)
    // Enviar a servicio de logging si está configurado
  },
  warn: (msg, data) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${msg}`, data)
  },
  debug: (msg, data) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${new Date().toISOString()} - ${msg}`, data)
    }
  }
}
```

**Estimación**: 1 día

---

### 11. 🧪 **Testing Suite**

**Implementación**:
```json
// package.json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  },
  "devDependencies": {
    "vitest": "^1.0.0",
    "@vue/test-utils": "^2.4.0",
    "@vitest/ui": "^1.0.0",
    "jsdom": "^23.0.0"
  }
}
```

**Estimación**: 3-5 días

---

### 12. 🚀 **Optimización de Performance**

**Implementación**:
```javascript
// Lazy loading de componentes grandes
const SqlDatabaseConfig = defineAsyncComponent(() => 
  import('./components/SqlDatabaseConfig.vue')
)

const FunctionAppConfig = defineAsyncComponent(() => 
  import('./components/FunctionAppConfig.vue')
)

// Memoization de cálculos pesados
const memoizedBicepGeneration = computed(() => {
  return useMemo(() => generateBicep(this.components), [this.components])
})
```

**Estimación**: 2-3 días

---

## 📦 **MEJORAS DE PACKAGE**

### 13. **Actualizar package.json**

```json
{
  "name": "infragen",
  "version": "1.0.0",
  "description": "Generador visual de infraestructura Azure con Bicep - Configura recursos Azure de manera intuitiva",
  "keywords": [
    "azure", 
    "bicep", 
    "infrastructure-as-code", 
    "vue", 
    "generator", 
    "devops", 
    "cloud"
  ],
  "author": "Victor Canseco <email@example.com>",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/vicoscanseco/InfraGen.git"
  },
  "bugs": {
    "url": "https://github.com/vicoscanseco/InfraGen/issues"
  },
  "homepage": "https://github.com/vicoscanseco/InfraGen#readme",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint src/ --ext .vue,.js,.ts",
    "lint:fix": "eslint src/ --ext .vue,.js,.ts --fix",
    "format": "prettier --write src/",
    "type-check": "vue-tsc --noEmit"
  },
  "devDependencies": {
    "eslint": "^8.57.0",
    "prettier": "^3.0.0",
    "typescript": "^5.0.0",
    "vue-tsc": "^1.8.0"
  }
}
```

**Estimación**: 1 día

---

## 🏆 **TOP 3 RECOMENDACIONES INMEDIATAS**

### 1. 💾 **Auto-save LocalStorage** 
- **Impacto**: Alto
- **Esfuerzo**: Bajo
- **Beneficio**: Evita frustración del usuario
- **Prioridad**: 🔥 CRÍTICA

### 2. 💰 **Estimación de Costos** 
- **Impacto**: Alto
- **Esfuerzo**: Medio
- **Beneficio**: Valor agregado significativo
- **Prioridad**: 🔥 ALTA

### 3. 📱 **Export/Import** 
- **Impacto**: Medio-Alto
- **Esfuerzo**: Medio
- **Beneficio**: Reutilización y compartir configuraciones
- **Prioridad**: 🔥 ALTA

---

## 📅 **Roadmap Sugerido**

### **v1.1 (2-3 semanas)**
- ✅ Auto-save LocalStorage
- ✅ Export/Import configuraciones
- ✅ Modo oscuro/claro

### **v1.2 (1-2 meses)**
- ✅ Estimación de costos
- ✅ Templates predefinidos
- ✅ Validación de Bicep

### **v1.3 (2-3 meses)**
- ✅ Testing suite
- ✅ Analytics de uso
- ✅ Optimizaciones de performance

### **v2.0 (3-6 meses)**
- ✅ Sistema de plugins
- ✅ API REST
- ✅ Colaboración en tiempo real

---

## 📝 **Notas de Implementación**

- Mantener compatibilidad con configuraciones existentes
- Implementar migraciones de datos si es necesario
- Documentar todos los cambios en el README
- Crear tests para nuevas funcionalidades
- Seguir las convenciones de código existentes

---

**Última actualización**: 5 de Septiembre, 2025  
**Versión del documento**: 1.0  
**Mantenido por**: CodeLand Team
