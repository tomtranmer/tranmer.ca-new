import { describe, it, expect } from 'vitest'
import { annualTotalFor, buildSprint, formatAddonPrice, formatPrice, getLayer, layers, layersTopDown, premiumRank, totalFor } from '../lib/offerings'

describe('offerings', () => {
  it('has three layers ordered build → support → infra from the top', () => {
    expect(layersTopDown.map((l) => l.id)).toEqual(['build', 'support', 'infra'])
  })

  it('uses unique tier ids', () => {
    const ids = layers.flatMap((l) => l.tiers.map((t) => t.id))
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('keeps four builder availability options', () => {
    expect(getLayer('build').tiers).toHaveLength(4)
  })

  it('prices infrastructure options at $25, $50 and $75/month', () => {
    expect(getLayer('infra').tiers.map((t) => t.price)).toEqual([25, 50, 75])
  })

  it('totals known prices and counts unpriced tiers', () => {
    expect(
      totalFor({ build: 'build-maintenance', support: 'support-minimal', infra: 'infra-app' }),
    ).toEqual({ known: 625, pending: 0 })
  })

  it('replaces the build tier with the sprint for the month', () => {
    expect(
      totalFor(
        { build: 'build-active', support: 'support-none', infra: 'infra-billboard' },
        { sprint: true },
      ),
    ).toEqual({ known: buildSprint.price + 25, pending: 0 })
  })

  it('ranks the cheapest tier 0 and the most capable 3', () => {
    const build = getLayer('build')
    expect(build.tiers.map((t) => premiumRank(build, t.id))).toEqual([0, 1, 2, 3])
    const infra = getLayer('infra')
    expect(infra.tiers.map((t) => premiumRank(infra, t.id))).toEqual([0, 2, 3])
  })

  it('formats prices', () => {
    expect(formatPrice({ price: 1000 })).toBe('$1,000')
    expect(formatPrice({ price: null, priceLabel: 'TBD' })).toBe('TBD')
    expect(formatPrice({ price: 0, priceLabel: 'Included' })).toBe('Included')
  })

  it('adds monthly add-ons to the monthly total and keeps annual ones separate', () => {
    const addonIds = ['addon-domain', 'addon-email-imap', 'addon-email-gmail']
    expect(
      totalFor({ build: 'build-none', support: 'support-none', infra: 'infra-billboard' }, { addonIds }),
    ).toEqual({ known: 25 + 5 + 12.5, pending: 0 })
    expect(annualTotalFor(addonIds)).toBe(30)
  })

  it('formats add-on prices with cents and billing period', () => {
    expect(formatAddonPrice({ id: 'x', name: 'x', tagline: '', price: 12.5, billing: 'monthly', unit: 'account' })).toBe('$12.50/mo per account')
    expect(formatAddonPrice({ id: 'y', name: 'y', tagline: '', price: 30, billing: 'annual' })).toBe('$30/yr')
  })
})
