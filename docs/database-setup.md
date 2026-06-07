# Database Setup Guide

## Recommended Option: Neon PostgreSQL

1. Create a Neon project.
2. Create a database named `namdhari_swaich_sweets`.
3. Copy the PostgreSQL connection string.
4. Add `sslmode=require` if it is not already included.
5. Set it as `DATABASE_URL`.

## Alternative Option: Supabase PostgreSQL

1. Create a Supabase project.
2. Open Project Settings > Database.
3. Copy the connection string.
4. Set it as `DATABASE_URL`.
5. Use Supabase Storage later for logo or receipt upload storage.

## Local Commands

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

## Schema Notes

- Money fields use Prisma Decimal mapped to PostgreSQL decimal columns.
- Frequently searched fields have indexes: invoice number, names, phone, SKU, dates, status, payment mode, owner IDs, and audit timestamps.
- Operational deletes should use active/inactive or soft-delete fields where available.
- Ledger and audit records should not be hard-deleted in production.
