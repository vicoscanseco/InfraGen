import { describe, it, expect } from 'vitest'
import { buildBicepContent } from '../src/utils/bicepGenerator'
import { parseInfragenBicep } from '../src/utils/bicepImportParser'

describe('import/export roundtrip', () => {
  it('preserva datos clave al generar y volver a importar un Bicep', () => {
    const components = [
      {
        value: 'StorageAccount',
        config: {
          name: 'stademo',
          sku: 'Standard_LRS',
          kind: 'StorageV2',
          accessTier: 'Hot',
          httpsOnly: true
        }
      },
      {
        value: 'AppServicePlan',
        config: {
          name: 'demo-plan',
          sku: 'P1v2',
          os: 'Linux'
        }
      },
      {
        value: 'AppService',
        config: {
          name: 'demo-app',
          appServicePlan: 'demo-plan',
          httpsOnly: true,
          minTlsVersion: '1.2'
        }
      },
      {
        value: 'SQLServer',
        config: {
          name: 'sqls-demo',
          adminUsername: 'sqladmin',
          adminPassword: 'Secret123!',
          minimalTlsVersion: '1.2',
          publicNetworkAccess: 'Enabled'
        }
      },
      {
        value: 'SQLDatabase',
        config: {
          name: 'db-demo',
          sqlServer: 'sqls-demo',
          sku: 'Basic',
          tier: 'Basic',
          capacity: 2,
          maxSizeBytes: 1073741824
        }
      }
    ]

    const bicep = buildBicepContent({
      appName: 'demoApp',
      selectedEnv: 'dev',
      location: 'eastus',
      resourceGroupName: 'rg-eastus-demo',
      configuredComponents: components
    })

    const parsed = parseInfragenBicep(bicep)

    expect(parsed.appName).toBe('demoApp')
    expect(parsed.environment).toBe('dev')
    expect(parsed.location).toBe('eastus')
    expect(parsed.resourceGroupName).toBe('rg-eastus-demo')
    expect(parsed.components).toHaveLength(5)

    const storage = parsed.components.find(c => c.value === 'StorageAccount')
    expect(storage).toBeDefined()
    expect(storage.config.name).toBe('stademo')
    expect(storage.config.kind).toBe('StorageV2')

    const appService = parsed.components.find(c => c.value === 'AppService')
    expect(appService.config.appServicePlan).toBe('demo-plan')
    expect(appService.config.minTlsVersion).toBe('1.2')

    const sqlDatabase = parsed.components.find(c => c.value === 'SQLDatabase')
    expect(sqlDatabase.config.sqlServer).toBe('sqls-demo')
    expect(sqlDatabase.config.maxSizeBytes).toBe(1073741824)
  })
})
