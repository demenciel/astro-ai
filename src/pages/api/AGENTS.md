# src/pages/api — Worker endpoints

Every file: `export const prerender = false;` + `export const GET/POST: APIRoute`. Scaffold with `npm run new -- api <name>`.
Use `json()/error()/readBody()` from `~/lib/http`. Plain HTML forms work (readBody parses form data; redirect with 303).
`admin/*` is auth-guarded by `src/middleware.ts`. `stripe/webhook.ts` must read the raw body (`request.text()`) before parsing.
Astro's `checkOrigin` blocks cross-site form posts automatically.
