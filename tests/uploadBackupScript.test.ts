import { describe, expect, it } from 'vitest'
import { MAX_COPY_BYTES, blobPathname, blockedClientIds, canCopyInBlob, jobsFromManifest, parseCsv, verifyClients } from '../scripts/upload-backup.mjs'

describe('parseCsv', () => {
  it('handles quotes, embedded commas, escaped quotes, CRLF and a BOM', () => {
    const text = '﻿client_id,file,notes\r\n20,"My Backups/a, b.zip","says ""hi"""\r\n\r\n91,x.zip,\n'
    expect(parseCsv(text)).toEqual([
      ['client_id', 'file', 'notes'],
      ['20', 'My Backups/a, b.zip', 'says "hi"'],
      ['91', 'x.zip', ''],
    ])
  })
})

describe('jobsFromManifest', () => {
  const opts = { manifestDir: '/Users/tom/Backups', today: '2026-11-20', blocked: ['73', '80'] }

  it('builds jobs, skips empty files and resolves relative paths', () => {
    const csv = [
      'client_id,client_name,domains,file,label,date,notes',
      '20,Tom Tranmer,tranmer.ca,test/tranmer.zip,,,',
      '91,Great Canadian Meat Co.,greatcanadianmeat.com,/Volumes/Archive/gcm.zip,2026 annual backup,2026-11-15,',
      '124,Galeforce Welding Inc.,galeforceweld.ca,,,,waiting on export',
    ].join('\n')
    const { jobs, skipped, errors } = jobsFromManifest(csv, opts)
    expect(errors).toEqual([])
    expect(skipped).toEqual(['line 4: Galeforce Welding Inc.: no file yet'])
    expect(jobs).toEqual([
      { line: 2, clientId: '20', who: 'Tom Tranmer', path: '/Users/tom/Backups/test/tranmer.zip', date: '2026-11-20', label: '2026 annual backup' },
      { line: 3, clientId: '91', who: 'Great Canadian Meat Co.', path: '/Volumes/Archive/gcm.zip', date: '2026-11-15', label: '2026 annual backup' },
    ])
  })

  it('reports every problem instead of stopping at the first', () => {
    const csv = [
      'client_id,client_name,file,date',
      '73,TGH HIV Clinic,hiv.zip,',
      'abc def,Bad,x.zip,',
      '91,GCM,gcm.zip,20261115',
      '92,Hewson,shared.zip,',
      '79,Hewson Acoustics,shared.zip,',
      '92,Hewson again,shared.zip,',
    ].join('\n')
    const { errors, jobs } = jobsFromManifest(csv, opts)
    expect(errors).toEqual([
      'line 2: TGH HIV Clinic (73) is in BACKUP_DOWNLOAD_BLOCKED_CLIENT_IDS',
      'line 3: invalid client_id "abc def"',
      'line 4: date must be YYYY-MM-DD, got "20261115"',
      'line 7: same file for the same client as line 5',
    ])
    // One shared file for two different clients is fine.
    expect(jobs.map((j: { clientId: string }) => j.clientId)).toEqual(['92', '79'])
  })

  it('needs client_id and file columns', () => {
    expect(jobsFromManifest('id,path\n1,a.zip', opts).errors).toEqual([
      'manifest needs a header row with client_id and file columns',
    ])
  })
})

describe('helpers', () => {
  it('builds unguessable, safe pathnames', () => {
    expect(blobPathname('91', '2026-11-20', 'GCM site (final).zip', 'abc123')).toBe(
      'backups/91/2026-11-20-abc123-GCM-site--final-.zip'
    )
  })

  it('reads the blocked list', () => {
    expect(blockedClientIds({ BACKUP_DOWNLOAD_BLOCKED_CLIENT_IDS: ' 73, 80 ,' })).toEqual(['73', '80'])
    expect(blockedClientIds({})).toEqual([])
  })
})

describe('verifyClients', () => {
  const fakeFetch = (table: Record<string, { status: number; body?: unknown }>): typeof fetch =>
    async (input: RequestInfo | URL) => {
      const url = input instanceof Request ? input.url : String(input)
      const id = decodeURIComponent(url.split('/').pop()!)
      const hit = table[id] ?? { status: 404 }
      return new Response(JSON.stringify(hit.body ?? {}), { status: hit.status })
    }

  it('accepts active TWS clients and explains the rest', async () => {
    const fetchImpl = fakeFetch({
      '91': { status: 200, body: { id: '91', name: 'Great Canadian Meat Co.', status: 'active' } },
      '87': { status: 200, body: { client: { id: '87', name: 'TEMP TEST', status: 'past_due' } } },
      '5': { status: 200, body: { id: '5', name: 'Old Client', status: 'canceled' } },
      '9': { status: 500 },
    })
    const { problems, names } = await verifyClients(['91', '87', '20', '5', '9', '91'], {
      baseUrl: 'https://sb.example', apiKey: 'k', fetchImpl,
    })
    expect(names).toEqual({ '91': 'Great Canadian Meat Co.', '87': 'TEMP TEST' })
    expect(problems).toEqual([
      "client 20: not a TWS client in SB Tracker (wrong id, or it belongs to another SB Tracker account), so the portal can't show it",
      "client 5 (Old Client): archived in SB Tracker, so it can't log in",
      'client 9: SB Tracker answered 500',
    ])
  })

  it('reports an unreachable SB Tracker instead of skipping the check', async () => {
    const { problems } = await verifyClients(['91'], {
      baseUrl: 'https://sb.example', apiKey: 'k', fetchImpl: async () => { throw new Error('ECONNREFUSED') },
    })
    expect(problems).toEqual(["client 91: couldn't reach SB Tracker (ECONNREFUSED)"])
  })
})

describe('canCopyInBlob', () => {
  it('copies up to 5 GiB and re-uploads anything bigger', () => {
    expect(MAX_COPY_BYTES).toBe(5368709120)
    expect(canCopyInBlob(5368709120)).toBe(true)
    expect(canCopyInBlob(5525265284)).toBe(false) // hewsonbros.ca.zip
    expect(canCopyInBlob(134124604)).toBe(true)
  })
})
