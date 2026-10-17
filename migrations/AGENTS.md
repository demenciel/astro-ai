# migrations — D1 schema

Numbered, append-only SQL (`npm run new -- migration <name>`). Never edit a file that has been applied.
Local: `npm run db:migrate`. Remote: applied by deploy (CI / `npm run deploy`). Mirror new tables as `*Row` interfaces in `src/lib/db.ts`.
Default tables: `contacts`, `customers`, `payments`, `stripe_events` (webhook idempotency), `jobs`.
