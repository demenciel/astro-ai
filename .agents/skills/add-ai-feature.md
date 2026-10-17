# Add an AI feature

One server function covers OpenAI, Anthropic, Gemini, xAI (Grok) and DeepSeek: `chat()` in
`src/lib/ai/index.ts` (plain `fetch`, no SDKs). Providers are enabled by their `*_API_KEY`.

```ts
import { chat, enabledProviders } from '~/lib/ai';
const { text } = await chat({
  provider: 'anthropic', // optional: defaults to first enabled provider
  model: 'claude-sonnet-5-5', // optional: defaults in src/lib/ai/providers.ts
  system: 'You are concise.',
  messages: [{ role: 'user', content: prompt }],
  maxTokens: 512,
});
```

## Recipes

| Need                  | Do                                                                                                                                                                                                                |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public AI endpoint    | `npm run new -- api <name>`; call `chat()`; **rate-limit** (D1 counter per IP, or Cloudflare Rate Limiting binding) and cap `maxTokens` — public AI endpoints burn money                                          |
| Admin-only tool       | put the endpoint under `src/pages/api/admin/` (middleware guards it)                                                                                                                                              |
| Slow / batch work     | `enqueue('<job>', payload)` and call `chat()` inside the job (`add-background-job.md`)                                                                                                                            |
| Change default models | edit `model` in `src/lib/ai/providers.ts` (verify ids in vendor docs)                                                                                                                                             |
| Add a provider        | add an entry to `PROVIDERS`; OpenAI-compatible APIs only need `api: 'openai'` + `baseUrl`; add `<NAME>_API_KEY` to `.dev.vars.example`, `scripts/lib.mjs` `WORKER_SECRETS`, `.env.setup.example`; `npm run types` |
| Streaming             | pass `stream: true` in the body and return `new Response(res.body)` with `content-type: text/event-stream` — add a `chatStream()` next to `chat()`                                                                |
| Free option           | Cloudflare Workers AI: add `"ai": { "binding": "AI" }` to `wrangler.jsonc`, `npm run types`, use `env.AI.run(model, { messages })`                                                                                |

Never call providers from client-side code; keys are server-only.
Test quickly in `/admin/ai` (playground).
