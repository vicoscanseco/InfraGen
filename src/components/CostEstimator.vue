<template>
  <!-- Estimador cuando hay componentes -->
  <v-card class="mt-4" v-if="components.length > 0">
    <v-card-title class="bg-success text-white">
      <v-icon class="mr-2">mdi-calculator</v-icon>
      💰 Estimación de Costos Mensual
    </v-card-title>
    
    <v-card-text class="pa-4">
      <!-- Lista de componentes con costos -->
      <v-list density="compact" class="pa-0">
        <v-list-item 
          v-for="component in components" 
          :key="component.id"
          class="px-0"
        >
          <template v-slot:prepend>
            <v-avatar color="primary" size="32">
              <v-icon color="white" size="16">{{ getComponentIcon(component.type || component.value) }}</v-icon>
            </v-avatar>
          </template>
          
          <v-list-item-title class="font-weight-medium">
            {{ getComponentDisplayName(component.type || component.value) }}
          </v-list-item-title>
          
          <v-list-item-subtitle class="text-body-2">
            {{ getPriceDescription(component) }}
          </v-list-item-subtitle>
          
          <template v-slot:append>
            <div class="text-right">
              <v-chip 
                :color="getCostColor(component)" 
                size="small" 
                variant="flat"
                class="font-weight-bold"
              >
                ${{ formatCost(calculateComponentCost(component)) }}
              </v-chip>
              <div class="text-caption text-grey-darken-1 mt-1">
                /mes
              </div>
            </div>
          </template>
        </v-list-item>
      </v-list>
      
      <!-- Divider -->
      <v-divider class="my-4"></v-divider>
      
      <!-- Total -->
      <v-row align="center" class="ma-0">
        <v-col cols="8" class="pa-0">
          <div class="text-h6 font-weight-bold">
            <v-icon class="mr-2" color="primary">mdi-cash-multiple</v-icon>
            Total Estimado
          </div>
          <div class="text-body-2 text-grey-darken-1">
            {{ components.length }} {{ components.length === 1 ? 'recurso' : 'recursos' }} configurados
          </div>
        </v-col>
        <v-col cols="4" class="pa-0 text-right">
          <v-chip 
            color="primary" 
            size="large" 
            variant="elevated"
            class="font-weight-bold"
          >
            <v-icon left size="16">mdi-currency-usd</v-icon>
            {{ formatCost(totalCost) }}/mes
          </v-chip>
        </v-col>
      </v-row>
      
      <!-- Desglose de costos -->
      <v-expansion-panels class="mt-4" variant="accordion">
        <v-expansion-panel>
          <v-expansion-panel-title>
            <v-icon class="mr-2">mdi-chart-pie</v-icon>
            Ver desglose detallado
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-row>
              <v-col cols="12" md="6">
                <!-- Gráfico de costos por categoría -->
                <div class="text-subtitle-2 mb-3 font-weight-bold">
                  Costos por Categoría
                </div>
                <div v-for="category in costByCategory" :key="category.name" class="mb-2">
                  <div class="d-flex justify-space-between align-center">
                    <span class="text-body-2">{{ category.name }}</span>
                    <span class="font-weight-medium">${{ formatCost(category.cost) }}</span>
                  </div>
                  <v-progress-linear 
                    :model-value="(category.cost / totalCost) * 100" 
                    :color="category.color"
                    height="8"
                    rounded
                  ></v-progress-linear>
                </div>
              </v-col>
              
              <v-col cols="12" md="6">
                <!-- Comparación de tiers -->
                <div class="text-subtitle-2 mb-3 font-weight-bold">
                  Análisis de Costos
                </div>
                
                <v-alert 
                  :type="getCostAnalysisType()" 
                  density="compact" 
                  variant="tonal"
                  class="mb-3"
                >
                  <div class="text-body-2">
                    <strong>{{ getCostAnalysisTitle() }}</strong><br>
                    {{ getCostAnalysisMessage() }}
                  </div>
                </v-alert>
                
                <!-- Recomendaciones -->
                <div v-if="costRecommendations && costRecommendations.length > 0">
                  <div class="text-body-2 font-weight-bold mb-2">
                    💡 Recomendaciones para optimizar costos:
                  </div>
                  <ul class="text-body-2">
                    <li v-for="rec in costRecommendations" :key="rec" class="mb-1">
                      {{ rec }}
                    </li>
                  </ul>
                </div>
              </v-col>
            </v-row>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
      
      <!-- Disclaimer -->
      <v-alert 
        type="info" 
        density="compact" 
        variant="tonal" 
        class="mt-4"
        border="start"
      >
        <template v-slot:prepend>
          <v-icon>mdi-information-outline</v-icon>
        </template>
        <div class="text-body-2">
          <strong>Nota importante:</strong> Los costos son estimaciones basadas en precios estándar de Azure (región East US). 
          Los costos reales pueden variar según el uso actual, la región seleccionada, descuentos aplicables, 
          ofertas especiales y el consumo real de recursos.
        </div>
      </v-alert>
    </v-card-text>
  </v-card>
</template>

<script>
import { 
  calculateComponentCost, 
  calculateTotalCost, 
  getPriceDescription, 
  getComponentIcon 
} from '../utils/azurePricing.js'

export default {
  name: 'CostEstimator',
  props: {
    components: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    totalCost() {
      if (!this.components || !Array.isArray(this.components)) {
        return 0
      }
      return calculateTotalCost(this.components)
    },
    
    costByCategory() {
      if (!this.components || !Array.isArray(this.components)) {
        return []
      }
      
      const categories = {
        'Compute': { name: 'Cómputo', cost: 0, color: 'primary', types: ['AppServicePlan', 'FunctionApp'] },
        'Database': { name: 'Base de Datos', cost: 0, color: 'orange', types: ['SQLDatabase'] },
        'Storage': { name: 'Almacenamiento', cost: 0, color: 'green', types: ['StorageAccount'] },
        'AI': { name: 'Inteligencia Artificial', cost: 0, color: 'purple', types: ['CognitiveService'] },
        'Monitoring': { name: 'Monitoreo', cost: 0, color: 'blue', types: ['MonitoringAlerts'] },
        'Other': { name: 'Otros', cost: 0, color: 'grey', types: [] }
      }
      
      this.components.forEach(component => {
        if (!component) return
        
        const cost = calculateComponentCost(component)
        const componentType = component.type || component.value
        let categorized = false
        
        for (const [key, category] of Object.entries(categories)) {
          if (category.types.includes(componentType)) {
            category.cost += cost
            categorized = true
            break
          }
        }
        
        if (!categorized) {
          categories.Other.cost += cost
        }
      })
      
      return Object.values(categories).filter(cat => cat.cost > 0)
    },
    
    costRecommendations() {
      if (!this.components || !Array.isArray(this.components)) {
        return []
      }
      
      const recommendations = []
      
      // Revisar si hay App Service en tier alto
      const expensiveAppServices = this.components.filter(c => 
        (c.type === 'AppServicePlan' || c.value === 'AppServicePlan') && 
        c.config && c.config.sku &&
        ['P1V2', 'P2V2', 'P3V2', 'P1V3', 'P2V3', 'P3V3'].includes(c.config.sku)
      )
      if (expensiveAppServices.length > 0) {
        recommendations.push('Considera usar tiers B1-B3 o S1-S3 para desarrollo/testing')
      }
      
      // Revisar SQL Database Premium
      const premiumDatabases = this.components.filter(c => 
        (c.type === 'SQLDatabase' || c.value === 'SQLDatabase') && 
        c.config && c.config.edition &&
        ['Premium', 'BusinessCritical'].includes(c.config.edition)
      )
      if (premiumDatabases.length > 0) {
        recommendations.push('Evalúa si realmente necesitas SQL Database Premium/Business Critical')
      }
      
      // Revisar Storage Premium
      const premiumStorage = this.components.filter(c => 
        (c.type === 'StorageAccount' || c.value === 'StorageAccount') && 
        c.config && c.config.sku && c.config.sku.includes('Premium')
      )
      if (premiumStorage.length > 0) {
        recommendations.push('Premium Storage es ideal para aplicaciones de alto rendimiento')
      }
      
      // Sugerir Function App Consumption si hay muchos compute resources
      const computeResources = this.components.filter(c => 
        ['AppServicePlan', 'FunctionApp'].includes(c.type || c.value)
      )
      if (computeResources.length > 1) {
        recommendations.push('Considera Function Apps con Consumption Plan para cargas variables')
      }
      
      return recommendations
    }
  },
  
  methods: {
    calculateComponentCost,
    getPriceDescription,
    getComponentIcon,
    
    formatCost(cost) {
      return cost.toFixed(2)
    },
    
    getCostColor(component) {
      const cost = calculateComponentCost(component)
      if (cost === 0) return 'grey'
      if (cost < 10) return 'green'
      if (cost < 50) return 'orange'
      return 'red'
    },
    
    getComponentDisplayName(componentValueOrType) {
      // Soporte para recibir el objeto completo o solo el tipo
      const type = typeof componentValueOrType === 'string' ? componentValueOrType : (componentValueOrType.type || componentValueOrType.value)
      
      const names = {
        'StorageAccount': 'Storage Account',
        'AppServicePlan': 'App Service Plan',
        'AppService': 'App Service',
        'SQLServer': 'SQL Server',
        'SQLDatabase': 'SQL Database',
        'FunctionApp': 'Function App',
        'CognitiveService': 'Cognitive Service',
        'MonitoringAlerts': 'Application Insights'
      }
      return names[type] || type
    },
    
    getCostAnalysisType() {
      if (this.totalCost < 20) return 'success'
      if (this.totalCost < 100) return 'warning'
      return 'error'
    },
    
    getCostAnalysisTitle() {
      if (this.totalCost < 20) return 'Configuración económica'
      if (this.totalCost < 100) return 'Configuración intermedia'
      return 'Configuración enterprise'
    },
    
    getCostAnalysisMessage() {
      if (this.totalCost < 20) {
        return 'Ideal para desarrollo, testing o aplicaciones pequeñas.'
      } else if (this.totalCost < 100) {
        return 'Adecuado para aplicaciones de producción pequeñas a medianas.'
      } else {
        return 'Configuración robusta para aplicaciones enterprise de alta demanda.'
      }
    }
  }
}
</script>

<style scoped>
.v-list-item {
  border-bottom: 1px solid rgba(0,0,0,0.05);
}

.v-list-item:last-child {
  border-bottom: none;
}

.v-expansion-panel-title {
  font-size: 0.875rem;
}
</style>
