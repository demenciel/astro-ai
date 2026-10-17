import type { APIRoute } from 'astro';
import { env } from '~/lib/env';
import { findPrice, getStripe, lookupKeyFor } from '~/lib/stripe';
import { error, readBody } from '~/lib/http';

export const prerender = false;

async function startCheckout(lookupKey: string | null | undefined, email: string | undefined, origin: string) {
  const stripe = getStripe();
  if (!stripe) return error('Payments are not configured yet', 503);
  if (!lookupKey || !findPrice(lookupKey)) return error('Unknown plan');

  const { data } = await stripe.prices.list({ lookup_keys: [lookupKey], limit: 1 });
  const price = data[0];
  if (!price) return error(`Price "${lookupKey}" not found in Stripe. Run \`npm run setup -- --only=stripe\`.`, 500);

  const base = env.SITE_URL && !env.SITE_URL.includes('localhost') ? env.SITE_URL : origin;
  const session = await stripe.checkout.sessions.create({
    mode: price.recurring ? 'subscription' : 'payment',
    line_items: [{ price: price.id, quantity: 1 }],
    customer_email: email || undefined,
    allow_promotion_codes: true,
    metadata: { lookup_key: lookupKey },
    success_url: `${base}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/pricing`,
  });
  return Response.redirect(session.url!, 303);
}

/** Link form: /api/stripe/checkout?plan=pro&interval=year (see checkoutHref in ~/lib/stripe). */
export const GET: APIRoute = async ({ request, url }) => {
  // Astro prefetches visible links; never create a Checkout Session for a prefetch.
  if (/prefetch/i.test(request.headers.get('sec-purpose') ?? request.headers.get('purpose') ?? '')) {
    return new Response(null, { status: 204 });
  }
  const key = lookupKeyFor(url.searchParams.get('plan') ?? '', url.searchParams.get('interval'));
  return startCheckout(key, url.searchParams.get('email') ?? undefined, url.origin);
};

/** Form/JSON form: POST { lookup_key, email? }. */
export const POST: APIRoute = async ({ request, url }) => {
  const { lookup_key: lookupKey, email } = await readBody(request);
  return startCheckout(lookupKey, email, url.origin);
};
