# Client backup downloads

Clients download their annual offsite backup from the client portal (`/web` → Current clients → "Your backups").
Files live in a **private Vercel Blob store in Montréal (yul1)**. The offline copies remain the master archive;
Blob is only the copy clients download.

## One-time setup

1. **Create the store.** Vercel → Storage → Create → Blob. Access: **Private**. Region: **Montréal, Canada (yul1)**.
   Connect it to the `tranmer-ca-new` project (Production and Preview). This adds `BLOB_READ_WRITE_TOKEN`.
2. **Block clients who shouldn't self-serve.** Set `BACKUP_DOWNLOAD_BLOCKED_CLIENT_IDS` in the project's environment
   variables to a comma-separated list of SB Tracker client ids. Start with the healthcare clients (CHAP / TGH HIV
   Clinic, RT Respiratory) until their data-handling agreements cover this. Blocked clients see a "we'll deliver it
   directly" message, and the upload script refuses them.
3. **Redeploy** so the new variables take effect.
4. Locally: `vercel env pull .env.local` to get `BLOB_READ_WRITE_TOKEN` and `DATABASE_URL` for the upload script.

## Uploading a backup

One file:

```bash
npm run backup:upload -- --client <SB Tracker client id> --file ~/Backups/2026/example-com.zip \
  --label "2026 annual backup" --date 2026-11-20 --keep 2
```

A batch, from a CSV manifest:

```bash
npm run backup:upload -- --manifest "~/Documents/Claude-Workspace/TWS Notes/backups-2026-manifest.csv" --keep 2 --dry-run
npm run backup:upload -- --manifest "~/Documents/Claude-Workspace/TWS Notes/backups-2026-manifest.csv" --keep 2
```

- The manifest needs a header row with `client_id` and `file`; `label` and `date` are optional, other
  columns (client_name, domains, notes) are ignored. Rows with an empty `file` are skipped, so you can fill
  it in gradually. Relative paths are resolved from the manifest's folder.
- Every row is checked before anything uploads: file exists, client id format, date format, blocked
  clients, and the same file on two rows. One bad row stops the whole batch with a list of problems.
- Re-running is safe. A file whose SHA-256 is already listed for that client is skipped, so after an
  interruption, run the same command again.
- `--dry-run` shows what would happen without uploading.
- `--keep 2` removes all but each client's two newest backups from Blob afterwards. Their rows stay, marked
  `deleted_at`, and the offline copies are untouched.
- Size and SHA-256 are recorded in `client_backups`, so a client's copy can be verified later.

## What happens on download

1. The client presses **Download**. The browser POSTs to `/api/client/backups/:id/download`.
2. The server checks the session, the per-client rate limit (10/hour), the blocked list, and that the backup
   belongs to the logged-in client (another client's id is just "not found").
3. The download is logged in `client_backup_downloads` (backup, client, email, IP, time).
4. The server returns a **signed URL valid for 15 minutes**, scoped to that one file and read-only. The browser
   downloads straight from Blob, so large files never pass through a function.
5. The client is emailed: "Your website backup was downloaded", so an unexpected download gets noticed.

## Useful queries

```sql
-- Who downloaded what, most recent first
SELECT d.created_at, d.email, b.client_id, b.label, b.filename
FROM client_backup_downloads d JOIN client_backups b ON b.id = d.backup_id
ORDER BY d.created_at DESC LIMIT 50;

-- Clients with a downloadable backup
SELECT client_id, COUNT(*), MAX(backup_date) FROM client_backups
WHERE deleted_at IS NULL GROUP BY client_id ORDER BY client_id;
```
