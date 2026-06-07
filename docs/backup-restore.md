# Backup and Restore Notes

## What To Backup

The most important file is:

```text
data/nss-local.db
```

Also back up local uploaded files if upload features are used:

```text
public/uploads/
```

## Recommended Backup Routine

- Copy `data/nss-local.db` to an external drive daily.
- Run `npm run backup:cloud` daily after Google Cloud Storage is configured.
- Keep one weekly backup in a separate folder.
- Before any major update, close the app and copy the database file.
- Do not edit the `.db` file manually.

## Restore

1. Stop the app.
2. Replace `data/nss-local.db` with the backed-up copy.
3. Start the app again.
4. Login and check dashboard, invoices, products, and reports.

The app also exposes PDF and CSV exports for operational records, but those exports do not replace the database backup.

## Google Cloud Storage Backup

Cloud backup uploads these files into the configured Google Cloud Storage bucket:

- `data/nss-local.db`
- SQLite sidecar files if present, such as `nss-local.db-wal`
- Files under `public/uploads/`
- `manifest.json` with backup metadata

The intended Google Cloud owner account is:

```text
nswaichsweets@gmail.com
```

After setup, run cloud backup from the app at `/backup`, or from the terminal:

```bash
npm run backup:cloud
```

See `docs/google-cloud-backup.md` for the bucket and service-account setup.
