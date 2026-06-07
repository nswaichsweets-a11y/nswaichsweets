# Performance Notes

- Dashboard uses summary queries instead of loading full tables.
- Large tables use pagination and search parameters.
- Report generation happens only when the user requests PDF or CSV.
- Heavy chart/report work is separated from the first dashboard render.
- The app uses server-rendered protected pages with small client components only where needed.
- The service worker caches the app shell in production.
- Prisma indexes are added for common search and filter fields.
- Uploaded images should be stored through optimized object storage and referenced by URL.
- Avoid adding unnecessary third-party packages. Prefer platform APIs for simple CSV/PDF generation unless advanced output is required.
- Keep future modules separated by feature folder and report key.
