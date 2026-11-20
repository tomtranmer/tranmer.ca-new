import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { resetRateLimits } from '../lib/security'

const mocks = vi.hoisted(() => ({
  session: null as null | { email: string; clientId: string; exp: number },
  query: vi.fn(),
  initializeDatabase: vi.fn(),
  sendEmail: vi.fn(),
  issueSignedToken: vi.fn(),
  presignUrl: vi.fn(),
}))

vi.mock('../lib/clientSession', () => ({ getClientSession: async () => mocks.session }))
vi.mock('../lib/db', () => ({ query: mocks.query, initializeDatabase: mocks.initializeDatabase }))
vi.mock('../lib/mail', () => ({ isMailConfigured: () => true, sendEmail: mocks.sendEmail }))
vi.mock('@vercel/blob', () => ({ issueSignedToken: mocks.issueSignedToken, presignUrl: mocks.presignUrl }))

import {
  DOWNLOAD_LINK_TTL_MS,
  createDownloadUrl,
  formatBytes,
  isBackupDownloadBlocked,
  listBackupsForClient,
  renderDownloadNotice,
} from '../lib/backups'

const backupRow = {
  id: 5,
  client_id: '42',
  pathname: 'backups/42/2026-11-20-abc123-site.zip',
  filename: 'site.zip',
  label: '2026 annual backup',
  size_bytes: '1610612736',
  backup_date: new Date('2026-11-20T00:00:00Z'),
}

const ENV_KEYS = ['BLOB_READ_WRITE_TOKEN', 'BACKUP_DOWNLOAD_BLOCKED_CLIENT_IDS'] as const
const savedEnv = Object.fromEntries(ENV_KEYS.map((k) => [k, process.env[k]]))

beforeEach(() => {
  resetRateLimits()
  process.env.BLOB_READ_WRITE_TOKEN = 'vercel_blob_rw_test'
  delete process.env.BACKUP_DOWNLOAD_BLOCKED_CLIENT_IDS
  mocks.session = { email: 'owner@example.com', clientId: '42', exp: 0 }
  mocks.initializeDatabase.mockResolvedValue(undefined)
  mocks.sendEmail.mockResolvedValue({ provider: 'resend', id: 'x' })
  mocks.issueSignedToken.mockResolvedValue({ delegationToken: 'd', clientSigningToken: 'c', validUntil: 0 })
  mocks.presignUrl.mockResolvedValue({ presignedUrl: 'https://store.private.blob.vercel-storage.com/signed' })
})

afterEach(() => {
  vi.clearAllMocks()
  for (const k of ENV_KEYS) {
    if (savedEnv[k] === undefined) delete process.env[k]
    else process.env[k] = savedEnv[k]
  }
})

describe('backup helpers', () => {
  it('formats sizes', () => {
    expect(formatBytes(null)).toBe('')
    expect(formatBytes(512)).toBe('512 B')
    expect(formatBytes(1536)).toBe('1.5 KB')
    expect(formatBytes(1610612736)).toBe('1.5 GB')
    expect(formatBytes(250 * 1024 * 1024)).toBe('250 MB')
  })

  it('reads the blocked list', () => {
    process.env.BACKUP_DOWNLOAD_BLOCKED_CLIENT_IDS = ' 7, 42 ,'
    expect(isBackupDownloadBlocked('42')).toBe(true)
    expect(isBackupDownloadBlocked('4')).toBe(false)
  })

  it('maps database rows, scoped to the client', async () => {
    mocks.query.mockResolvedValue({ rows: [backupRow] })
    const [backup] = await listBackupsForClient('42')
    expect(backup).toEqual({
      id: 5,
      clientId: '42',
      pathname: backupRow.pathname,
      filename: 'site.zip',
      label: '2026 annual backup',
      sizeBytes: 1610612736,
      backupDate: '2026-11-20',
    })
    expect(mocks.query.mock.calls[0][1]).toEqual(['42'])
    expect(mocks.query.mock.calls[0][0]).toContain('deleted_at IS NULL')
  })

  it('signs a read-only, path-scoped, short-lived private URL', async () => {
    const now = 1_800_000_000_000
    const result = await createDownloadUrl(backupRow.pathname, now)
    expect(mocks.issueSignedToken).toHaveBeenCalledWith({
      pathname: backupRow.pathname,
      operations: ['get'],
      validUntil: now + DOWNLOAD_LINK_TTL_MS,
    })
    expect(mocks.presignUrl.mock.calls[0][1]).toMatchObject({
      operation: 'get',
      pathname: backupRow.pathname,
      access: 'private',
    })
    expect(result).toEqual({ url: 'https://store.private.blob.vercel-storage.com/signed', expiresAt: now + DOWNLOAD_LINK_TTL_MS })
  })

  it('escapes the label in the download notice', () => {
    const notice = renderDownloadNotice({
      backup: { id: 1, filename: 'x.zip', label: '<b>evil</b>', sizeBytes: null, backupDate: null },
      when: new Date('2026-11-20T16:00:00Z'),
    })
    expect(notice.html).not.toContain('<b>evil')
    expect(notice.text).toContain('Nov 20, 2026')
  })
})

describe('POST /api/client/backups/[id]/download', () => {
  const download = async (id: string) => {
    const { POST } = await import('../app/api/client/backups/[id]/download/route')
    return POST(
      new NextRequest(`https://tranmer.ca/api/client/backups/${id}/download`, {
        method: 'POST',
        headers: { origin: 'https://tranmer.ca', host: 'tranmer.ca', 'x-forwarded-for': '203.0.113.9' },
      }),
      { params: Promise.resolve({ id }) }
    )
  }

  it('logs the download, returns a signed URL and emails the client', async () => {
    mocks.query.mockImplementation(async (sql: string) =>
      sql.startsWith('SELECT') ? { rows: [backupRow] } : { rows: [] }
    )
    const res = await download('5')
    expect(res.status).toBe(200)
    expect(res.headers.get('cache-control')).toBe('no-store')
    const body = await res.json()
    expect(body.url).toBe('https://store.private.blob.vercel-storage.com/signed')
    expect(body.filename).toBe('site.zip')

    const [selectSql, selectParams] = mocks.query.mock.calls[0]
    expect(selectSql).toContain('client_id = $2')
    expect(selectParams).toEqual([5, '42'])
    const insert = mocks.query.mock.calls.find((c) => String(c[0]).includes('client_backup_downloads'))!
    expect(insert[1]).toEqual([5, '42', 'owner@example.com', expect.any(String)])

    expect(mocks.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'owner@example.com', subject: 'Your website backup was downloaded' })
    )
  })

  it('needs a session', async () => {
    mocks.session = null
    expect((await download('5')).status).toBe(401)
    expect(mocks.presignUrl).not.toHaveBeenCalled()
  })

  it("treats another client's backup as not found and signs nothing", async () => {
    mocks.query.mockResolvedValue({ rows: [] })
    const res = await download('5')
    expect(res.status).toBe(404)
    expect(mocks.issueSignedToken).not.toHaveBeenCalled()
  })

  it('rejects malformed ids', async () => {
    for (const id of ['abc', '0', '-1', '5.5', '05']) {
      expect((await download(id)).status).toBe(404)
    }
    expect(mocks.query).not.toHaveBeenCalled()
  })

  it('refuses blocked clients', async () => {
    process.env.BACKUP_DOWNLOAD_BLOCKED_CLIENT_IDS = '42'
    const res = await download('5')
    expect(res.status).toBe(403)
    expect(mocks.query).not.toHaveBeenCalled()
  })

  it('answers 503 when the Blob store is not configured', async () => {
    delete process.env.BLOB_READ_WRITE_TOKEN
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect((await download('5')).status).toBe(503)
  })

  it('still returns the link if the notice email fails', async () => {
    mocks.query.mockImplementation(async (sql: string) =>
      sql.startsWith('SELECT') ? { rows: [backupRow] } : { rows: [] }
    )
    mocks.sendEmail.mockRejectedValue(new Error('mail down'))
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect((await download('5')).status).toBe(200)
  })

  it('rate limits repeated downloads', async () => {
    mocks.query.mockImplementation(async (sql: string) =>
      sql.startsWith('SELECT') ? { rows: [backupRow] } : { rows: [] }
    )
    for (let i = 0; i < 10; i++) expect((await download('5')).status).toBe(200)
    expect((await download('5')).status).toBe(429)
  })
})
