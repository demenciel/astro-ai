import Stripe from 'stripe';
import { env } from '~/lib/env';
import plansData from '~/data/plans.json';

/**
 * Stripe is optional: every caller must handle `getStripe()` returning null.
 * Prices are referenced by `lookup_key` (src/data/plans.json), never by id,
 * so the same code works in test and live mode.
 */
export const plans = plansData;
export type Plan = (typeof plansData.plans)[number];

let client: Stripe | null = null;

export function getStripe() {
  if (!env.STRIPE_SECRET_KEY) return null;
  client ??= new Stripe(env.STRIPE_SECRET_KEY, { httpClient: Stripe.createFetchHttpClient() });
  return client;
}

export function findPrice(lookupKey: string) {
  for (const plan of plansData.plans) {
    const price = plan.prices.find((p) => p.lookup_key === lookupKey);
    if (price) return { plan, price };
  }
  return null;
}

/** Resolve a plan id + interval (`/api/stripe/checkout?plan=pro&interval=year`) to a lookup key. */
export function lookupKeyFor(planId: string, interval?: string | null) {
  const plan = plansData.plans.find((p) => p.id === planId);
  if (!plan) return null;
  return (plan.prices.find((p) => p.interval === interval) ?? plan.prices[0])?.lookup_key ?? null;
}

/** Checkout link for a plan, for use as a widget `callToAction.href`. */
export const checkoutHref = (planId: string, interval: 'month' | 'year' = 'month') =>
  `/api/stripe/checkout?plan=${planId}&interval=${interval}`;

export async function verifyWebhook(body: string, signature: string) {
  const stripe = getStripe();
  if (!stripe || !env.STRIPE_WEBHOOK_SECRET) throw new Error('Stripe webhook not configured');
  return stripe.webhooks.constructEventAsync(
    body,
    signature,
    env.STRIPE_WEBHOOK_SECRET,
    undefined,
    Stripe.createSubtleCryptoProvider()
  );
}

export const formatMoney = (amount: number | null, currency = plansData.currency) =>
  amount == null
    ? '—'
    : new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(amount / 100);
