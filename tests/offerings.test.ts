import { describe, it, expect } from 'vitest'
import { annualTotalFor, buildSprint, formatAddonPrice, formatPrice, freeTierId, getLayer, includedAddonIds, includedNote, layers, layersTopDown, premiumRank, totalFor } from '../lib/offerings'

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

  it('includes Malware Assurance free with hosted, supported plans over $100/month', () => {
    // $25 + $50 + $100 = $175 with paid support
    expect(includedAddonIds({ build: 'build-starter', support: 'support-minimal', infra: 'infra-billboard' })).toContain('addon-malware')
    // $75 + $50 = $125
    expect(includedAddonIds({ build: 'build-none', support: 'support-minimal', infra: 'infra-app' })).toEqual(['addon-malware'])
    // $25 + $50 = $75: not above $100
    expect(includedAddonIds({ build: 'build-none', support: 'support-minimal', infra: 'infra-billboard' })).toEqual([])
    // Over $100 but self-managed (no support)
    expect(includedAddonIds({ build: 'build-active', support: 'support-none', infra: 'infra-app' })).not.toContain('addon-malware')
    // The sprint counts toward the monthly total
    expect(includedAddonIds({ build: 'build-none', support: 'support-minimal', infra: 'infra-billboard' }, { sprint: true })).toContain('addon-malware')
  })

  it('includes Resend and Neon free with any active build plan', () => {
    const plan = { support: 'support-none', infra: 'infra-billboard' }
    expect(includedAddonIds({ ...plan, build: 'build-none' })).toEqual([])
    for (const build of ['build-starter', 'build-maintenance', 'build-active']) {
      expect(includedAddonIds({ ...plan, build })).toEqual(['addon-email-sending', 'addon-database'])
    }
    expect(includedAddonIds({ ...plan, build: 'build-none' }, { sprint: true })).toEqual(['addon-email-sending', 'addon-database'])
  })

  it('describes when add-ons are free', () => {
    expect(includedNote('activeBuild')).toBe('Free with any active build plan')
    expect(includedNote({ hostedSupportedAbove: 100 })).toBe('Free with plans over $100/mo that include hosting and support')
  })

  it('charges Malware Assurance at $100/yr otherwise', () => {
    expect(annualTotalFor(['addon-malware'])).toBe(100)
  })
})

describe('freeTierId', () => {
  it('returns the $0 tier for support and build', () => {
    expect(freeTierId('support')).toBe('support-none')
    expect(freeTierId('build')).toBe('build-none')
  })
})
