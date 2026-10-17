# src/lib — server-only code

Runs on the Worker. Import from routes with `prerender = false`, `src/worker.ts` or other lib files. Never from client scripts.

| File          | Exports                                                                                             |
| ------------- | --------------------------------------------------------------------------------------------------- |
| `env.ts`      | `env` (typed bindings + secrets), `features()`                                                      |
| `db.ts`       | `all<T>()`, `first<T>()`, `run()`, `now()`, row interfaces                                          |
| `jobs.ts`     | `enqueue(type, payload)`, `runJob()`, `handlers` registry                                           |
| `stripe.ts`   | `getStripe()` (null if unconfigured), `plans`, `checkoutHref()`, `verifyWebhook()`, `formatMoney()` |
| `ai/index.ts` | `chat()`, `enabledProviders()`; registry in `ai/providers.ts`                                       |
| `auth.ts`     | `checkPassword()`, `createSession()`, `isAuthenticated()`, `destroySession()`                       |
| `http.ts`     | `json()`, `error()`, `readBody()` (JSON or form), `wantsHtml()`                                     |

Rules: Web APIs + `fetch` only (Workers runtime, `nodejs_compat` on). No new SDK when `fetch` works. Every optional integration returns a clear error or null when its key is missing.
