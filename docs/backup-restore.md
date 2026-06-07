# Backup and Restore Notes

## Neon

- Enable automated backups from the Neon dashboard when the project moves beyond initial setup.
- Use point-in-time restore for incident recovery on paid plans.
- Export important reports as CSV/PDF from the app for client-facing records.

## Supabase

- Use Supabase database backups for managed recovery.
- Store uploaded logos and receipt images in Supabase Storage or another managed object store.
- Keep storage lifecycle and retention rules aligned with accounting requirements.

## App-Level Export

The app exposes PDF and CSV export endpoints for all major report definitions. These exports help with operational records, but they are not a replacement for provider-level database backups.

## Restore Placeholder

Full in-app restore is intentionally left as a future module. Restores should be handled by the agency or technical admin using Neon/Supabase backup tools.
