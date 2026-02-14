import { describe, it, expect } from 'vitest'
import {
  sanitizeAppName,
  syncEnvironmentToken,
  buildResourceGroupName,
  gbToBytes,
  bytesToGb,
  hasRequiredBicepSections
} from '../src/utils/ruleValidators.js'

describe('ruleValidators', () => {
  it('sanitizes application names to lowercase alphanumerics', () => {
    expect(sanitizeAppName('My App-123!')).toBe('myapp123')
    expect(sanitizeAppName('   ')).toBe('')
  })

  it('builds resource group names including env token except in prod', () => {
    expect(buildResourceGroupName({ appName: 'MyApp', locationShort: 'eus', environment: 'dev' }))
      .toBe('rgeusmyappdev')
    expect(buildResourceGroupName({ appName: 'MyApp', locationShort: 'eus', environment: 'prod' }))
      .toBe('rgeusmyapp')
    expect(buildResourceGroupName({ appName: '', locationShort: 'eus', environment: 'dev' })).toBe('')
  })

  it('syncs environment tokens across names', () => {
    const base = 'rgmexmyapp-dev'
    expect(syncEnvironmentToken(base, 'dev', 'qa')).toBe('rgmexmyapp-qa')
    expect(syncEnvironmentToken('stamyappqa', 'qa', 'prod')).toBe('stamyapp')
    expect(syncEnvironmentToken('rgfoo', 'dev', 'prod')).toBe('rgfoo')
  })

  it('converts between GB and bytes safely', () => {
    expect(gbToBytes(2)).toBe(2 * 1024 * 1024 * 1024)
    expect(gbToBytes('5')).toBe(5 * 1024 * 1024 * 1024)
    expect(gbToBytes(0)).toBeNull()
    expect(bytesToGb(3 * 1024 * 1024 * 1024)).toBe(3)
    expect(bytesToGb(1572864)).toBeCloseTo(0.00146, 5)
    expect(bytesToGb(null)).toBeNull()
  })

  it('detects required Bicep sections', () => {
    const validBicep = `param appName string\nresource app 'Microsoft.Web/sites@2021-02-01' = {}`
    expect(hasRequiredBicepSections(validBicep)).toBe(true)
    expect(hasRequiredBicepSections('just some random text')).toBe(false)
  })
})
