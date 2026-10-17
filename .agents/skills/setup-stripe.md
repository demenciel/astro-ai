# Payments (Stripe)

Flow: pricing CTA → `GET /api/stripe/checkout?plan=<id>&interval=month|year` → Stripe
Checkout → webhook `POST /api/stripe/webhook` → D1 `payments` + `customers` →
job `stripe.checkout.completed` → `/admin/payments`.

| Task                       | Where                                                                                                                                                                                 |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Change plans/prices        | `src/data/plans.json`, then `npm run setup -- --only=stripe` (creates missing prices by `lookup_key`; Stripe prices are immutable, so change a price by using a **new** `lookup_key`) |
| Button anywhere            | `href={checkoutHref('pro', 'year')}` from `~/lib/stripe`, or `<form method="post" action="/api/stripe/checkout">` with `lookup_key`                                                   |
| Grant access after payment | `'stripe.checkout.completed'` handler in `src/lib/jobs.ts`                                                                                                                            |
| Handle more events         | add `case` in `src/pages/api/stripe/webhook.ts` + event name in `WEBHOOK_EVENTS` in `scripts/setup.mjs`, re-run `--only=stripe`                                                       |
| Customer portal            | `stripe.billingPortal.sessions.create({ customer, return_url })` in a new API route                                                                                                   |
| Local webhook testing      | `stripe listen --forward-to localhost:4321/api/stripe/webhook`, put the printed `whsec_` in `.dev.vars`                                                                               |
| Go live                    | swap to live keys in `.env.setup`, clear `STRIPE_WEBHOOK_SECRET`, `npm run setup -- --only=stripe,deploy`                                                                             |

All Stripe code is in `src/lib/stripe.ts` and checks `getStripe()` for null: without keys,
checkout returns 503 and everything else keeps working.
