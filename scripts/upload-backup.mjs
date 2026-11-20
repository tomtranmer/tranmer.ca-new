#!/usr/bin/env node
/**
 * Upload client backups to the private Vercel Blob store and list them in
 * each client's tranmer.ca portal.
 *
 * One file:
 *   npm run backup:upload -- --client <SB Tracker client id> --file <path> \
 *     [--label "2026 annual backup"] [--date 2026-11-20] [--keep 2] [--dry-run]
 *
 * A batch from a CSV manifest:
 *   npm run backup:upload -- --manifest backups-2026.csv [--keep 2] [--dry-run]
 *
 *   The CSV needs a header row with at least `client_id` and `file`; `label`
 *   and `date` are optional and any other columns (client_name, domains,
 *   notes) are ignored. Rows with an empty `file` are skipped. Relative file
 *   paths are resolved from the manifest's folder.
 *
 *   Every row is checked before anything uploads (file exists, client id
 *   format, blocked list, the same file twice for one client). When
 *   SB_TRACKER_API_URL and SB_TRACKER_API_KEY are set, every client id is
 *   also checked against SB Tracker: it must be an active TWS client the
 *   portal can see. A batch is safe to re-run: a file whose SHA-256 is
 *   already listed for that client is skipped, so after an interruption just
 *   run the same command again.
 *
 *   The same file may be listed for several clients (e.g. two businesses on
 *   one multisite). It is uploaded once and copied inside Blob for the others.
 *
 * Needs BLOB_READ_WRITE_TOKEN (the private store's token) and DATABASE_URL,
 * e.g. from `vercel env pull .env.local`. The npm script loads .env.local.
 *
 * --keep N  After uploading, remove all but each client's N newest backups
 *           from Blob (their rows are kept, marked deleted_at). The offline
 *           copies are the master archive, so nothing is lost.
 *
 * Refuses clients listed in BACKUP_DOWNLOAD_BLOCKED_CLIENT_IDS.
 */
import { createHash, randomBytes } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import { basename, dirname, resolve } from 'node:path';
import { homedir } from 'node:os';
import { parseArgs } from 'node:util';
import { pathToFileURL } from 'node:url';

// ---------- Pure helpers (exported for tests) ----------

/** Minimal RFC 4180 CSV parser: quoted fields, escaped quotes, commas and newlines in quotes. */
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  const src = text.replace(/^﻿/, '');
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ',') {
      row.push(field);
      field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && src[i + 1] === '\n') i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else field += ch;
  }
  if (field !== '' || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((f) => f.trim() !== ''));
}

export const CLIENT_ID_PATTERN = /^[A-Za-z0-9_-]{1,100}$/;
export const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** @param {Record<string, string | undefined>} [env] */
export function blockedClientIds(env = process.env) {
  return (env.BACKUP_DOWNLOAD_BLOCKED_CLIENT_IDS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function expandHome(p) {
  return p === '~' || p.startsWith('~/') ? `${homedir()}${p.slice(1)}` : p;
}

/**
 * Turn manifest rows into upload jobs. Returns { jobs, skipped, errors };
 * errors are reported before anything uploads.
 * @param {string} text
 * @param {{ manifestDir: string, today: string, blocked?: string[] }} options
 */
export function jobsFromManifest(text, { manifestDir, today, blocked = [] }) {
  const rows = parseCsv(text);
  const errors = [];
  if (rows.length === 0) return { jobs: [], skipped: [], errors: ['manifest is empty'] };
  const header = rows[0].map((h) => h.trim().toLowerCase());
  const col = (name) => header.indexOf(name);
  if (col('client_id') < 0 || col('file') < 0) {
    return { jobs: [], skipped: [], errors: ['manifest needs a header row with client_id and file columns'] };
  }
  const jobs = [];
  const skipped = [];
  const seenFiles = new Map();
  rows.slice(1).forEach((r, i) => {
    const line = i + 2;
    const get = (name) => (col(name) >= 0 ? (r[col(name)] ?? '').trim() : '');
    const clientId = get('client_id');
    const file = get('file');
    const who = get('client_name') || `client ${clientId}`;
    if (!file) {
      skipped.push(`line ${line}: ${who}: no file yet`);
      return;
    }
    if (!CLIENT_ID_PATTERN.test(clientId)) {
      errors.push(`line ${line}: invalid client_id "${clientId}"`);
      return;
    }
    if (blocked.includes(clientId)) {
      errors.push(`line ${line}: ${who} (${clientId}) is in BACKUP_DOWNLOAD_BLOCKED_CLIENT_IDS`);
      return;
    }
    const date = get('date') || today;
    if (!DATE_PATTERN.test(date)) {
      errors.push(`line ${line}: date must be YYYY-MM-DD, got "${date}"`);
      return;
    }
    const path = resolve(manifestDir, expandHome(file));
    const key = `${clientId}\u0000${path}`;
    if (seenFiles.has(key)) {
      errors.push(`line ${line}: same file for the same client as line ${seenFiles.get(key)}`);
      return;
    }
    seenFiles.set(key, line);
    jobs.push({ line, clientId, who, path, date, label: get('label') || `${date.slice(0, 4)} annual backup` });
  });
  return { jobs, skipped, errors };
}

/**
 * Check client ids against SB Tracker's admin API, which only returns clients
 * of the main TWS account: the same ones the portal login can match. Returns
 * problems per id; an unreachable API is reported, not ignored.
 */
export async function verifyClients(ids, { baseUrl, apiKey, fetchImpl = fetch }) {
  const problems = [];
  const names = {};
  for (const id of [...new Set(ids)]) {
    let res;
    try {
      res = await fetchImpl(new URL(`/api/clients/${encodeURIComponent(id)}`, baseUrl), {
        headers: { Authorization: `Bearer ${apiKey}`, Accept: 'application/json' },
      });
    } catch (error) {
      problems.push(`client ${id}: couldn't reach SB Tracker (${error instanceof Error ? error.message : error})`);
      continue;
    }
    if (res.status === 404) {
      problems.push(`client ${id}: not a TWS client in SB Tracker (wrong id, or it belongs to another SB Tracker account), so the portal can't show it`);
      continue;
    }
    if (!res.ok) {
      problems.push(`client ${id}: SB Tracker answered ${res.status}`);
      continue;
    }
    const body = await res.json().catch(() => ({}));
    const client = body?.client ?? body;
    if (client?.status === 'canceled') {
      problems.push(`client ${id} (${client.name ?? '?'}): archived in SB Tracker, so it can't log in`);
      continue;
    }
    names[id] = client?.name ?? null;
  }
  return { problems, names };
}

export function blobPathname(clientId, date, filename, random = randomBytes(6).toString('hex')) {
  const safeName = filename.replace(/[^A-Za-z0-9._-]/g, '-');
  // The random part keeps pathnames unguessable even though the store is private.
  return `backups/${clientId}/${date}-${random}-${safeName}`;
}

// ---------- CLI ----------

function sha256File(path) {
  return new Promise((resolveHash, reject) => {
    const hash = createHash('sha256');
    createReadStream(path)
      .on('data', (c) => hash.update(c))
      .on('end', () => resolveHash(hash.digest('hex')))
      .on('error', reject);
  });
}

function formatSize(bytes) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let v = bytes;
  let u = 0;
  while (v >= 1024 && u < units.length - 1) {
    v /= 1024;
    u++;
  }
  return `${v >= 10 || u === 0 ? Math.round(v) : v.toFixed(1)} ${units[u]}`;
}

const CREATE_TABLE = `
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
  );`;

async function main() {
  const { values: args } = parseArgs({
    options: {
      client: { type: 'string' },
      file: { type: 'string' },
      manifest: { type: 'string' },
      label: { type: 'string' },
      date: { type: 'string' },
      keep: { type: 'string' },
      'dry-run': { type: 'boolean', default: false },
    },
  });

  const fail = (message) => {
    console.error(`Error: ${message}`);
    process.exit(1);
  };

  const today = new Date().toISOString().slice(0, 10);
  const blocked = blockedClientIds();
  const keep = args.keep === undefined ? null : Number.parseInt(args.keep, 10);
  if (keep !== null && (!Number.isInteger(keep) || keep < 1)) fail('--keep must be a whole number of 1 or more');

  // Build the job list from either --manifest or --client/--file.
  let jobs;
  if (args.manifest) {
    if (args.client || args.file) fail('use either --manifest or --client/--file, not both');
    const manifestPath = resolve(expandHome(args.manifest));
    const text = await readFile(manifestPath, 'utf8').catch(() => fail(`can't read manifest: ${manifestPath}`));
    const result = jobsFromManifest(text, { manifestDir: dirname(manifestPath), today, blocked });
    for (const s of result.skipped) console.log(`skip  ${s}`);
    if (result.errors.length) {
      for (const e of result.errors) console.error(`error ${e}`);
      fail(`${result.errors.length} problem(s) in the manifest; nothing was uploaded`);
    }
    jobs = result.jobs;
  } else {
    const clientId = args.client?.trim();
    if (!clientId || !CLIENT_ID_PATTERN.test(clientId)) fail('--client <SB Tracker client id> is required (or use --manifest)');
    if (!args.file) fail('--file <path> is required');
    if (blocked.includes(clientId)) {
      fail(`client ${clientId} is in BACKUP_DOWNLOAD_BLOCKED_CLIENT_IDS; deliver their backup another way`);
    }
    const date = args.date ?? today;
    if (!DATE_PATTERN.test(date)) fail('--date must be YYYY-MM-DD');
    jobs = [
      {
        line: null,
        clientId,
        who: `client ${clientId}`,
        path: resolve(expandHome(args.file)),
        date,
        label: args.label?.trim() || `${date.slice(0, 4)} annual backup`,
      },
    ];
  }
  if (jobs.length === 0) {
    console.log('Nothing to upload.');
    return;
  }

  // Check every file exists before any upload starts.
  const missing = [];
  for (const job of jobs) {
    const info = await stat(job.path).catch(() => null);
    if (!info?.isFile()) missing.push(`${job.line ? `line ${job.line}: ` : ''}not a file: ${job.path}`);
    else job.size = info.size;
  }
  if (missing.length) {
    for (const m of missing) console.error(`error ${m}`);
    fail(`${missing.length} file(s) not found; nothing was uploaded`);
  }

  // Check every client id is one the portal can actually see.
  if (process.env.SB_TRACKER_API_URL && process.env.SB_TRACKER_API_KEY) {
    const { problems } = await verifyClients(
      jobs.map((j) => j.clientId),
      { baseUrl: process.env.SB_TRACKER_API_URL, apiKey: process.env.SB_TRACKER_API_KEY }
    );
    if (problems.length) {
      for (const p of problems) console.error(`error ${p}`);
      fail(`${problems.length} client id problem(s); nothing was uploaded`);
    }
    console.log('All client ids checked against SB Tracker.');
  } else {
    console.warn('Warning: SB_TRACKER_API_URL / SB_TRACKER_API_KEY not set, so client ids were not checked against SB Tracker.');
  }

  const total = jobs.reduce((n, j) => n + j.size, 0);
  console.log(`\n${jobs.length} backup(s), ${formatSize(total)} in total:`);
  for (const j of jobs) console.log(`  ${j.who} (${j.clientId}): ${basename(j.path)}, ${formatSize(j.size)}, "${j.label}", ${j.date}`);

  if (args['dry-run']) {
    console.log('\nDry run: every row checks out. Nothing uploaded.');
    return;
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) fail('BLOB_READ_WRITE_TOKEN is not set');
  if (!process.env.DATABASE_URL) fail('DATABASE_URL is not set');

  const [{ copy, del, put }, { default: pg }] = await Promise.all([import('@vercel/blob'), import('pg')]);
  // Pass the read-write token explicitly. Otherwise the SDK prefers OIDC when
  // VERCEL_OIDC_TOKEN and BLOB_STORE_ID are set, and the OIDC token from
  // `vercel env pull` is development-scoped, which the store refuses.
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL) ? false : { rejectUnauthorized: true },
  });

  const done = { uploaded: 0, alreadyThere: 0, failed: 0 };
  const touchedClients = new Set();
  try {
    await pool.query(CREATE_TABLE);

    for (const [i, job] of jobs.entries()) {
      const tag = `[${i + 1}/${jobs.length}] ${job.who}`;
      try {
        process.stdout.write(`${tag}: hashing… `);
        const sha256 = await sha256File(job.path);
        const existing = await pool.query(
          `SELECT id FROM client_backups WHERE client_id = $1 AND sha256 = $2 AND deleted_at IS NULL`,
          [job.clientId, sha256]
        );
        if (existing.rows.length) {
          console.log(`already uploaded (#${existing.rows[0].id}), skipping`);
          done.alreadyThere++;
          continue;
        }

        const filename = basename(job.path);
        const pathname = blobPathname(job.clientId, job.date, filename);

        // The same file already in Blob for another client: copy it there instead of uploading again.
        const shared = await pool.query(
          `SELECT pathname FROM client_backups WHERE sha256 = $1 AND deleted_at IS NULL ORDER BY id DESC LIMIT 1`,
          [sha256]
        );
        if (shared.rows.length) {
          await copy(shared.rows[0].pathname, pathname, { access: 'private', token: blobToken, addRandomSuffix: false });
          const { rows } = await pool.query(
            `INSERT INTO client_backups (client_id, pathname, filename, label, size_bytes, sha256, backup_date)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
            [job.clientId, pathname, filename, job.label, job.size, sha256, job.date]
          );
          console.log(`copied from an existing upload (#${rows[0].id})`);
          done.uploaded++;
          touchedClients.add(job.clientId);
          continue;
        }

        let lastPct = -1;
        await put(pathname, createReadStream(job.path), {
          access: 'private',
          token: blobToken,
          multipart: true,
          addRandomSuffix: false,
          contentType: 'application/octet-stream',
          onUploadProgress: ({ percentage }) => {
            const pct = Math.floor(percentage / 25) * 25;
            if (pct !== lastPct) {
              lastPct = pct;
              process.stdout.write(`${pct}% `);
            }
          },
        });
        const { rows } = await pool.query(
          `INSERT INTO client_backups (client_id, pathname, filename, label, size_bytes, sha256, backup_date)
           VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
          [job.clientId, pathname, filename, job.label, job.size, sha256, job.date]
        );
        console.log(`done (#${rows[0].id})`);
        done.uploaded++;
        touchedClients.add(job.clientId);
      } catch (error) {
        console.log('FAILED');
        console.error(`  ${error instanceof Error ? error.message : error}`);
        done.failed++;
      }
    }

    if (keep !== null) {
      for (const clientId of touchedClients) {
        const { rows: old } = await pool.query(
          `SELECT id, pathname FROM client_backups
            WHERE client_id = $1 AND deleted_at IS NULL
            ORDER BY backup_date DESC NULLS LAST, id DESC
            OFFSET $2`,
          [clientId, keep]
        );
        for (const row of old) {
          await del(row.pathname, { token: blobToken });
          await pool.query(`UPDATE client_backups SET deleted_at = NOW() WHERE id = $1`, [row.id]);
          console.log(`Removed older backup #${row.id} for client ${clientId} from Blob (still on offline storage).`);
        }
      }
    }
  } finally {
    await pool.end();
  }

  console.log(
    `\nUploaded ${done.uploaded}, already there ${done.alreadyThere}, failed ${done.failed}.` +
      (done.failed ? ' Fix the failures and run the same command again; finished rows are skipped.' : '')
  );
  if (done.failed) process.exit(1);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
