# Add an admin section

1. `npm run new -- admin <name>` → `src/pages/admin/<name>.astro` (+ sidebar entry in
   `src/components/admin/nav.ts`, set a Tabler `icon`).
2. Query D1 in the frontmatter, render with `DataTable` (`columns`, `rows`, optional `format`)
   and `StatCard`. Pages must keep `export const prerender = false`.
3. Mutations: a `<form method="post">` to `src/pages/api/admin/<name>.ts` (auth is automatic
   for `/admin/*` and `/api/admin/*` via `src/middleware.ts`), then `redirect()` back.

## Auth model

Single admin: `ADMIN_PASSWORD` secret + HMAC-signed cookie (`src/lib/auth.ts`), no DB needed.
To add real end-user accounts later: add a `users` table + sessions table, keep
`src/lib/auth.ts` as the single entry point, and extend the middleware matcher
(e.g. `/app/*`). Consider magic links via email or an OAuth provider rather than passwords.
