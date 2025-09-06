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
  // Los precios de Linux son aproximadamente 10-15% más baratos que Windows
  AppServicePlan: {
    'F1': {
      Windows: { basePrice: 0, description: 'Free (1GB RAM, 60 min/día)' }, // Gratis para ambos
      Linux: { basePrice: 0, description: 'Free (1GB RAM, 60 min/día)' }
    },
    'D1': {
      Windows: { basePrice: 9.49, description: 'Shared (1GB RAM, 240 min/día)' },
      Linux: { basePrice: 9.49, description: 'Shared (1GB RAM, 240 min/día)' } // Shared no disponible en Linux, mismo precio
    },
    'B1': {
      Windows: { basePrice: 13.14, description: 'Basic (1.75GB RAM, 1 core)' },
      Linux: { basePrice: 12.02, description: 'Basic (1.75GB RAM, 1 core)' } // ~8.5% más barato
    },
    'B2': {
      Windows: { basePrice: 26.28, description: 'Basic (3.5GB RAM, 2 cores)' },
      Linux: { basePrice: 24.05, description: 'Basic (3.5GB RAM, 2 cores)' } // ~8.5% más barato
    },
    'B3': {
      Windows: { basePrice: 52.56, description: 'Basic (7GB RAM, 4 cores)' },
      Linux: { basePrice: 48.09, description: 'Basic (7GB RAM, 4 cores)' } // ~8.5% más barato
    },
    'S1': {
      Windows: { basePrice: 56.94, description: 'Standard (1.75GB RAM, 1 core)' },
      Linux: { basePrice: 52.10, description: 'Standard (1.75GB RAM, 1 core)' } // ~8.5% más barato
    },
    'S2': {
      Windows: { basePrice: 113.88, description: 'Standard (3.5GB RAM, 2 cores)' },
      Linux: { basePrice: 104.20, description: 'Standard (3.5GB RAM, 2 cores)' } // ~8.5% más barato
    },
    'S3': {
      Windows: { basePrice: 227.76, description: 'Standard (7GB RAM, 4 cores)' },
      Linux: { basePrice: 208.40, description: 'Standard (7GB RAM, 4 cores)' } // ~8.5% más barato
    },
    'P1V2': {
      Windows: { basePrice: 82.13, description: 'Premium v2 (3.5GB RAM, 1 core)' },
      Linux: { basePrice: 75.15, description: 'Premium v2 (3.5GB RAM, 1 core)' } // ~8.5% más barato
    },
    'P2V2': {
      Windows: { basePrice: 164.25, description: 'Premium v2 (7GB RAM, 2 cores)' },
      Linux: { basePrice: 150.29, description: 'Premium v2 (7GB RAM, 2 cores)' } // ~8.5% más barato
    },
    'P3V2': {
      Windows: { basePrice: 328.5, description: 'Premium v2 (14GB RAM, 4 cores)' },
      Linux: { basePrice: 300.58, description: 'Premium v2 (14GB RAM, 4 cores)' } // ~8.5% más barato
    },
    'P1V3': {
      Windows: { basePrice: 62.05, description: 'Premium v3 (4GB RAM, 2 cores)' },
      Linux: { basePrice: 56.78, description: 'Premium v3 (4GB RAM, 2 cores)' } // ~8.5% más barato
    },
    'P2V3': {
      Windows: { basePrice: 124.1, description: 'Premium v3 (8GB RAM, 4 cores)' },
      Linux: { basePrice: 113.55, description: 'Premium v3 (8GB RAM, 4 cores)' } // ~8.5% más barato
    },
    'P3V3': {
      Windows: { basePrice: 248.2, description: 'Premium v3 (16GB RAM, 8 cores)' },
      Linux: { basePrice: 227.10, description: 'Premium v3 (16GB RAM, 8 cores)' } // ~8.5% más barato
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
      if (aspPricing) {
        const os = config.os || 'Windows' // Default a Windows si no se especifica
        const osPricing = aspPricing[os]
        return osPricing ? (osPricing.basePrice * regionMultiplier) : (15.0 * regionMultiplier)
      }
      return 15.0 * regionMultiplier

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
      if (aspPricing) {
        const os = config.os || 'Windows' // Default a Windows si no se especifica
        const osPricing = aspPricing[os]
        return osPricing ? `${osPricing.description} - ${os}` : 'App Service Plan'
      }
      return 'App Service Plan'

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
