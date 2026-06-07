# Namdhari Swaich Sweets Business Suite

Professional local business management PWA for Namdhari Swaich Sweets. It covers invoices, POS, inventory, employees, salaries, farmer milk collection, ledgers, supplier/customer/farmer payments, expenses, profit reporting, exports, audit logs, and owner-editable business settings.

This build is local-first: the database is stored directly on the computer where the app is installed.

## Tech Stack

- Next.js App Router with TypeScript strict mode
- Tailwind CSS and reusable UI components
- Prisma ORM with SQLite
- Local database file at `data/nss-local.db`
- Optional Google Cloud Storage backup for the local database and uploads
- Signed HTTP-only cookie authentication with role-based permissions
- Optional Gmail login through Google OAuth for active users
- PDF and CSV exports for reports
- PWA manifest and service worker

## Quick Start On Client Laptop

```bash
npm install
npm run setup:local
npm run dev
```

Open:

```text
http://localhost:3000
```

For a production-style local server:

```bash
npm run build
npm run start
```

## Local Database

Live business data is stored here:

```text
data/nss-local.db
```

No Neon, Supabase, MongoDB, or separate database server is required.

Back up `data/nss-local.db` daily. If local uploads are used, also back up:

```text
public/uploads/
```

Optional cloud backup is available through Google Cloud Storage. The intended Google Cloud owner account is:

```text
nswaichsweets@gmail.com
```

After the Google Cloud bucket and service account are configured in `.env`, run:

```bash
npm run backup:cloud
```

Super admin/owner users can also run the same backup from `/backup`.

## Seeded Login Users

Initial password for all seeded users:

```text
Namdhari@123
```

Seeded users:

- `agency@nss.local`
- `owner@nss.local`
- `manager@nss.local`
- `cashier@nss.local`
- `inventory@nss.local`
- `accountant@nss.local`
- `viewer@nss.local`

Change passwords after first login.

## Modules

- Authentication, protected routes, user roles, and permissions
- Optional Gmail login, forgot-password reset links, and super-admin user access controls
- Super-admin controlled business settings for invoice number, address, registered number, WhatsApp, invoice assignment names, logo URL, and branch fields
- Dashboard summary queries for sales, expenses, profit, dues, milk, salary, stock alerts, and quick actions
- Product catalogue with menu categories for sweets, fast food, packed items, drinks, cakes, ice cream, dairy products, namkeen/snacks, bakery, and festival specials
- Invoice system with menu category filtering, item-code lookup, customer dues, WhatsApp sharing, payment status, PDF route, exports, and ledger integration
- POS counter order screen with item-code lookup, menu buttons, assigned-by stamping, invoice creation, and receipt printing
- Customer, farmer, and supplier ledgers
- Supplier contact database with contact person, alternate phone, WhatsApp, supply categories, payment terms, bank/UPI details, and `/suppliers/ledger`
- Raw material, finished product, packaging, napkins, sweet boxes, disposables, and shop-supply inventory
- Farmer profile placeholders plus daily morning/evening milk collection and raw milk stock-in hook
- Employee profiles with compulsory Aadhaar card number, attendance, and salary payment schema
- Expenses, payments, profit/loss reporting, and cash closing report definitions
- Reports catalogue with PDF and CSV export endpoints
- Audit logs and report export logs
- Local and Google Cloud backup/export documentation

## Local Production Notes

- `npm run setup:local` creates `.env`, `data/`, `public/uploads/`, local SQLite tables, users, roles, and permissions.
- `AUTH_SECRET` is generated into `.env` during setup if missing.
- `DATABASE_URL` defaults to `file:../data/nss-local.db`.
- Google Cloud backups need `GOOGLE_CLOUD_STORAGE_BUCKET`, `GOOGLE_CLOUD_CLIENT_EMAIL`, and `GOOGLE_CLOUD_PRIVATE_KEY`.
- Set business WhatsApp, official phone/address/registered number, and invoice assigned names from Settings.
- Run `npm run db:reset-business-data` only when intentionally clearing products, invoices, ledgers, inventory, customers, farmers, suppliers, employees, expenses, payments, reports, and audit logs while keeping users, roles, and permissions.
- Keep `data/nss-local.db` out of Git and copy it for backups.

## Commands

```bash
npm run setup:local
npm run dev
npm run build
npm run start
npm run typecheck
npm run db:generate
npm run db:push
npm run db:seed
npm run db:reset-business-data
npm run backup:cloud
```

## Documentation

- [Local deployment guide](docs/deployment.md)
- [Local database setup guide](docs/database-setup.md)
- [Backup and restore notes](docs/backup-restore.md)
- [Google Cloud backup setup](docs/google-cloud-backup.md)
- [Performance notes](docs/performance.md)
- [Internal checklist](docs/internal-checklist.md)
