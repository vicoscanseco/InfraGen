const extractString = (text, pattern) => {
  const match = text.match(pattern)
  return match?.[1]?.trim() || ''
}

const extractBoolean = (text, key) => {
  const match = text.match(new RegExp(`${key}\\s*:\\s*(true|false)`))
  if (!match) return undefined
  return match[1] === 'true'
}

const extractNumber = (text, key) => {
  const match = text.match(new RegExp(`${key}\\s*:\\s*([0-9]+(?:\\.[0-9]+)?)`))
  if (!match) return undefined
  return Number(match[1])
}

const parseObjectNameValueList = (text) => {
  const result = []
  const regex = /\{\s*name:\s*'([^']+)'\s*value:\s*'([^']*)'\s*\}/gms
  let match = regex.exec(text)

  while (match) {
    result.push({ name: match[1], value: match[2] })
    match = regex.exec(text)
  }

  return result
}

const extractBlock = (content, openBraceIndex) => {
  let depth = 0
  let inString = false

  for (let index = openBraceIndex; index < content.length; index += 1) {
    const char = content[index]

    if (char === '\'') {
      if (inString && content[index + 1] === '\'') {
        index += 1
        continue
      }
      inString = !inString
      continue
    }

    if (inString) continue

    if (char === '{') depth += 1
    if (char === '}') {
      depth -= 1
      if (depth === 0) {
        return {
          body: content.slice(openBraceIndex, index + 1),
          endIndex: index
        }
      }
    }
  }

  return null
}

const extractResources = (bicepContent) => {
  const resources = []
  const regex = /resource\s+([a-zA-Z0-9_]+)\s+'([^']+)'\s*=\s*\{/g
  let match = regex.exec(bicepContent)

  while (match) {
    const symbol = match[1]
    const resourceType = match[2]
    const openBraceIndex = regex.lastIndex - 1
    const parsedBlock = extractBlock(bicepContent, openBraceIndex)

    if (!parsedBlock) {
      match = regex.exec(bicepContent)
      continue
    }

    resources.push({
      symbol,
      resourceType,
      body: parsedBlock.body
    })

    regex.lastIndex = parsedBlock.endIndex + 1
    match = regex.exec(bicepContent)
  }

  return resources
}

const toComponent = (value, config) => ({ value, config })

export const parseInfragenBicep = (bicepContent) => {
  if (!bicepContent || typeof bicepContent !== 'string') {
    throw new Error('El archivo Bicep está vacío o no es válido.')
  }

  const appName =
    extractString(bicepContent, /param\s+appName\s+string\s*=\s*'([^']+)'/) ||
    extractString(bicepContent, /\/\/\s+AppName:\s*(.+)/)

  const environment =
    extractString(bicepContent, /param\s+environment\s+string\s*=\s*'([^']+)'/) ||
    extractString(bicepContent, /\/\/\s+Environment:\s*(.+)/)

  const location =
    extractString(bicepContent, /param\s+location\s+string\s*=\s*'([^']+)'/) ||
    extractString(bicepContent, /\/\/\s+Location:\s*(.+)/)

  const resourceGroupName = extractString(bicepContent, /\/\/\s+ResourceGroup:\s*(.+)/)

  const resources = extractResources(bicepContent)
  const symbolToName = new Map()

  resources.forEach(resource => {
    const name = extractString(resource.body, /name:\s*'([^']+)'/)
    if (name) {
      symbolToName.set(resource.symbol, name)
    }
  })

  const components = []

  resources.forEach(resource => {
    if (resource.resourceType.startsWith('Microsoft.Storage/storageAccounts@')) {
      const config = {
        name: extractString(resource.body, /name:\s*'([^']+)'/),
        sku: extractString(resource.body, /sku:\s*\{[\s\S]*?name:\s*'([^']+)'/),
        kind: extractString(resource.body, /kind:\s*'([^']+)'/),
        accessTier: extractString(resource.body, /accessTier:\s*'([^']+)'/)
      }

      const httpsOnly = extractBoolean(resource.body, 'supportsHttpsTrafficOnly')
      const enableBlobPublicAccess = extractBoolean(resource.body, 'allowBlobPublicAccess')
      if (httpsOnly !== undefined) config.httpsOnly = httpsOnly
      if (enableBlobPublicAccess !== undefined) config.enableBlobPublicAccess = enableBlobPublicAccess

      if (config.name) components.push(toComponent('StorageAccount', config))
      return
    }

    if (resource.resourceType.startsWith('Microsoft.Web/serverfarms@')) {
      const config = {
        name: extractString(resource.body, /name:\s*'([^']+)'/),
        sku: extractString(resource.body, /sku:\s*\{[\s\S]*?name:\s*'([^']+)'/),
        os: extractString(resource.body, /kind:\s*'([^']+)'/) === 'linux' ? 'Linux' : 'Windows'
      }

      const perSiteScaling = extractBoolean(resource.body, 'perSiteScaling')
      if (perSiteScaling !== undefined) config.perSiteScaling = perSiteScaling

      if (config.name) components.push(toComponent('AppServicePlan', config))
      return
    }

    if (resource.resourceType.startsWith('Microsoft.Web/sites@')) {
      const kind = extractString(resource.body, /kind:\s*'([^']+)'/)
      if (kind.includes('functionapp')) {
        return
      }

      const config = {
        name: extractString(resource.body, /name:\s*'([^']+)'/),
        kind: kind || 'app'
      }

      const serverFarmSymbol = extractString(resource.body, /serverFarmId:\s*([a-zA-Z0-9_]+)\.id/)
      if (serverFarmSymbol) {
        config.appServicePlan = symbolToName.get(serverFarmSymbol) || ''
      }

      const minTlsVersion = extractString(resource.body, /minTlsVersion:\s*'([^']+)'/)
      const ftpsState = extractString(resource.body, /ftpsState:\s*'([^']+)'/)
      if (minTlsVersion) config.minTlsVersion = minTlsVersion
      if (ftpsState) config.ftpsState = ftpsState

      const httpsOnly = extractBoolean(resource.body, 'httpsOnly')
      if (httpsOnly !== undefined) config.httpsOnly = httpsOnly

      const appSettings = parseObjectNameValueList(resource.body)
      if (appSettings.length > 0) config.appSettings = appSettings

      if (config.name) components.push(toComponent('AppService', config))
      return
    }

    if (resource.resourceType.startsWith('Microsoft.Sql/servers@')) {
      const config = {
        name: extractString(resource.body, /name:\s*'([^']+)'/),
        adminUsername: extractString(resource.body, /administratorLogin:\s*'([^']+)'/),
        adminPassword: extractString(resource.body, /administratorLoginPassword:\s*'([^']+)'/),
        version: extractString(resource.body, /version:\s*'([^']+)'/),
        minimalTlsVersion: extractString(resource.body, /minimalTlsVersion:\s*'([^']+)'/),
        publicNetworkAccess: extractString(resource.body, /publicNetworkAccess:\s*'([^']+)'/)
      }

      if (config.name) components.push(toComponent('SQLServer', config))
      return
    }

    if (resource.resourceType.startsWith('Microsoft.Sql/servers/databases@')) {
      const config = {
        name: extractString(resource.body, /name:\s*'([^']+)'/),
        sku: extractString(resource.body, /sku:\s*\{[\s\S]*?name:\s*'([^']+)'/),
        tier: extractString(resource.body, /tier:\s*'([^']+)'/),
        collation: extractString(resource.body, /collation:\s*'([^']+)'/),
        readScale: extractString(resource.body, /readScale:\s*'([^']+)'/)
      }

      const parentSymbol = extractString(resource.body, /parent:\s*([a-zA-Z0-9_]+)/)
      if (parentSymbol) {
        config.sqlServer = symbolToName.get(parentSymbol) || ''
      }

      const capacity = extractNumber(resource.body, 'capacity')
      const maxSizeBytes = extractNumber(resource.body, 'maxSizeBytes')
      const zoneRedundant = extractBoolean(resource.body, 'zoneRedundant')

      if (capacity !== undefined) config.capacity = capacity
      if (maxSizeBytes !== undefined) config.maxSizeBytes = maxSizeBytes
      if (zoneRedundant !== undefined) config.zoneRedundant = zoneRedundant

      if (config.name) components.push(toComponent('SQLDatabase', config))
      return
    }

    if (resource.resourceType.startsWith('Microsoft.App/containerApps@')) {
      const config = {
        name: extractString(resource.body, /name:\s*'([^']+)'/),
        containerImage: extractString(resource.body, /image:\s*'([^']+)'/),
        memory: extractString(resource.body, /memory:\s*'([^']+)'/)
      }

      const cpu = extractNumber(resource.body, 'cpu')
      const minReplicas = extractNumber(resource.body, 'minReplicas')
      const maxReplicas = extractNumber(resource.body, 'maxReplicas')
      const targetPort = extractNumber(resource.body, 'targetPort')
      const enableIngress = /ingress:\s*\{/.test(resource.body)

      if (cpu !== undefined) config.cpu = cpu
      if (minReplicas !== undefined) config.minReplicas = minReplicas
      if (maxReplicas !== undefined) config.maxReplicas = maxReplicas
      if (targetPort !== undefined) config.targetPort = targetPort
      config.enableIngress = enableIngress

      const environmentVariables = parseObjectNameValueList(resource.body)
      if (environmentVariables.length > 0) {
        config.environmentVariables = environmentVariables
      }

      if (config.name) components.push(toComponent('ContainerApp', config))
      return
    }

    if (resource.resourceType.startsWith('Microsoft.Insights/components@')) {
      const config = {
        name: extractString(resource.body, /name:\s*'([^']+)'/),
        publicNetworkAccessForIngestion: extractString(resource.body, /publicNetworkAccessForIngestion:\s*'([^']+)'/),
        publicNetworkAccessForQuery: extractString(resource.body, /publicNetworkAccessForQuery:\s*'([^']+)'/)
      }

      if (config.name) components.push(toComponent('MonitoringAlerts', config))
    }
  })

  if (!appName || !location) {
    throw new Error('No se pudo interpretar el Bicep. Verifica que provenga de InfraGen.')
  }

  return {
    appName,
    environment: environment || 'dev',
    location,
    resourceGroupName,
    components
  }
}
