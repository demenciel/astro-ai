# Add a background job (Cloudflare Queues)

1. `npm run new -- job <type>` → adds a handler stub to `handlers` in `src/lib/jobs.ts`.
2. Implement it (type the payload). Throwing = retry (max 3, `wrangler.jsonc` → `queues.consumers`).
3. Trigger from any server route: `await enqueue('<type>', payload)`.
4. Watch it in `/admin/jobs` (every job is logged in D1 `jobs` with status/error).

Notes: the consumer is `queue()` in `src/worker.ts`. Without the `JOBS` binding, jobs run
inline. Locally, `npm run dev` simulates the queue. For scheduled work use `scheduled()` in
`src/worker.ts` + `triggers.crons` in `wrangler.jsonc`.
