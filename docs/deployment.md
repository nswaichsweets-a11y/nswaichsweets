# Deployment Guide

## 1. Create GitHub Repository

1. Commit this source code to a GitHub repository.
2. Keep `.env.local` out of Git.
3. Push the main branch to GitHub.

## 2. Create PostgreSQL Database

Use Neon PostgreSQL Free or Supabase Free for the first deployment. Copy the pooled or direct PostgreSQL connection string with SSL enabled.

## 3. Configure Vercel

1. Import the GitHub repository into Vercel.
2. Set framework preset to Next.js.
3. Add environment variables:

```bash
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB?sslmode=require
AUTH_SECRET=long-random-production-secret
NEXT_PUBLIC_APP_URL=https://your-domain.example
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=https://your-domain.example/api/auth/google/callback
```

4. Set build command:

```bash
npm run build
```

5. Deploy.

## 4. Initialize Database

For the first deployment with clean zero business data and seeded login users:

```bash
npm run db:push
npm run db:seed
```

If you need to do the first setup through Vercel only, temporarily set Vercel Build Command to:

```bash
npm run db:push && npm run db:seed && npm run build
```

If old sample data already exists and you want a clean zero-data business install, temporarily use:

```bash
npm run db:push && npm run db:reset-business-data && npm run db:seed && npm run build
```

After the reset/deploy succeeds, change the Vercel Build Command back to:

```bash
npm run build
```

For production with controlled schema history, replace `db:push` with Prisma migrations.

## 5. Custom Domain

When the final domain is ready:

1. Add the domain in the Vercel project domain settings.
2. Update the domain DNS records at the domain provider as Vercel instructs.
3. Set `NEXT_PUBLIC_APP_URL` to the final URL, for example:

```bash
NEXT_PUBLIC_APP_URL=https://your-domain.example
```

4. Redeploy after changing the environment variable.
5. If Gmail login is enabled, add the same callback URL in Google Cloud OAuth settings.
6. Confirm the custom domain opens `/login`, mobile install uses the NSS logo, and HTTPS is active.

## 6. Verify

- Visit `/login`.
- Login with `owner@nss.local` and `Namdhari@123` after seeding.
- Confirm `/dashboard`, `/pos`, `/invoices`, `/inventory`, `/farmers`, `/employees`, `/reports`, and `/business-settings` load.
- Login with `agency@nss.local` to confirm `/admin` loads for super admin only.
- In Settings, add the business WhatsApp number before using invoice WhatsApp sharing.
- In Settings as super admin, add the official invoice address, phone, registered number, and invoice assigned names for the relatives handling billing.
- Add one product in each real menu department as needed: sweets, fast food, packed items, drinks, cakes, ice cream, dairy products, namkeen/snacks, bakery, and festival specials.
- Add suppliers in `/suppliers`, then use `/suppliers/ledger` for supplier debit-credit tracking.
- Add farmer placeholders in `/farmers/profiles`, then use `/farmers/new` for daily milk collection.
- Add napkins, sweet boxes, disposable plates/spoons/cups, and other packaging under `/inventory` using the `PACKAGING`, `DISPOSABLE`, or `SHOP_SUPPLY` inventory types.
- Aadhaar number is required when adding employees.
- Download a PDF and CSV report.
- Update production passwords after first login.
