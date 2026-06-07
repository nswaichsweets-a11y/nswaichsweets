# Google Cloud Backup Setup

Use this for optional off-computer backups of the local NSS database and uploads.

## Google Account

Use this Google Cloud owner account:

```text
nswaichsweets@gmail.com
```

The app cannot use a normal Gmail password. Google Cloud Storage requires a bucket plus a service account key.

## Create Google Cloud Storage

1. Sign in to Google Cloud Console with `nswaichsweets@gmail.com`.
2. Create or select a project for Namdhari Swaich Sweets.
3. Enable Cloud Storage for the project.
4. Create a private bucket, for example:

```text
nss-local-backups
```

5. Create a service account for backups.
6. Give that service account permission to write to the bucket. `Storage Object Admin` is enough for backup upload and future restore downloads.
7. Create a JSON key for the service account.

## Add Values To `.env`

Copy these values from the Google Cloud project and service-account JSON key:

```env
GOOGLE_CLOUD_OWNER_EMAIL="nswaichsweets@gmail.com"
GOOGLE_CLOUD_PROJECT_ID="your-google-cloud-project-id"
GOOGLE_CLOUD_STORAGE_BUCKET="nss-local-backups"
GOOGLE_CLOUD_CLIENT_EMAIL="service-account-name@your-project-id.iam.gserviceaccount.com"
GOOGLE_CLOUD_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nPASTE_KEY_HERE\n-----END PRIVATE KEY-----\n"
GOOGLE_CLOUD_BACKUP_PREFIX="nss-backups"
```

Keep the private key secret. Do not upload `.env` to GitHub or send it in chat.

## Run Backup

From the app:

```text
/backup
```

From the terminal:

```bash
npm run backup:cloud
```

Each run uploads to a dated path like:

```text
nss-backups/2026-06-07/2026-06-07T10-55-00-000Z/database/nss-local.db
```

## Restore From Cloud

1. Stop the app.
2. Download the required `database/nss-local.db` from Google Cloud Storage.
3. Replace the local `data/nss-local.db`.
4. Start the app.
5. Check dashboard, invoices, products, and reports.
