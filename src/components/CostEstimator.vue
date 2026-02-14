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
                ${{ formatCost(getComponentCost(component)) }}
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
          <v-tooltip text="Este es el costo estimado mensual total para todos los recursos configurados, ajustado según la región seleccionada.">
            <template v-slot:activator="{ props }">
              <div v-bind="props" class="text-h6 font-weight-bold">
                <v-icon class="mr-2" color="primary">mdi-cash-multiple</v-icon>
                Total Estimado
              </div>
            </template>
          </v-tooltip>
          <div class="text-body-2 text-grey-darken-1">
            {{ components.length }} {{ components.length === 1 ? 'recurso' : 'recursos' }} configurados
          </div>
          <v-tooltip v-if="regionInfo.multiplier !== 1.0" text="Los precios varían según la región de Azure. Este ajuste refleja la diferencia de costos respecto a East US.">
            <template v-slot:activator="{ props }">
              <div v-bind="props" class="text-caption text-grey-darken-2 mt-1">
                <v-icon size="12" class="mr-1">mdi-map-marker</v-icon>
                {{ regionInfo.name }} ({{ (regionInfo.multiplier * 100 - 100).toFixed(0) }}{{ regionInfo.multiplier > 1 ? '+' : '' }}% vs East US)
              </div>
            </template>
          </v-tooltip>
          <div v-else class="text-caption text-grey-darken-2 mt-1">
            <v-icon size="12" class="mr-1">mdi-map-marker</v-icon>
            {{ regionInfo.name }} (precio base)
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
      
      <!-- Acciones compactas para panel angosto -->
      <v-row class="mt-3" dense>
        <v-col cols="6">
          <v-menu location="top" :close-on-content-click="true">
            <template v-slot:activator="{ props }">
              <v-btn
                v-bind="props"
                block
                stacked
                color="primary"
                variant="tonal"
                class="compact-action-btn"
              >
                <v-icon size="22">mdi-download</v-icon>
                <span class="action-label">Descargar reporte</span>
              </v-btn>
            </template>

            <v-list density="compact" min-width="220">
              <v-list-item prepend-icon="mdi-file-delimited" title="CSV" @click="exportReport('csv')" />
              <v-list-item prepend-icon="mdi-microsoft-excel" title="Excel" @click="exportReport('excel')" />
              <v-list-item prepend-icon="mdi-code-json" title="JSON" @click="exportReport('json')" />
              <v-list-item prepend-icon="mdi-printer" title="Imprimir" @click="exportReport('print')" />
            </v-list>
          </v-menu>
        </v-col>

        <v-col cols="6">
          <v-btn
            block
            stacked
            color="secondary"
            variant="tonal"
            class="compact-action-btn"
            @click="showDetailDialog = true"
          >
            <v-icon size="22">mdi-chart-pie</v-icon>
            <span class="action-label">Ver desglose detallado</span>
          </v-btn>
        </v-col>
      </v-row>
      
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
          <strong>Nota importante:</strong> Los costos son estimaciones basadas en precios estándar de Azure. 
          Se ha aplicado un ajuste del {{ regionInfo.multiplier !== 1.0 ? ((regionInfo.multiplier - 1) * 100).toFixed(0) + '% para la región ' + regionInfo.name : 'precio base para ' + regionInfo.name }}. 
          Los costos reales pueden variar según el uso actual, descuentos aplicables, 
          ofertas especiales y el consumo real de recursos.
        </div>
      </v-alert>

      <!-- Modal para desglose completo de costos -->
      <v-dialog v-model="showDetailDialog" max-width="980px">
        <v-card>
          <v-card-title class="text-h6 d-flex align-center">
            <v-icon class="mr-2">mdi-chart-pie</v-icon>
            Desglose detallado de costos
            <v-spacer />
            <v-btn icon="mdi-close" variant="text" @click="showDetailDialog = false" />
          </v-card-title>

          <v-divider />

          <v-card-text class="pt-4">
            <v-row>
              <v-col cols="12" md="6">
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
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn color="primary" @click="showDetailDialog = false">Cerrar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed, ref } from 'vue'
import { 
  calculateComponentCost, 
  calculateTotalCost, 
  getPriceDescription, 
  getComponentIcon,
  regionPriceMultipliers 
} from '../utils/azurePricing.js'

const props = defineProps({
  components: {
    type: Array,
    default: () => []
  },
  region: {
    type: String,
    default: 'eastus'
  }
})

// Controla la visibilidad del modal de desglose de costos.
const showDetailDialog = ref(false)

const regionInfo = computed(() => {
  return regionPriceMultipliers[props.region] || { multiplier: 1.0, name: 'Unknown Region' }
})

const totalCost = computed(() => {
  if (!props.components || !Array.isArray(props.components)) {
    return 0
  }
  return calculateTotalCost(props.components, props.region)
})

const costByCategory = computed(() => {
  if (!props.components || !Array.isArray(props.components)) {
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

  props.components.forEach(component => {
    if (!component) return

    const cost = calculateComponentCost(component, props.region)
    const componentType = component.type || component.value
    let categorized = false

    for (const category of Object.values(categories)) {
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
})

const costRecommendations = computed(() => {
  if (!props.components || !Array.isArray(props.components)) {
    return []
  }

  const recommendations = []

  const expensiveAppServices = props.components.filter(c =>
    (c.type === 'AppServicePlan' || c.value === 'AppServicePlan') &&
    c.config && c.config.sku &&
    ['P1V2', 'P2V2', 'P3V2', 'P1V3', 'P2V3', 'P3V3'].includes(c.config.sku)
  )
  if (expensiveAppServices.length > 0) {
    recommendations.push('Considera usar tiers B1-B3 o S1-S3 para desarrollo/testing')
  }

  const premiumDatabases = props.components.filter(c =>
    (c.type === 'SQLDatabase' || c.value === 'SQLDatabase') &&
    c.config && c.config.edition &&
    ['Premium', 'BusinessCritical'].includes(c.config.edition)
  )
  if (premiumDatabases.length > 0) {
    recommendations.push('Evalúa si realmente necesitas SQL Database Premium/Business Critical')
  }

  const premiumStorage = props.components.filter(c =>
    (c.type === 'StorageAccount' || c.value === 'StorageAccount') &&
    c.config && c.config.sku && c.config.sku.includes('Premium')
  )
  if (premiumStorage.length > 0) {
    recommendations.push('Premium Storage es ideal para aplicaciones de alto rendimiento')
  }

  const computeResources = props.components.filter(c =>
    ['AppServicePlan', 'FunctionApp'].includes(c.type || c.value)
  )
  if (computeResources.length > 1) {
    recommendations.push('Considera Function Apps con Consumption Plan para cargas variables')
  }

  return recommendations
})

const getComponentCost = (component) => {
  return calculateComponentCost(component, props.region)
}

const formatCost = (cost) => {
  return cost.toFixed(2)
}

const getCostColor = (component) => {
  const cost = getComponentCost(component)
  if (cost === 0) return 'grey'
  if (cost < 10) return 'green'
  if (cost < 50) return 'orange'
  return 'red'
}

const getComponentDisplayName = (componentValueOrType) => {
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
}

const getCostAnalysisType = () => {
  if (totalCost.value < 20) return 'success'
  if (totalCost.value < 100) return 'warning'
  return 'error'
}

const getCostAnalysisTitle = () => {
  if (totalCost.value < 20) return 'Configuración económica'
  if (totalCost.value < 100) return 'Configuración intermedia'
  return 'Configuración enterprise'
}

const getCostAnalysisMessage = () => {
  if (totalCost.value < 20) {
    return 'Ideal para desarrollo, testing o aplicaciones pequeñas.'
  } else if (totalCost.value < 100) {
    return 'Adecuado para aplicaciones de producción pequeñas a medianas.'
  }
  return 'Configuración robusta para aplicaciones enterprise de alta demanda.'
}

// Genera un snapshot uniforme para todos los formatos de descarga.
const generateReportData = () => {
  return {
    metadata: {
      generatedAt: new Date().toISOString(),
      region: regionInfo.value.name,
      regionMultiplier: regionInfo.value.multiplier,
      totalComponents: props.components.length,
      totalCost: totalCost.value
    },
    components: props.components.map(component => ({
      name: component.config?.name || 'Sin nombre',
      type: getComponentDisplayName(component.type || component.value),
      typeId: component.type || component.value,
      cost: getComponentCost(component),
      configuration: component.config,
      description: getPriceDescription(component)
    })),
    costByCategory: costByCategory.value,
    recommendations: costRecommendations.value
  }
}

const downloadCSV = () => {
  const reportData = generateReportData()
  let csvContent = 'data:text/csv;charset=utf-8,'

  csvContent += 'Reporte de Estimación de Costos Azure\n'
  csvContent += `Generado el: ${new Date().toLocaleString()}\n`
  csvContent += `Región: ${regionInfo.value.name}\n`
  csvContent += `Multiplicador de región: ${regionInfo.value.multiplier}\n`
  csvContent += `Total estimado: $${formatCost(totalCost.value)}/mes\n\n`

  csvContent += 'Componente,Tipo,Costo Mensual,Descripción\n'
  reportData.components.forEach(component => {
    csvContent += `"${component.name}","${component.type}","$${formatCost(component.cost)}","${component.description}"\n`
  })

  csvContent += '\nCostos por Categoría\n'
  csvContent += 'Categoría,Costo\n'
  reportData.costByCategory.forEach(category => {
    csvContent += `"${category.name}","$${formatCost(category.cost)}"\n`
  })

  if (reportData.recommendations.length > 0) {
    csvContent += '\nRecomendaciones\n'
    reportData.recommendations.forEach(rec => {
      csvContent += `"${rec}"\n`
    })
  }

  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', `azure-cost-estimate-${new Date().toISOString().split('T')[0]}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const downloadExcel = () => {
  const reportData = generateReportData()

  let excelContent = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
        <head>
          <meta charset="UTF-8">
          <!--[if gte mso 9]>
          <xml>
            <x:ExcelWorkbook>
              <x:ExcelWorksheets>
                <x:ExcelWorksheet>
                  <x:Name>Estimación Costos</x:Name>
                  <x:WorksheetOptions>
                    <x:Print>
                      <x:ValidPrinterInfo/>
                    </x:Print>
                  </x:WorksheetOptions>
                </x:ExcelWorksheet>
              </x:ExcelWorksheets>
            </x:ExcelWorkbook>
          </xml>
          <![endif]-->
          <style>
            .header { font-weight: bold; background-color: #0078d4; color: white; }
            .total { font-weight: bold; background-color: #f0f8ff; }
            .number { text-align: right; }
          </style>
        </head>
        <body>
          <table border="1">
            <tr class="header">
              <td colspan="4">Estimación de Costos Azure</td>
            </tr>
            <tr>
              <td><strong>Fecha:</strong></td>
              <td colspan="3">${new Date().toLocaleString()}</td>
            </tr>
            <tr>
              <td><strong>Región:</strong></td>
              <td colspan="3">${reportData.metadata.region}</td>
            </tr>
            <tr>
              <td><strong>Total:</strong></td>
              <td colspan="3" class="total">$${formatCost(reportData.metadata.totalCost)}/mes</td>
            </tr>
            <tr><td colspan="4"></td></tr>
            <tr class="header">
              <td>Componente</td>
              <td>Tipo</td>
              <td>Costo Mensual</td>
              <td>Descripción</td>
            </tr>
      `
      
      reportData.components.forEach(component => {
        excelContent += `
          <tr>
            <td>${component.name}</td>
            <td>${component.type}</td>
            <td class="number">$${formatCost(component.cost)}</td>
            <td>${component.description}</td>
          </tr>
        `
      })
      
      excelContent += `
            <tr><td colspan="4"></td></tr>
            <tr class="header">
              <td colspan="2">Categoría</td>
              <td>Costo</td>
              <td>Porcentaje</td>
            </tr>
      `
      
      reportData.costByCategory.forEach(category => {
        excelContent += `
          <tr>
            <td colspan="2">${category.name}</td>
            <td class="number">$${formatCost(category.cost)}</td>
            <td class="number">${((category.cost / reportData.metadata.totalCost) * 100).toFixed(1)}%</td>
          </tr>
        `
      })
      
      if (reportData.recommendations.length > 0) {
        excelContent += `
          <tr><td colspan="4"></td></tr>
          <tr class="header">
            <td colspan="4">Recomendaciones</td>
          </tr>
        `
        reportData.recommendations.forEach(rec => {
          excelContent += `<tr><td colspan="4">${rec}</td></tr>`
        })
      }
      
      excelContent += `
          </table>
        </body>
        </html>
      `
      
      const blob = new Blob([excelContent], { 
        type: 'application/vnd.ms-excel;charset=utf-8' 
      })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `azure-cost-estimate-${new Date().toISOString().split('T')[0]}.xls`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
}

const downloadJSON = () => {
  const reportData = generateReportData()
  const jsonString = JSON.stringify(reportData, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `azure-cost-estimate-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const printReport = () => {
  const reportData = generateReportData()

  const printWindow = window.open('', '_blank')
  printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Estimación de Costos Azure</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #0078d4; border-bottom: 2px solid #0078d4; padding-bottom: 10px; }
            h2 { color: #323130; margin-top: 30px; }
            table { border-collapse: collapse; width: 100%; margin: 15px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f8f9fa; font-weight: bold; }
            .total { font-size: 18px; font-weight: bold; color: #0078d4; }
            .metadata { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; }
            .recommendations { background-color: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107; }
            ul { margin: 0; padding-left: 20px; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <h1>🏗️ Estimación de Costos Azure</h1>
          
          <div class="metadata">
            <p><strong>Fecha de generación:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Región:</strong> ${reportData.metadata.region}</p>
            <p><strong>Multiplicador de región:</strong> ${reportData.metadata.regionMultiplier}</p>
            <p class="total"><strong>Total estimado:</strong> $${formatCost(reportData.metadata.totalCost)}/mes</p>
          </div>
          
          <h2>📋 Componentes Configurados</h2>
          <table>
            <thead>
              <tr>
                <th>Componente</th>
                <th>Tipo</th>
                <th>Costo Mensual</th>
                <th>Descripción</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.components.map(component => `
                <tr>
                  <td>${component.name}</td>
                  <td>${component.type}</td>
                  <td>$${formatCost(component.cost)}</td>
                  <td>${component.description}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <h2>📊 Costos por Categoría</h2>
          <table>
            <thead>
              <tr>
                <th>Categoría</th>
                <th>Costo</th>
                <th>Porcentaje</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.costByCategory.map(category => `
                <tr>
                  <td>${category.name}</td>
                  <td>$${formatCost(category.cost)}</td>
                  <td>${((category.cost / reportData.metadata.totalCost) * 100).toFixed(1)}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          ${reportData.recommendations.length > 0 ? `
            <h2>💡 Recomendaciones</h2>
            <div class="recommendations">
              <ul>
                ${reportData.recommendations.map(rec => `<li>${rec}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          
          <div style="margin-top: 40px; text-align: center; color: #666; font-size: 12px;">
            <p>Generado por InfraGen - © ${new Date().getFullYear()} CodeLand</p>
            <p><strong>Nota:</strong> Los costos son estimaciones y pueden variar según el uso real.</p>
          </div>
        </body>
        </html>
      `)
  printWindow.document.close()
  printWindow.print()
}

// Centraliza la ejecución de exportaciones para mantener la vista compacta.
const exportReport = (format) => {
  if (format === 'csv') {
    downloadCSV()
    return
  }

  if (format === 'excel') {
    downloadExcel()
    return
  }

  if (format === 'json') {
    downloadJSON()
    return
  }

  if (format === 'print') {
    printReport()
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

.compact-action-btn {
  min-height: 74px;
}

.action-label {
  display: inline-block;
  font-size: 0.72rem;
  line-height: 1.15;
  text-align: center;
  max-width: 100px;
  white-space: normal;
}
</style>
