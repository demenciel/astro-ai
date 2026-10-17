import type { APIRoute } from 'astro';
import { features } from '~/lib/env';
import { enabledProviders } from '~/lib/ai';
import { json } from '~/lib/http';

export const prerender = false;

/** Public health check: which integrations are configured (booleans only, no secrets). */
export const GET: APIRoute = async () =>
  json({ ok: true, features: features(), ai: enabledProviders().map((p) => p.id) });
