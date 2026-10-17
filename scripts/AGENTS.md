# scripts — setup tooling (Node, zero runtime deps)

- `setup.mjs` steps: `project` (rename) → `local` (.dev.vars + local migrate) → `cloudflare` (D1, queue, SITE_URL via API) → `stripe` (prices from plans.json, webhook) → `deploy` (build, remote migrate, `wrangler deploy --secrets-file`) → `github` (Actions secrets via `gh` or GITHUB_TOKEN + libsodium). Idempotent; missing keys = step skipped.
- `status.mjs`: checklist / `--json` / `--hook` (one line for SessionStart hooks).
- `new.mjs`: scaffolders. Add a template here when you notice repeated boilerplate.
- `lib.mjs`: env-file + JSONC helpers, `WORKER_SECRETS` list.
  Inputs come from `.env.setup` (gitignored) or process env. Output must stay short: agents read it.
