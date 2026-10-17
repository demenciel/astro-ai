# Agent guide (read this first, then only what the task needs)

Agent-first SaaS starter: **AstroWind** (Astro 7 + Tailwind v4) on **Cloudflare Workers**
(static pages + on-demand routes) with **D1**, **Queues**, **Stripe**, an **admin panel** and
**multi-provider AI** (OpenAI, Anthropic, Gemini, xAI, DeepSeek). Fits the Workers Free plan.

## Start of every session

1. Run `npm run status` (≈10 lines: onboarding state, keys set (names only), next steps).
2. If not onboarded → follow `.agents/skills/onboarding.md` before anything else.
3. Read `PROJECT.md` (the product brief + decisions). It overrides demo content.

## Token budget rules

- Route through the table below; open one skill file, not the codebase. Each skill names the exact files to touch.
- Don't read: `package-lock.json`, `worker-configuration.d.ts` (generated), `dist/`, `.wrangler/`, `vendor/`, demo pages under `src/pages/homes|landing/`, widget sources (use the catalog in `use-widgets.md`).
- Scaffold, don't hand-write: `npm run new -- page|api|admin|migration|job <name>`.
- Prefer `npm run check` output over re-reading files to verify edits.
- Ask the user batched questions (one message), never one at a time.
- Secrets: the user pastes them into `.env.setup`; you check names via `npm run status`. Never echo values.

## Task router

| Task                                                           | Read                                                                    |
| -------------------------------------------------------------- | ----------------------------------------------------------------------- |
| First run / customize for a new product                        | `.agents/skills/onboarding.md`                                          |
| What keys to ask for and where to get them                     | `.agents/skills/setup-keys.md`                                          |
| Provision Cloudflare, deploy, CI, domains, cron                | `.agents/skills/deploy-cloudflare.md`                                   |
| Build a page / landing / section                               | `.agents/skills/use-widgets.md`, `write-landing-page.md`, `add-page.md` |
| Colors, fonts, theme                                           | `.agents/skills/styling.md`, `use-shadcn-tokens.md`                     |
| Header / footer nav                                            | `.agents/skills/customize-header.md`                                    |
| Blog posts / remove blog                                       | `.agents/skills/add-blog-post.md`, `disable-blog.md`                    |
| SEO: OG images, structured data                                | `.agents/skills/set-open-graph-image.md`, `add-structured-data.md`      |
| Payments, plans, webhooks                                      | `.agents/skills/setup-stripe.md`                                        |
| AI features                                                    | `.agents/skills/add-ai-feature.md`                                      |
| Database tables                                                | `.agents/skills/add-db-table.md`                                        |
| Background jobs / queues                                       | `.agents/skills/add-background-job.md`                                  |
| Admin pages, auth                                              | `.agents/skills/add-admin-section.md`                                   |
| Contact form                                                   | `.agents/skills/configure-contact-form.md`                              |
| Theme plumbing (Tailwind config, fonts, images, config loader) | `.agents/skills/astrowind-internals.md`                                 |
| Other (CMS, base path, components)                             | `ls .agents/skills/`                                                    |

## Map

| Path                      | What                                                                                               |
| ------------------------- | -------------------------------------------------------------------------------------------------- |
| `src/pages/`              | Routes. Static by default; `export const prerender = false` = runs on the Worker                   |
| `src/pages/api/`          | JSON/form endpoints: `contact`, `health`, `stripe/{checkout,webhook}`, `admin/*`                   |
| `src/pages/admin/`        | Admin panel (guarded by `src/middleware.ts`)                                                       |
| `src/lib/`                | Server code: `env` (bindings/secrets), `db` (D1), `jobs` (Queues), `stripe`, `ai/`, `auth`, `http` |
| `src/worker.ts`           | Worker entry: `fetch` (Astro) + `queue` consumer + `scheduled` cron                                |
| `src/components/widgets/` | Page sections (catalog: `use-widgets.md`)                                                          |
| `src/config.yaml`         | Site name, URL, SEO defaults, blog/i18n settings                                                   |
| `src/navigation.ts`       | Header and footer links                                                                            |
| `src/data/plans.json`     | Paid plans (pricing page + Stripe setup)                                                           |
| `src/data/post/`          | Blog posts (md/mdx)                                                                                |
| `migrations/`             | D1 SQL migrations (numbered, append-only)                                                          |
| `scripts/`                | `setup.mjs`, `status.mjs`, `new.mjs` (zero-dep Node)                                               |
| `wrangler.jsonc`          | Worker name, bindings (DB, JOBS, ASSETS), vars                                                     |
| `.github/workflows/`      | `ci.yaml` (check + build), `deploy.yaml` (push to main → Cloudflare)                               |

## Commands

| Command                                      | Does                                                                                                                                |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`                                | Dev server :4321 with local D1/Queue (auto-creates `.dev.vars` + local DB)                                                          |
| `npm run status`                             | Setup state + next steps (`-- --json` for machines)                                                                                 |
| `npm run setup`                              | Idempotent: name project, write `.dev.vars`, create D1/queue, Stripe prices + webhook, deploy, GitHub secrets (`-- --only=<steps>`) |
| `npm run new -- <kind> <name>`               | Scaffold page / api / admin / migration / job                                                                                       |
| `npm run check` / `npm run fix`              | astro check + ESLint + Prettier / autofix                                                                                           |
| `npm run build` / `npm run deploy`           | Build / build + remote migrations + deploy                                                                                          |
| `npm run types`                              | Regenerate binding types after editing `wrangler.jsonc` or `.dev.vars.example`                                                      |
| `npm run db:migrate` / `db:query -- "<sql>"` | Local D1 migrate / query                                                                                                            |

## Invariants

- Optional integrations degrade gracefully: check the key (`getStripe()`, `enabledProviders()`, `features()`) before use.
- Server-only code lives in `src/lib/` and routes with `prerender = false`; never import `~/lib/*` from client `<script>`s.
- Access bindings/secrets via `import { env } from '~/lib/env'`.
- New secret name → add to `.dev.vars.example`, `.env.setup.example`, `WORKER_SECRETS` in `scripts/lib.mjs`, then `npm run types`.
- D1: prepared statements only (`?` placeholders). Schema changes only via new migration files.
- Imports use `~/` (= `src/`). Site config comes from `astrowind:config`.
- Keep marketing pages static (free, fast). Use on-demand routes only for dynamic data.
- Record product decisions in `PROJECT.md` → Decisions log.

## Done checklist

1. `npm run check` passes. 2. `npm run build` passes. 3. If routes/data changed: `npm run dev` and hit the route (`curl`). 4. `PROJECT.md` updated if a decision was made.
