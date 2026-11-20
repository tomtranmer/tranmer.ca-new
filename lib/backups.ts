/**
 * Client backup downloads from a private Vercel Blob store.
 *
 * TWS uploads each client's annual backup with `npm run backup:upload`
 * (scripts/upload-backup.mjs), which stores the file in the private Blob
 * store and records it in `client_backups`. The client portal lists only the
 * logged-in client's rows, and a download hands out a signed URL for that one
 * file, valid for a few minutes. The browser downloads straight from Blob,
 * so large files never pass through a function.
 *
 * The offline copies stay the master archive; Blob is the download copy.
 */
import { issueSignedToken, presignUrl } from '@vercel/blob';
import { escapeHtml } from '@/lib/security';
import { query, initializeDatabase } from '@/lib/db';

/** How long a signed download link works. */
export const DOWNLOAD_LINK_TTL_MS = 15 * 60 * 1000;

export type ClientBackup = {
  id: number;
  clientId: string;
  pathname: string;
  filename: string;
  label: string;
  sizeBytes: number | null;
  /** ISO date (YYYY-MM-DD) the backup was taken. */
  backupDate: string | null;
};

/** What the browser is allowed to see: no pathname or client id. */
export type ClientBackupSummary = Pick<ClientBackup, 'id' | 'filename' | 'label' | 'sizeBytes' | 'backupDate'>;

export function isBackupStorageConfigured(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN || (!!process.env.VERCEL_OIDC_TOKEN && !!process.env.BLOB_STORE_ID);
}

/**
 * Clients whose backups are not offered for self-serve download, e.g.
 * healthcare clients whose backups may hold personal health information.
 * Comma-separated SB Tracker client ids in BACKUP_DOWNLOAD_BLOCKED_CLIENT_IDS.
 */
export function isBackupDownloadBlocked(clientId: string): boolean {
  return (process.env.BACKUP_DOWNLOAD_BLOCKED_CLIENT_IDS ?? '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)
    .includes(clientId);
}

function toIsoDate(value: unknown): string | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString().slice(0, 10);
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  return null;
}

function rowToBackup(row: Record<string, unknown>): ClientBackup {
  const size = row.size_bytes == null ? null : Number(row.size_bytes);
  return {
    id: Number(row.id),
    clientId: String(row.client_id),
    pathname: String(row.pathname),
    filename: String(row.filename),
    label: String(row.label ?? row.filename),
    sizeBytes: size != null && Number.isFinite(size) ? size : null,
    backupDate: toIsoDate(row.backup_date),
  };
}

export function toSummary(backup: ClientBackup): ClientBackupSummary {
  const { id, filename, label, sizeBytes, backupDate } = backup;
  return { id, filename, label, sizeBytes, backupDate };
}

/** The client's current (not removed) backups, newest first. */
export async function listBackupsForClient(clientId: string): Promise<ClientBackup[]> {
  await initializeDatabase();
  const result = await query(
    `SELECT id, client_id, pathname, filename, label, size_bytes, backup_date
       FROM client_backups
      WHERE client_id = $1 AND deleted_at IS NULL
      ORDER BY backup_date DESC NULLS LAST, id DESC`,
    [clientId]
  );
  return result.rows.map(rowToBackup);
}

/** One backup, only if it belongs to this client and hasn't been removed. */
export async function getBackupForClient(id: number, clientId: string): Promise<ClientBackup | null> {
  await initializeDatabase();
  const result = await query(
    `SELECT id, client_id, pathname, filename, label, size_bytes, backup_date
       FROM client_backups
      WHERE id = $1 AND client_id = $2 AND deleted_at IS NULL`,
    [id, clientId]
  );
  return result.rows[0] ? rowToBackup(result.rows[0]) : null;
}

export async function recordBackupDownload({
  backupId,
  clientId,
  email,
  ip,
}: {
  backupId: number;
  clientId: string;
  email: string;
  ip: string;
}): Promise<void> {
  await query(
    `INSERT INTO client_backup_downloads (backup_id, client_id, email, ip) VALUES ($1, $2, $3, $4)`,
    [backupId, clientId, email, ip]
  );
}

/**
 * A signed GET URL for one private blob. The token is scoped to this
 * pathname and read-only, and expires with the link.
 */
export async function createDownloadUrl(pathname: string, now = Date.now()): Promise<{ url: string; expiresAt: number }> {
  const validUntil = now + DOWNLOAD_LINK_TTL_MS;
  const token = await issueSignedToken({ pathname, operations: ['get'], validUntil });
  const { presignedUrl } = await presignUrl(token, {
    operation: 'get',
    pathname,
    access: 'private',
    validUntil,
    useCache: false,
  });
  return { url: presignedUrl, expiresAt: validUntil };
}

export function formatBytes(bytes: number | null): string {
  if (bytes == null || bytes < 0) return '';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${value >= 10 || unit === 0 ? Math.round(value) : value.toFixed(1)} ${units[unit]}`;
}

/** Sent to the client each time one of their backups is downloaded. */
export function renderDownloadNotice({
  backup,
  when,
}: {
  backup: ClientBackupSummary;
  when: Date;
}): { subject: string; html: string; text: string } {
  const whenText = when.toLocaleString('en-CA', {
    timeZone: 'America/Toronto',
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  const lines = [
    `Your backup "${backup.label}" was downloaded from the TWS client portal on ${whenText} (Eastern).`,
    'If this was you, there\'s nothing to do.',
    'If you didn\'t download it, reply to this email right away and we\'ll look into it.',
  ];
  const html = `<!DOCTYPE html><html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;line-height:1.5;color:#1e293b">
${lines.map((l) => `<p>${escapeHtml(l)}</p>`).join('\n')}
<p>Tranmer Web Services · <a href="mailto:help@tranmer.ca">help@tranmer.ca</a></p>
</body></html>`;
  return {
    subject: 'Your website backup was downloaded',
    html,
    text: `${lines.join('\n\n')}\n\nTranmer Web Services · help@tranmer.ca`,
  };
}
