#!/usr/bin/env node
/**
 * Upload a client's backup to the private Vercel Blob store and list it in
 * their tranmer.ca client portal.
 *
 *   npm run backup:upload -- --client <SB Tracker client id> --file <path> \
 *     [--label "2026 annual backup"] [--date 2026-11-20] [--keep 2] [--dry-run]
 *
 * Needs BLOB_READ_WRITE_TOKEN (the private store's token) and DATABASE_URL,
 * e.g. from `vercel env pull .env.local`. The npm script loads .env.local.
 *
 * --keep N  After uploading, remove all but the client's N newest backups
 *           from Blob (their rows are kept, marked deleted_at). The offline
 *           copies are the master archive, so nothing is lost.
 *
 * Refuses clients listed in BACKUP_DOWNLOAD_BLOCKED_CLIENT_IDS.
 */
import { createHash, randomBytes } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { basename } from 'node:path';
import { parseArgs } from 'node:util';
import { del, put } from '@vercel/blob';
import pg from 'pg';

const { values: args } = parseArgs({
  options: {
    client: { type: 'string' },
    file: { type: 'string' },
    label: { type: 'string' },
    date: { type: 'string' },
    keep: { type: 'string' },
    'dry-run': { type: 'boolean', default: false },
  },
});

function fail(message) {
  console.error(`Error: ${message}`);
  process.exit(1);
}

const clientId = args.client?.trim();
if (!clientId || !/^[A-Za-z0-9_-]{1,100}$/.test(clientId)) fail('--client <SB Tracker client id> is required');
if (!args.file) fail('--file <path> is required');

const blocked = (process.env.BACKUP_DOWNLOAD_BLOCKED_CLIENT_IDS ?? '').split(',').map((s) => s.trim());
if (blocked.includes(clientId)) {
  fail(`client ${clientId} is in BACKUP_DOWNLOAD_BLOCKED_CLIENT_IDS; deliver their backup another way`);
}

const backupDate = args.date ?? new Date().toISOString().slice(0, 10);
if (!/^\d{4}-\d{2}-\d{2}$/.test(backupDate)) fail('--date must be YYYY-MM-DD');
const keep = args.keep === undefined ? null : Number.parseInt(args.keep, 10);
if (keep !== null && (!Number.isInteger(keep) || keep < 1)) fail('--keep must be a whole number of 1 or more');

const info = await stat(args.file).catch(() => null);
if (!info?.isFile()) fail(`not a file: ${args.file}`);

const filename = basename(args.file);
const safeName = filename.replace(/[^A-Za-z0-9._-]/g, '-');
const label = args.label?.trim() || `${backupDate.slice(0, 4)} annual backup`;
// Random part keeps pathnames unguessable even though the store is private.
const pathname = `backups/${clientId}/${backupDate}-${randomBytes(6).toString('hex')}-${safeName}`;

console.log('Hashing file…');
const sha256 = await new Promise((resolve, reject) => {
  const hash = createHash('sha256');
  createReadStream(args.file).on('data', (c) => hash.update(c)).on('end', () => resolve(hash.digest('hex'))).on('error', reject);
});

console.log({ clientId, file: args.file, sizeBytes: info.size, sha256, pathname, label, backupDate, keep });
if (args['dry-run']) {
  console.log('Dry run: nothing uploaded.');
  process.exit(0);
}

if (!process.env.BLOB_READ_WRITE_TOKEN) fail('BLOB_READ_WRITE_TOKEN is not set');
if (!process.env.DATABASE_URL) fail('DATABASE_URL is not set');

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL) ? false : { rejectUnauthorized: true },
});

try {
  // Same definition as lib/db.ts, so the script works before the portal has created it.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS client_backups (
      id SERIAL PRIMARY KEY,
      client_id VARCHAR(100) NOT NULL,
      pathname TEXT NOT NULL UNIQUE,
      filename VARCHAR(255) NOT NULL,
      label VARCHAR(255),
      size_bytes BIGINT,
      sha256 CHAR(64),
      backup_date DATE,
      deleted_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log('Uploading to private Blob store…');
  let lastPct = -1;
  await put(pathname, createReadStream(args.file), {
    access: 'private',
    multipart: true,
    addRandomSuffix: false,
    contentType: 'application/octet-stream',
    onUploadProgress: ({ percentage }) => {
      const pct = Math.floor(percentage / 10) * 10;
      if (pct !== lastPct) {
        lastPct = pct;
        process.stdout.write(`${pct}% `);
      }
    },
  });
  process.stdout.write('\n');

  const { rows } = await pool.query(
    `INSERT INTO client_backups (client_id, pathname, filename, label, size_bytes, sha256, backup_date)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
    [clientId, pathname, filename, label, info.size, sha256, backupDate]
  );
  console.log(`Uploaded. Backup #${rows[0].id} is now listed in client ${clientId}'s portal.`);

  if (keep !== null) {
    const { rows: old } = await pool.query(
      `SELECT id, pathname FROM client_backups
        WHERE client_id = $1 AND deleted_at IS NULL
        ORDER BY backup_date DESC NULLS LAST, id DESC
        OFFSET $2`,
      [clientId, keep]
    );
    for (const row of old) {
      await del(row.pathname);
      await pool.query(`UPDATE client_backups SET deleted_at = NOW() WHERE id = $1`, [row.id]);
      console.log(`Removed older backup #${row.id} from Blob (still on offline storage).`);
    }
  }
} finally {
  await pool.end();
}
