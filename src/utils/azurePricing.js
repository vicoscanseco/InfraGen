// Azure Pricing Calculator
// Precios estimados basados en precios públicos de Azure
// Región base: East US (multiplicador 1.0)
// Última actualización: Septiembre 2025

// Multiplicadores de precio por región (basado en datos reales de Azure)
export const regionPriceMultipliers = {
  // Estados Unidos
  'eastus': { multiplier: 1.0, name: 'East US' },
  'eastus2': { multiplier: 1.0, name: 'East US 2' },
  'westus': { multiplier: 1.0, name: 'West US' },
  'westus2': { multiplier: 1.0, name: 'West US 2' },
  'westus3': { multiplier: 1.0, name: 'West US 3' },
  'centralus': { multiplier: 1.0, name: 'Central US' },
  'southcentralus': { multiplier: 1.0, name: 'South Central US' },
  'northcentralus': { multiplier: 1.0, name: 'North Central US' },
  
  // Europa
  'westeurope': { multiplier: 1.08, name: 'West Europe' },
  'northeurope': { multiplier: 1.05, name: 'North Europe' },
  'uksouth': { multiplier: 1.12, name: 'UK South' },
  'ukwest': { multiplier: 1.12, name: 'UK West' },
  'francecentral': { multiplier: 1.09, name: 'France Central' },
  'germanywestcentral': { multiplier: 1.10, name: 'Germany West Central' },
  
  // Asia-Pacífico
  'eastasia': { multiplier: 1.15, name: 'East Asia' },
  'southeastasia': { multiplier: 1.12, name: 'Southeast Asia' },
  'japaneast': { multiplier: 1.20, name: 'Japan East' },
  'japanwest': { multiplier: 1.22, name: 'Japan West' },
  'australiaeast': { multiplier: 1.18, name: 'Australia East' },
  'australiasoutheast': { multiplier: 1.18, name: 'Australia Southeast' },
  
  // Latinoamérica y otros
  'brazilsouth': { multiplier: 1.25, name: 'Brazil South' },
  'mexicocentral': { multiplier: 1.15, name: 'Mexico Central' }, // Estimado
  'southafricanorth': { multiplier: 1.14, name: 'South Africa North' },
  'uaenorth': { multiplier: 1.16, name: 'UAE North' },
  
  // Canadá
  'canadacentral': { multiplier: 1.06, name: 'Canada Central' },
  'canadaeast': { multiplier: 1.06, name: 'Canada East' },
  
  // India
  'centralindia': { multiplier: 1.08, name: 'Central India' },
  'southindia': { multiplier: 1.08, name: 'South India' },
  'westindia': { multiplier: 1.08, name: 'West India' }
}

export const azurePricing = {
  // Storage Account - precios por mes
  StorageAccount: {
    'Standard_LRS': {
      basePrice: 2.4, // $2.4/mes por 100GB
      description: 'Locally Redundant Storage'
    },
    'Standard_GRS': {
      basePrice: 4.8, // $4.8/mes por 100GB  
      description: 'Geo Redundant Storage'
    },
    'Standard_RAGRS': {
      basePrice: 6.0, // $6.0/mes por 100GB
      description: 'Read-Access Geo Redundant'
    },
    'Standard_ZRS': {
      basePrice: 3.0, // $3.0/mes por 100GB
      description: 'Zone Redundant Storage'
    },
    'Premium_LRS': {
      basePrice: 15.36, // $15.36/mes por 100GB
      description: 'Premium Locally Redundant'
    },
    'Premium_ZRS': {
      basePrice: 19.2, // $19.2/mes por 100GB
      description: 'Premium Zone Redundant'
    }
  },

  // App Service Plans - precios por mes
  AppServicePlan: {
    'F1': {
      basePrice: 0, // Gratis
      description: 'Free (1GB RAM, 60 min/día)'
    },
    'D1': {
      basePrice: 9.49, // $9.49/mes
      description: 'Shared (1GB RAM, 240 min/día)'
    },
    'B1': {
      basePrice: 13.14, // $13.14/mes
      description: 'Basic (1.75GB RAM, 1 core)'
    },
    'B2': {
      basePrice: 26.28, // $26.28/mes
      description: 'Basic (3.5GB RAM, 2 cores)'
    },
    'B3': {
      basePrice: 52.56, // $52.56/mes
      description: 'Basic (7GB RAM, 4 cores)'
    },
    'S1': {
      basePrice: 56.94, // $56.94/mes
      description: 'Standard (1.75GB RAM, 1 core)'
    },
    'S2': {
      basePrice: 113.88, // $113.88/mes
      description: 'Standard (3.5GB RAM, 2 cores)'
    },
    'S3': {
      basePrice: 227.76, // $227.76/mes
      description: 'Standard (7GB RAM, 4 cores)'
    },
    'P1V2': {
      basePrice: 82.13, // $82.13/mes
      description: 'Premium v2 (3.5GB RAM, 1 core)'
    },
    'P2V2': {
      basePrice: 164.25, // $164.25/mes
      description: 'Premium v2 (7GB RAM, 2 cores)'
    },
    'P3V2': {
      basePrice: 328.5, // $328.5/mes
      description: 'Premium v2 (14GB RAM, 4 cores)'
    },
    'P1V3': {
      basePrice: 62.05, // $62.05/mes
      description: 'Premium v3 (4GB RAM, 2 cores)'
    },
    'P2V3': {
      basePrice: 124.1, // $124.1/mes
      description: 'Premium v3 (8GB RAM, 4 cores)'
    },
    'P3V3': {
      basePrice: 248.2, // $248.2/mes
      description: 'Premium v3 (16GB RAM, 8 cores)'
    }
  },

  // SQL Database - precios por mes
  SQLDatabase: {
    'Basic': {
      basePrice: 4.99, // $4.99/mes
      description: 'Basic (5 DTU, 2GB max)'
    },
    'Standard': {
      basePrice: 15.00, // $15/mes (S0)
      description: 'Standard (10 DTU, 250GB max)'
    },
    'Premium': {
      basePrice: 465.00, // $465/mes (P1)
      description: 'Premium (125 DTU, 500GB max)'
    },
    'GeneralPurpose': {
      basePrice: 283.50, // $283.5/mes (2 vCore)
      description: 'General Purpose (2 vCore)'
    },
    'BusinessCritical': {
      basePrice: 850.50, // $850.5/mes (2 vCore)
      description: 'Business Critical (2 vCore)'
    },
    'Hyperscale': {
      basePrice: 567.00, // $567/mes (2 vCore)
      description: 'Hyperscale (2 vCore)'
    }
  },

  // Function App - precios por mes
  FunctionApp: {
    'Consumption': {
      basePrice: 8.0, // ~$8/mes estimado para uso moderado
      description: 'Consumption Plan (Pay per execution)'
    },
    'Premium': {
      basePrice: 159.60, // $159.6/mes (EP1)
      description: 'Premium Plan (EP1 - 1 vCore, 3.5GB)'
    },
    'Dedicated': {
      basePrice: 56.94, // Usa el precio del App Service Plan S1
      description: 'Dedicated Plan (heredado del ASP)'
    }
  },

  // Cognitive Services - precios por mes
  CognitiveServices: {
    'F0': {
      basePrice: 0, // Gratis
      description: 'Free Tier (limitado)'
    },
    'S0': {
      basePrice: 15.00, // ~$15/mes estimado
      description: 'Standard Tier'
    },
    'S1': {
      basePrice: 50.00, // ~$50/mes estimado
      description: 'Premium Tier'
    }
  },

  // Application Insights - precios por mes
  ApplicationInsights: {
    'Basic': {
      basePrice: 2.30, // $2.30/GB/mes después de 5GB gratis
      description: 'Pay-as-you-go (5GB gratis/mes)'
    }
  }
}

// Función para calcular el costo de un componente
export function calculateComponentCost(component, region = 'eastus') {
  // Soporte para ambas estructuras: { type: '...' } y { value: '...' }
  const componentType = component.type || component.value
  const { config } = component
  
  if (!config) {
    return 5.0
  }
  
  // Obtener multiplicador de región
  const regionMultiplier = regionPriceMultipliers[region]?.multiplier || 1.0
  
  switch (componentType) {
    case 'StorageAccount':
      const storagePricing = azurePricing.StorageAccount[config.sku]
      return storagePricing ? (storagePricing.basePrice * regionMultiplier) : (5.0 * regionMultiplier)

    case 'AppServicePlan':
      const aspPricing = azurePricing.AppServicePlan[config.sku]
      return aspPricing ? (aspPricing.basePrice * regionMultiplier) : (15.0 * regionMultiplier)

    case 'AppService':
      // App Service no tiene costo adicional, usa el del Plan
      return 0

    case 'SQLServer':
      // SQL Server no tiene costo base, solo las bases de datos
      return 0

    case 'SQLDatabase':
      const sqlPricing = azurePricing.SQLDatabase[config.edition]
      return sqlPricing ? (sqlPricing.basePrice * regionMultiplier) : (10.0 * regionMultiplier)

    case 'FunctionApp':
      const funcPricing = azurePricing.FunctionApp[config.hostingPlan]
      return funcPricing ? (funcPricing.basePrice * regionMultiplier) : (10.0 * regionMultiplier)

    case 'CognitiveService':
      const cogPricing = azurePricing.CognitiveServices[config.sku]
      return cogPricing ? (cogPricing.basePrice * regionMultiplier) : (15.0 * regionMultiplier)

    case 'MonitoringAlerts':
      // Application Insights incluido
      return azurePricing.ApplicationInsights.Basic.basePrice * regionMultiplier

    default:
      return 5.0 * regionMultiplier // Costo base para recursos no definidos
  }
}

// Función para obtener la descripción del precio
export function getPriceDescription(component) {
  // Soporte para ambas estructuras: { type: '...' } y { value: '...' }
  const componentType = component.type || component.value
  const { config } = component
  
  switch (componentType) {
    case 'StorageAccount':
      const storagePricing = azurePricing.StorageAccount[config.sku]
      return storagePricing ? storagePricing.description : 'Storage Account'

    case 'AppServicePlan':
      const aspPricing = azurePricing.AppServicePlan[config.sku]
      return aspPricing ? aspPricing.description : 'App Service Plan'

    case 'AppService':
      return 'Incluido en App Service Plan'

    case 'SQLServer':
      return 'Servidor SQL (sin costo base)'

    case 'SQLDatabase':
      const sqlPricing = azurePricing.SQLDatabase[config.edition]
      return sqlPricing ? sqlPricing.description : 'SQL Database'

    case 'FunctionApp':
      const funcPricing = azurePricing.FunctionApp[config.hostingPlan]
      return funcPricing ? funcPricing.description : 'Function App'

    case 'CognitiveService':
      const cogPricing = azurePricing.CognitiveServices[config.sku]
      return cogPricing ? cogPricing.description : 'Cognitive Service'

    case 'MonitoringAlerts':
      return azurePricing.ApplicationInsights.Basic.description

    default:
      return 'Recurso Azure'
  }
}

// Función para calcular el total de costos
export function calculateTotalCost(components, region = 'eastus') {
  if (!components || !Array.isArray(components)) {
    return 0
  }
  
  return components.reduce((total, component) => {
    if (!component) return total
    return total + calculateComponentCost(component, region)
  }, 0)
}

// Función para obtener el ícono del componente
export function getComponentIcon(componentType) {
  // Soporte para recibir el objeto completo o solo el tipo
  const type = typeof componentType === 'string' ? componentType : (componentType.type || componentType.value)
  
  const icons = {
    'StorageAccount': 'mdi-database',
    'AppServicePlan': 'mdi-server',
    'AppService': 'mdi-web',
    'SQLServer': 'mdi-database',
    'SQLDatabase': 'mdi-database-outline',
    'FunctionApp': 'mdi-function',
    'CognitiveService': 'mdi-brain',
    'MonitoringAlerts': 'mdi-chart-line'
  }
  return icons[type] || 'mdi-cloud'
}
