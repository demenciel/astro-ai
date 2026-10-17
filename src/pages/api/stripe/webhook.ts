import type { APIRoute } from 'astro';
import type Stripe from 'stripe';
import { first, now, run } from '~/lib/db';
import { enqueue } from '~/lib/jobs';
import { verifyWebhook } from '~/lib/stripe';
import { error, json } from '~/lib/http';

export const prerender = false;

/**
 * Stripe webhook. Endpoint + secret are created by `npm run setup -- --only=stripe`.
 * Events are deduplicated in `stripe_events`. Add cases below for more event types
 * (and add them to WEBHOOK_EVENTS in scripts/setup.mjs).
 */
export const POST: APIRoute = async ({ request }) => {
  const signature = request.headers.get('stripe-signature');
  if (!signature) return error('Missing signature', 400);

  let event: Stripe.Event;
  try {
    event = await verifyWebhook(await request.text(), signature);
  } catch (err) {
    return error(`Invalid webhook: ${String(err)}`, 400);
  }

  if (await first('SELECT id FROM stripe_events WHERE id = ?', event.id)) return json({ ok: true, duplicate: true });
  await run('INSERT INTO stripe_events (id, type, created_at) VALUES (?, ?, ?)', event.id, event.type, now());

  switch (event.type) {
    case 'checkout.session.completed':
    case 'checkout.session.async_payment_succeeded': {
      const s = event.data.object;
      const email = s.customer_details?.email ?? s.customer_email ?? null;
      const customerId = typeof s.customer === 'string' ? s.customer : (s.customer?.id ?? null);
      await run(
        `INSERT INTO payments (stripe_session_id, email, amount_total, currency, status, mode, lookup_key, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(stripe_session_id) DO UPDATE SET status = excluded.status`,
        s.id,
        email,
        s.amount_total,
        s.currency,
        s.payment_status,
        s.mode,
        s.metadata?.lookup_key ?? null,
        now()
      );
      if (email) {
        await run(
          `INSERT INTO customers (email, stripe_customer_id, created_at) VALUES (?, ?, ?)
           ON CONFLICT(email) DO UPDATE SET stripe_customer_id = COALESCE(excluded.stripe_customer_id, stripe_customer_id)`,
          email,
          customerId,
          now()
        );
      }
      await enqueue('stripe.checkout.completed', { sessionId: s.id, email: email ?? undefined });
      break;
    }
    default:
      break;
  }

  return json({ ok: true });
};
