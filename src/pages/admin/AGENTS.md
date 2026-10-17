# src/pages/admin — admin panel

Pages use `AdminLayout` (`~/layouts/AdminLayout.astro`), `DataTable` and `StatCard` (`~/components/admin/`), and must keep `export const prerender = false`.
Sidebar: `src/components/admin/nav.ts`. New section: `npm run new -- admin <name>`. Mutations go to `src/pages/api/admin/*`.
Auth: `src/middleware.ts` + `src/lib/auth.ts` (single `ADMIN_PASSWORD`). Details: `.agents/skills/add-admin-section.md`.
