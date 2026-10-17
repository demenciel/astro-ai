# astro-ai

**An agent-first SaaS starter.** Open it in Claude Code, Codex, Cursor or Gemini CLI, and the agent
interviews you about your product, asks for a few keys, then provisions, customizes and deploys
the whole thing on Cloudflare's free tier.

Built on [AstroWind](https://github.com/arthelokyo/astrowind) (Astro 7 + Tailwind CSS v4).

## What's inside

|                     |                                                                                                                    |
| ------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Site**            | AstroWind's 40+ widgets, blog, SEO, dark mode. Marketing pages are prerendered static assets                       |
| **Runtime**         | One Cloudflare Worker (`@astrojs/cloudflare`): static pages + on-demand `/api/*` and `/admin/*`                    |
| **Database**        | Cloudflare D1 + SQL migrations (contacts, customers, payments, jobs)                                               |
| **Background jobs** | Cloudflare Queues consumer, with a job log in the admin panel                                                      |
| **Payments**        | Stripe Checkout + verified, idempotent webhook. Plans in `src/data/plans.json`, created in Stripe automatically    |
| **AI**              | One `chat()` function for OpenAI, Anthropic, Gemini, xAI Grok and DeepSeek (plain `fetch`, no SDKs)                |
| **Admin panel**     | `/admin`: dashboard, contacts, payments, jobs, AI playground, integration status                                   |
| **CI/CD**           | GitHub Actions: check + build on PRs, deploy to Cloudflare on push to `main`                                       |
| **Agent layer**     | `AGENTS.md` task router, per-area `AGENTS.md`, 24 task skills, onboarding interview, `npm run status`, scaffolders |

Every integration except Cloudflare is optional. Without its key, a feature switches itself off and everything else keeps working.

## Quick start

```bash
npm create astro@latest -- --template demenciel/astro-ai my-app
# or: "Use this template" on GitHub, then clone
cd my-app && npm install
```

Then open the folder in your coding agent and say **"set up this project"** (Claude Code: `/onboard`).
The agent will:

1. Ask you ~8 questions in one message (what you're building, brand, pages, pricing, AI features).
2. Tell you which keys to paste into `.env.setup` while it works:
   - **Cloudflare API token** (required): [create one](https://dash.cloudflare.com/profile/api-tokens) from the _Edit Cloudflare Workers_ template, then add _D1: Edit_ and _Queues: Edit_
   - GitHub token (optional, enables deploy-on-push)
   - Stripe test keys (optional)
   - OpenAI / Anthropic / Gemini / xAI / DeepSeek keys (optional)
3. Rewrite the copy, colors, navigation, homepage and pricing to match your answers.
4. Run `npm run setup`, which creates D1 and the queue, Stripe products and webhook, uploads secrets, deploys, and wires GitHub Actions.

### Without an agent

```bash
cp .env.setup.example .env.setup     # fill in your keys
PROJECT_NAME="My App" npm run setup  # idempotent, safe to re-run
npm run dev                          # http://localhost:4321, admin at /admin
```

## Commands

| Command                                                  |                                                                                |
| -------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `npm run dev`                                            | Dev server with local D1 + Queue simulation                                    |
| `npm run status`                                         | Setup state and next steps                                                     |
| `npm run setup`                                          | Provision + deploy (`-- --only=project,local,cloudflare,stripe,deploy,github`) |
| `npm run new -- page\|api\|admin\|migration\|job <name>` | Scaffold                                                                       |
| `npm run check` / `npm run fix`                          | Types + lint + format                                                          |
| `npm run deploy`                                         | Build, apply remote migrations, deploy                                         |
| `npm run db:migrate` / `npm run db:query -- "<sql>"`     | Local database                                                                 |

## Why "agent-first"

Templates usually optimize for humans reading docs. This one is also built for agents that pay per token:

- **Progressive disclosure.** The root `AGENTS.md` (~90 lines) routes each task to one skill file, and that file names the exact files to edit. Agents don't need to explore.
- **Scaffolders instead of boilerplate.** `npm run new` writes the plumbing, so the agent only writes intent.
- **Machine-readable state.** `npm run status [--json]` replaces poking around the filesystem. A SessionStart hook in Claude Code runs it automatically.
- **Secrets stay out of chat.** Keys go in `.env.setup`. Agents see which keys are set, never their values, and Claude Code is denied reading the file.
- **Idempotent automation.** The agent can re-run `npm run setup` safely after every new key.

## Free-tier footprint

Workers Free covers 100k requests/day; static pages don't count against it. D1 Free gives 5 GB and 5M reads/day. If Queues are unavailable on your plan, remove the `queues` block from `wrangler.jsonc` and jobs run inline. Stripe has no monthly fee.

## License

MIT. Based on [AstroWind](https://github.com/arthelokyo/astrowind) by onWidget / Arthelokyo (MIT).
