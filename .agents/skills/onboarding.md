# Onboarding (first session on a fresh copy)

Trigger: `npm run status` shows `· onboarded`, or `PROJECT.md` has `onboarded: false`.
Goal: in **one interview round-trip**, get enough context to customize the site, then set up
infra while the user fetches keys. Don't read demo pages or widget sources: the widget
catalog in `use-widgets.md` is enough.

## 1. Kick off (one message, in parallel)

Run `npm install` (if `node_modules` missing) and `cp .env.setup.example .env.setup`, then send
the user ONE message containing both blocks below. Offer defaults so they can answer fast.

**A. Questions** (numbered, user may answer "default" to any):

1. What are you building, in one sentence? Who is it for?
2. Name of the product (and domain if you have one)?
3. Type: SaaS app, landing page/waitlist, marketplace, portfolio, blog, internal tool?
4. Pages you need (default: Home, Pricing, About, Contact, Blog, Privacy, Terms)?
5. Look & feel: tone (playful/serious/premium), brand colors, 1–2 reference sites?
6. Will you charge money? Plans & prices (default: Starter $9/mo, Pro $29/mo, Lifetime $199)?
7. Any AI features (e.g. chat, generation, summarizing)? Which providers do you have keys for?
8. Anything that must happen in the background (emails, syncing, scheduled tasks)?

**B. Keys** — "While you answer, grab these and paste them into `.env.setup` (not in chat):"
list from `setup-keys.md` (Cloudflare required; GitHub, Stripe, AI optional), with links.

## 2. Customize (after answers)

Do these with minimal reads; each row names the only file(s) to touch:

| Step                                                  | Files                                                                                                                                                                          |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Fill the brief; set `onboarded: true`                 | `PROJECT.md`                                                                                                                                                                   |
| Site name, URL, SEO title/description, twitter handle | `src/config.yaml` (`site`, `metadata`)                                                                                                                                         |
| Colors / font                                         | `src/components/CustomStyles.astro` (`--aw-color-*`), `astro.config.ts` `fonts` (see `styling.md`)                                                                             |
| Header/footer links                                   | `src/navigation.ts` (see `customize-header.md`)                                                                                                                                |
| Homepage                                              | rewrite `src/pages/index.astro` with widgets from `use-widgets.md`; pick the closest base: `homes/saas`, `homes/startup`, `homes/mobile-app`, `homes/personal`, or `landing/*` |
| New pages                                             | `npm run new -- page <slug>` then fill props                                                                                                                                   |
| Plans                                                 | `src/data/plans.json` (pricing page + Stripe read it)                                                                                                                          |
| Blog                                                  | keep and replace posts in `src/data/post/`, or follow `disable-blog.md`                                                                                                        |
| Prune demos                                           | delete unused `src/pages/homes/`, `src/pages/landing/`, demo posts; remove their nav links                                                                                     |
| Legal                                                 | update `src/pages/privacy.md`, `terms.md` with the product name                                                                                                                |
| AI / jobs / tables                                    | `add-ai-feature.md`, `add-background-job.md`, `add-db-table.md`                                                                                                                |

Write real copy from the brief (no lorem ipsum). Keep one `<h1>` per page.

## 3. Setup & ship

1. `npm run status` → confirm keys present (names only).
2. `PROJECT_NAME=<name> npm run setup` (idempotent; re-run after the user adds keys). Pass a custom domain as `SITE_URL=https://… npm run setup`. Both are saved to `.env.setup`; you never need to open that file (agents are denied reading it).
3. `npm run check && npm run build`. Fix anything red.
4. Commit (including `wrangler.jsonc` ids) and push → GitHub Action deploys.
5. Report to the user: live URL, `/admin` + where the password is (`.env.setup`), what's
   enabled/disabled, and the next 3 suggested improvements.

If the user gives no Cloudflare token yet, finish steps 1–2 of section 2 and run
`PROJECT_NAME=<name> npm run setup -- --only=project,local`, `npm run dev` so they can see it locally.
