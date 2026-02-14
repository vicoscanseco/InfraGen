const BYTES_PER_GB = 1024 * 1024 * 1024

const sanitizeAppName = (value) => {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '')
}

const escapeRegExp = (value) => {
  return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const syncEnvironmentToken = (value, oldEnv, newEnv) => {
  if (typeof value !== 'string' || !value) return value
  if (!oldEnv || !newEnv || oldEnv === newEnv) return value

  let updated = value
  const oldEscaped = escapeRegExp(oldEnv)
  const envSuffixWithDash = new RegExp(`-${oldEscaped}(?=-asp$|-ca$|-cae$|-ain$|$)`, 'gi')
  const envSuffixNoDash = new RegExp(`${oldEscaped}$`, 'gi')

  if (oldEnv !== 'prod' && newEnv !== 'prod') {
    updated = updated.replace(envSuffixWithDash, `-${newEnv}`)
    updated = updated.replace(envSuffixNoDash, newEnv)
    return updated
  }

  if (oldEnv !== 'prod' && newEnv === 'prod') {
    updated = updated.replace(envSuffixWithDash, '')
    updated = updated.replace(envSuffixNoDash, '')
    return updated
  }

  const hasDashedName = updated.includes('-')
  const hasKnownSuffix = /-(asp|ca|cae|ain)$/i.test(updated)
  const noDashConventions = /^(rg|sta|func|cog|log)[a-z0-9]+$/i.test(updated)

  if (hasKnownSuffix) {
    return updated.replace(/-(asp|ca|cae|ain)$/i, `-${newEnv}-$1`)
  }

  if (noDashConventions) {
    return `${updated}${newEnv}`
  }

  if (hasDashedName) {
    return `${updated}-${newEnv}`
  }

  return `${updated}${newEnv}`
}

const buildResourceGroupName = ({ appName, locationShort, environment }) => {
  if (!appName || !locationShort || !environment) return ''
  const cleanAppName = sanitizeAppName(appName)
  if (!cleanAppName) return ''

  const base = `rg${locationShort}${cleanAppName}`
  return environment === 'prod' ? base : `${base}${environment}`
}

const gbToBytes = (gb) => {
  if (gb === null || gb === undefined || gb === '') return null
  const numeric = Number(gb)
  if (!Number.isFinite(numeric) || numeric <= 0) return null
  return Math.round(numeric * BYTES_PER_GB)
}

const bytesToGb = (bytes) => {
  if (bytes === null || bytes === undefined || bytes === '') return null
  const numeric = Number(bytes)
  if (!Number.isFinite(numeric) || numeric <= 0) return null
  const result = numeric / BYTES_PER_GB
  return Number.isInteger(result) ? result : Number(result.toFixed(5))
}

const hasRequiredBicepSections = (bicepContent) => {
  const normalized = String(bicepContent || '')
  return /\bparam\b/i.test(normalized) && /Microsoft\.[A-Za-z]+\//.test(normalized)
}

export {
  sanitizeAppName,
  syncEnvironmentToken,
  buildResourceGroupName,
  gbToBytes,
  bytesToGb,
  hasRequiredBicepSections
}