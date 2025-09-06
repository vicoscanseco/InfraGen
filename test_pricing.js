// Script de prueba para verificar el cálculo de precios con Sistema Operativo
import { calculateComponentCost, getPriceDescription } from './src/utils/azurePricing.js'

// Configuraciones de prueba para App Service Plan
const testConfigurations = [
  {
    type: 'AppServicePlan',
    config: { sku: 'B1', os: 'Windows', name: 'test-plan-windows' }
  },
  {
    type: 'AppServicePlan', 
    config: { sku: 'B1', os: 'Linux', name: 'test-plan-linux' }
  },
  {
    type: 'AppServicePlan',
    config: { sku: 'S1', os: 'Windows', name: 'test-plan-windows-s1' }
  },
  {
    type: 'AppServicePlan',
    config: { sku: 'S1', os: 'Linux', name: 'test-plan-linux-s1' }
  },
  {
    type: 'AppServicePlan',
    config: { sku: 'P1V3', os: 'Windows', name: 'test-plan-windows-p1v3' }
  },
  {
    type: 'AppServicePlan',
    config: { sku: 'P1V3', os: 'Linux', name: 'test-plan-linux-p1v3' }
  }
]

console.log('🧪 Probando cálculo de precios con Sistema Operativo\n')

testConfigurations.forEach(component => {
  const cost = calculateComponentCost(component, 'eastus')
  const description = getPriceDescription(component)
  
  console.log(`📊 ${component.config.name}:`)
  console.log(`   SKU: ${component.config.sku}`)
  console.log(`   OS: ${component.config.os}`) 
  console.log(`   Costo: $${cost.toFixed(2)}/mes`)
  console.log(`   Descripción: ${description}`)
  console.log('')
})

// Verificar diferencia de precios entre Windows y Linux
const windowsB1 = calculateComponentCost(testConfigurations[0], 'eastus')
const linuxB1 = calculateComponentCost(testConfigurations[1], 'eastus')
const savings = ((windowsB1 - linuxB1) / windowsB1 * 100).toFixed(1)

console.log(`💰 Comparación de precios B1:`)
console.log(`   Windows: $${windowsB1.toFixed(2)}/mes`)
console.log(`   Linux: $${linuxB1.toFixed(2)}/mes`)
console.log(`   Ahorro con Linux: ${savings}%`)
