# Deploy to Cloudflare

Architecture: one Worker (`src/worker.ts`) serves prerendered pages from `dist/client`
(static assets, free, no Worker invocation) and runs on-demand routes (`prerender = false`:
`/admin/*`, `/api/*`). Bindings: `DB` (D1), `JOBS` (Queue), `ASSETS`. All on the Workers Free plan.

## First deploy (automated)

1. `.env.setup` has `CLOUDFLARE_API_TOKEN` (see `setup-keys.md`).
2. `npm run setup` → creates D1 + queue, writes ids into `wrangler.jsonc`, runs remote
   migrations, uploads secrets (`wrangler deploy --secrets-file`), deploys, sets GitHub secrets.
3. Commit the updated `wrangler.jsonc` (ids are not secret) and push. From now on
   `.github/workflows/deploy.yaml` deploys every push to `main`.

## Manual / repeat

| Task                 | Command                                                                                                                                                                                |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Deploy from laptop   | `npm run deploy` (build + remote migrations + `wrangler deploy`)                                                                                                                       |
| Change/add a secret  | `npx wrangler secret put NAME` (or add to `.env.setup`, `npm run setup -- --only=deploy`)                                                                                              |
| Tail production logs | `npx wrangler tail`                                                                                                                                                                    |
| Query production DB  | `npx wrangler d1 execute DB --remote --command "SELECT ..."`                                                                                                                           |
| Custom domain        | Dashboard → Workers → your worker → Domains & Routes; then set `SITE_URL` in `.env.setup` and re-run `npm run setup -- --only=cloudflare,stripe,deploy` (moves the Stripe webhook too) |
| Cron                 | add `"triggers": { "crons": ["0 * * * *"] }` to `wrangler.jsonc`; code in `scheduled()` in `src/worker.ts`                                                                             |

## Gotchas

- After editing `wrangler.jsonc` bindings run `npm run types` (regenerates `worker-configuration.d.ts`).
- Images: `imageService: 'compile'` (Sharp at build). Don't use Cloudflare Image Resizing for SVGs.
- Only `prerender = false` routes cost Worker requests (Free: 100k/day). Keep marketing pages static.
- `wrangler dev`/`astro dev` use local D1/Queue simulators in `.wrangler/` — no account needed.
