import { describe, it, expect } from 'vitest'
import { generateMain } from '../src/utils/bicepGenerator.js'

describe('bicepGenerator', () => {
  it('generates a mainBicep string and includes provided config name', () => {
    const components = [
      { type: 'StorageAccount', config: { name: 'stgdemo' } }
    ]

    const res = generateMain({ appName: 'demoapp', location: 'westus', components, parameters: { environment: 'dev' } })

    expect(res).toHaveProperty('mainBicep')
    expect(typeof res.mainBicep).toBe('string')
    expect(res.mainBicep).toContain('param appName')
    expect(res.mainBicep).toContain('stgdemo')
  })
})
