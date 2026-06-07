# Local Database Setup

NSS Professional Suite now runs on a local SQLite database file. No Neon, Supabase, MongoDB, or separate database server is required for the shop computer.

## Where Data Is Stored

```text
data/nss-local.db
```

Keep this file safe. It contains the live business data for invoices, products, ledgers, inventory, farmers, suppliers, employees, payments, reports, users, and settings.

## First-Time Setup

Run:

```bash
npm install
npm run setup:local
npm run dev
```

`setup:local` creates:

- `.env`
- `data/`
- `public/uploads/`
- the SQLite database schema
- seeded login users and permissions

## Useful Commands

```bash
npm run db:generate
npm run db:push
npm run db:seed
npm run db:reset-business-data
```

Use `db:reset-business-data` only when intentionally clearing business records while keeping users, roles, and permissions.

## Schema Notes

- Money fields use Prisma Decimal on SQLite.
- Status, role, type, and unit values are stored as strings and typed in TypeScript.
- Frequently searched fields still have indexes for invoice number, names, phone, SKU, dates, status, owner IDs, and audit timestamps.
