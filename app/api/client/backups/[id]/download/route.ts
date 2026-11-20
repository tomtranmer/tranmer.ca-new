import { NextRequest, NextResponse } from 'next/server';
import { getClientSession } from '@/lib/clientSession';
import {
  checkRateLimit,
  forbiddenOriginResponse,
  getClientIp,
  isSameOrigin,
  maskEmail,
  rateLimitResponse,
} from '@/lib/security';
import {
  createDownloadUrl,
  getBackupForClient,
  isBackupDownloadBlocked,
  isBackupStorageConfigured,
  recordBackupDownload,
  renderDownloadNotice,
  toSummary,
} from '@/lib/backups';
import { isMailConfigured, sendEmail } from '@/lib/mail';

const LIMIT = { limit: 10, windowMs: 60 * 60 * 1000 };
const UNAVAILABLE = 'Backup downloads aren’t available right now. Please email help@tranmer.ca.';

/**
 * Returns a short-lived signed URL for one of the logged-in client's backups.
 * POST rather than GET so link prefetchers and scanners can't mint URLs.
 */
export async function POST(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    if (!isSameOrigin(request)) return forbiddenOriginResponse();

    const session = await getClientSession();
    if (!session) {
      return NextResponse.json({ error: 'Your session has expired. Please log in again.' }, { status: 401 });
    }

    const limit = checkRateLimit(`backup-download:${session.clientId}`, LIMIT);
    if (!limit.allowed) return rateLimitResponse(limit.retryAfterSeconds);

    const { id: rawId } = await ctx.params;
    const id = Number.parseInt(rawId, 10);
    if (!Number.isSafeInteger(id) || id <= 0 || String(id) !== rawId) {
      return NextResponse.json({ error: 'Backup not found' }, { status: 404 });
    }

    if (isBackupDownloadBlocked(session.clientId)) {
      return NextResponse.json(
        { error: 'Backups for your account are delivered directly. Please email help@tranmer.ca.' },
        { status: 403 }
      );
    }
    if (!isBackupStorageConfigured()) {
      console.error('Backup storage is not configured');
      return NextResponse.json({ error: UNAVAILABLE }, { status: 503 });
    }

    // Ownership is part of the lookup: another client's id is simply "not found".
    const backup = await getBackupForClient(id, session.clientId);
    if (!backup) return NextResponse.json({ error: 'Backup not found' }, { status: 404 });

    // Log before handing out the link, so every issued URL is on record.
    await recordBackupDownload({
      backupId: backup.id,
      clientId: session.clientId,
      email: session.email,
      ip: getClientIp(request),
    });

    const { url, expiresAt } = await createDownloadUrl(backup.pathname);

    if (isMailConfigured()) {
      try {
        await sendEmail({
          tag: 'backup-download',
          to: session.email,
          replyTo: 'help@tranmer.ca',
          ...renderDownloadNotice({ backup: toSummary(backup), when: new Date() }),
        });
      } catch (error) {
        console.error('Backup download notice failed:', error instanceof Error ? error.message : 'Unknown error');
      }
    }

    console.log('[BACKUP DOWNLOAD]', { backupId: backup.id, clientId: session.clientId, email: maskEmail(session.email) });
    return NextResponse.json(
      { url, filename: backup.filename, expiresAt },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('Error creating backup download:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: UNAVAILABLE }, { status: 500 });
  }
}
