import { describe, it, expect } from 'vitest'
import { formatPrice, layers, layersTopDown, presets, totalFor } from '../lib/offerings'

describe('offerings', () => {
  it('has three layers ordered build → support → infra from the top', () => {
    expect(layersTopDown.map((l) => l.id)).toEqual(['build', 'support', 'infra'])
  })

  it('uses unique tier ids', () => {
    const ids = layers.flatMap((l) => l.tiers.map((t) => t.id))
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('totals known prices and counts unpriced tiers', () => {
    expect(
      totalFor({ build: 'build-maintenance', support: 'support-none', infra: 'infra-app' }),
    ).toEqual({ known: 500, pending: 1 })
  })

  it('formats prices', () => {
    expect(formatPrice({ price: 1000 })).toBe('$1,000')
    expect(formatPrice({ price: null, priceLabel: 'TBD' })).toBe('TBD')
    expect(formatPrice({ price: 0, priceLabel: 'Included' })).toBe('Included')
  })

  it('presets reference real tiers', () => {
    for (const p of presets) {
      for (const l of layers) {
        expect(l.tiers.some((t) => t.id === p.selection[l.id])).toBe(true)
      }
    }
  })
})
