import { describe, expect, it } from 'vitest'
import { blobPathname, blockedClientIds, jobsFromManifest, parseCsv } from '../scripts/upload-backup.mjs'

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
    ].join('\n')
    const { errors, jobs } = jobsFromManifest(csv, opts)
    expect(errors).toEqual([
      'line 2: TGH HIV Clinic (73) is in BACKUP_DOWNLOAD_BLOCKED_CLIENT_IDS',
      'line 3: invalid client_id "abc def"',
      'line 4: date must be YYYY-MM-DD, got "20261115"',
      'line 6: same file as line 5',
    ])
    expect(jobs).toHaveLength(1)
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
