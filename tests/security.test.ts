import { describe, it, expect, beforeEach } from 'vitest'
import {
  escapeHtml,
  isValidEmail,
  sanitizeText,
  sanitizeStringList,
  maskEmail,
  getClientIp,
  checkRateLimit,
  resetRateLimits,
  isSameOrigin,
} from '../lib/security'

describe('escapeHtml', () => {
  it('escapes the characters that break out of HTML context', () => {
    expect(escapeHtml('<script>alert(1)</script>')).toBe(
      '&lt;script&gt;alert(1)&lt;/script&gt;'
    )
    expect(escapeHtml(`" & '`)).toBe('&quot; &amp; &#39;')
  })

  it('neutralises an injected anchor tag', () => {
    expect(escapeHtml('<a href="//evil.tld">click</a>')).not.toContain('<a')
  })

  it('returns an empty string for null and undefined', () => {
    expect(escapeHtml(null)).toBe('')
    expect(escapeHtml(undefined)).toBe('')
  })

  it('leaves ordinary text untouched', () => {
    expect(escapeHtml('Plan B, 5 years')).toBe('Plan B, 5 years')
  })
})

describe('isValidEmail', () => {
  it('accepts ordinary addresses', () => {
    expect(isValidEmail('someone@example.com')).toBe(true)
    expect(isValidEmail('first.last+tag@sub.example.co.uk')).toBe(true)
    expect(isValidEmail('  spaced@example.com  ')).toBe(true)
  })

  it('rejects the HTML injection payload the old pattern allowed', () => {
    expect(isValidEmail('<a/href=//evil.tld>help@tranmer.ca</a>@x.y')).toBe(false)
    expect(isValidEmail('"><img src=x onerror=alert(1)>@example.com')).toBe(false)
  })

  it('rejects header injection attempts', () => {
    expect(isValidEmail('someone@example.com\nBcc: victim@example.com')).toBe(false)
    expect(isValidEmail('someone@example.com\r\nSubject: spam')).toBe(false)
  })

  it('rejects malformed addresses', () => {
    expect(isValidEmail('no-at-sign')).toBe(false)
    expect(isValidEmail('missing@tld')).toBe(false)
    expect(isValidEmail('@example.com')).toBe(false)
    expect(isValidEmail('two@@example.com')).toBe(false)
    expect(isValidEmail('')).toBe(false)
    expect(isValidEmail('   ')).toBe(false)
  })

  it('rejects non-strings and over-long values', () => {
    expect(isValidEmail(null)).toBe(false)
    expect(isValidEmail(42)).toBe(false)
    expect(isValidEmail({ toString: () => 'a@b.com' })).toBe(false)
    expect(isValidEmail(`${'a'.repeat(250)}@example.com`)).toBe(false)
  })
})

describe('sanitizeText', () => {
  it('trims and caps length', () => {
    expect(sanitizeText('  hello  ')).toBe('hello')
    expect(sanitizeText('abcdef', 3)).toBe('abc')
  })

  it('strips control characters used to forge log lines', () => {
    expect(sanitizeText('line\u0000one\u001Ftwo\u007F')).toBe('lineonetwo')
  })

  it('preserves ampersands and quotes for later escaping', () => {
    expect(sanitizeText(`Tom & Jerry's "plan"`)).toBe(`Tom & Jerry's "plan"`)
  })

  it('returns an empty string for non-strings', () => {
    expect(sanitizeText(undefined)).toBe('')
    expect(sanitizeText({ a: 1 })).toBe('')
  })
})

describe('sanitizeStringList', () => {
  it('keeps only strings and enforces the item cap', () => {
    const input = ['a', 2, null, 'b', 'c']
    expect(sanitizeStringList(input, { maxItems: 2 })).toEqual(['a', 'b'])
  })

  it('drops empty entries and caps item length', () => {
    expect(sanitizeStringList(['  ', 'abcdef'], { maxLength: 3 })).toEqual(['abc'])
  })

  it('returns an empty array for non-arrays', () => {
    expect(sanitizeStringList('not an array')).toEqual([])
    expect(sanitizeStringList(undefined)).toEqual([])
  })
})

describe('maskEmail', () => {
  it('masks the local part', () => {
    expect(maskEmail('someone@example.com')).toBe('som***@example.com')
  })

  it('handles values that are not emails', () => {
    expect(maskEmail('anonymous')).toBe('unknown')
    expect(maskEmail(null)).toBe('unknown')
  })
})

describe('getClientIp', () => {
  it('takes the first entry of x-forwarded-for', () => {
    const request = new Request('https://tranmer.ca/api/x', {
      headers: { 'x-forwarded-for': '203.0.113.5, 70.41.3.18' },
    })
    expect(getClientIp(request)).toBe('203.0.113.5')
  })

  it('falls back to x-real-ip and then to unknown', () => {
    const withReal = new Request('https://tranmer.ca/api/x', {
      headers: { 'x-real-ip': '198.51.100.7' },
    })
    expect(getClientIp(withReal)).toBe('198.51.100.7')
    expect(getClientIp(new Request('https://tranmer.ca/api/x'))).toBe('unknown')
  })
})

describe('checkRateLimit', () => {
  beforeEach(() => {
    resetRateLimits()
  })

  it('allows requests up to the limit and blocks the next one', () => {
    const options = { limit: 3, windowMs: 60_000 }
    expect(checkRateLimit('k', options).allowed).toBe(true)
    expect(checkRateLimit('k', options).allowed).toBe(true)
    expect(checkRateLimit('k', options).allowed).toBe(true)

    const blocked = checkRateLimit('k', options)
    expect(blocked.allowed).toBe(false)
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0)
  })

  it('tracks each key separately', () => {
    const options = { limit: 1, windowMs: 60_000 }
    expect(checkRateLimit('ip-a', options).allowed).toBe(true)
    expect(checkRateLimit('ip-a', options).allowed).toBe(false)
    expect(checkRateLimit('ip-b', options).allowed).toBe(true)
  })

  it('starts a fresh window once the old one expires', async () => {
    const options = { limit: 1, windowMs: 10 }
    expect(checkRateLimit('short', options).allowed).toBe(true)
    expect(checkRateLimit('short', options).allowed).toBe(false)
    await new Promise((resolve) => setTimeout(resolve, 20))
    expect(checkRateLimit('short', options).allowed).toBe(true)
  })
})

describe('isSameOrigin', () => {
  it('allows a matching origin', () => {
    const request = new Request('https://tranmer.ca/api/x', {
      method: 'POST',
      headers: { origin: 'https://tranmer.ca', host: 'tranmer.ca' },
    })
    expect(isSameOrigin(request)).toBe(true)
  })

  it('rejects a cross-site origin', () => {
    const request = new Request('https://tranmer.ca/api/x', {
      method: 'POST',
      headers: { origin: 'https://evil.tld', host: 'tranmer.ca' },
    })
    expect(isSameOrigin(request)).toBe(false)
  })

  it('rejects a malformed origin', () => {
    const request = new Request('https://tranmer.ca/api/x', {
      method: 'POST',
      headers: { origin: 'not a url', host: 'tranmer.ca' },
    })
    expect(isSameOrigin(request)).toBe(false)
  })

  it('allows a request with no origin header', () => {
    expect(isSameOrigin(new Request('https://tranmer.ca/api/x'))).toBe(true)
  })
})
