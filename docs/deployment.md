# Local Deployment Guide

NSS Professional Suite is designed to run on the local shop computer with its database stored on that same machine.

## 1. Install Requirements

- Node.js 24 or newer
- The NSS project folder

## 2. First-Time Setup

From the project folder:

```bash
npm install
npm run setup:local
```

This creates the local SQLite database at:

```text
data/nss-local.db
```

## 3. Run Locally

For day-to-day local use during setup:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

For a more production-like local server:

```bash
npm run build
npm run start
```

## 4. Verify

- Visit `/login`.
- Login with `owner@nss.local` and `Namdhari@123` after seeding.
- Confirm `/dashboard`, `/pos`, `/invoices`, `/inventory`, `/farmers`, `/employees`, `/reports`, and `/business-settings` load.
- Login with `agency@nss.local` to confirm `/admin` loads for super admin only.
- In Settings, add the business WhatsApp number before using invoice WhatsApp sharing.
- In Settings as super admin, add official invoice address, phone, registered number, and invoice assigned names.
- Add products for real menu departments as needed.
- Add suppliers, farmer profiles, inventory packaging, and employees.
- Download a PDF and CSV report.
- Change production passwords after first login.

## 5. Backup

Back up this file daily:

```text
data/nss-local.db
```

See `docs/backup-restore.md`.

## Optional Google Cloud Backup

Use `nswaichsweets@gmail.com` as the Google Cloud owner account, create a private Cloud Storage bucket, then add the Google Cloud backup variables to `.env`.

Run:

```bash
npm run backup:cloud
```

The Backup page also exposes a button for super admin/owner users after the bucket is configured.
