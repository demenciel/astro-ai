# Contact Form

Works out of the box: `src/components/ui/Form.astro` posts to `/api/contact`
(`src/pages/api/contact.ts`), which stores the row in D1 `contacts`, enqueues a
`contact.received` job and redirects to `/thank-you`. Submissions show in `/admin/contacts`.

| Change                       | Where                                                                               |
| ---------------------------- | ----------------------------------------------------------------------------------- |
| Fields                       | `inputs` / `textarea` props in `src/pages/contact.astro`                            |
| Validation / stored columns  | `src/pages/api/contact.ts` (+ a migration if you add columns)                       |
| Notify on submit (email, AI) | `'contact.received'` handler in `src/lib/jobs.ts`                                   |
| Post somewhere else          | `action` prop on `Contact` / `Form` (e.g. Formspree URL)                            |
| Spam protection              | Add Cloudflare Turnstile: widget in `Form.astro`, verify token in `api/contact.ts`  |
| Email notifications          | Cloudflare Email Routing `send_email` binding or Resend/Postmark `fetch` in the job |
