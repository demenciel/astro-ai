import type { APIRoute } from 'astro';
import { chat, PROVIDERS, type ProviderId } from '~/lib/ai';
import { error, json, readBody } from '~/lib/http';

export const prerender = false;

/** Admin-only AI playground endpoint: POST { provider?, model?, prompt, system? }. */
export const POST: APIRoute = async ({ request }) => {
  const { provider, model, prompt, system } = await readBody(request);
  if (!prompt) return error('prompt is required');
  if (provider && !(provider in PROVIDERS)) return error('unknown provider');
  try {
    const result = await chat({
      provider: (provider || undefined) as ProviderId | undefined,
      model: model || undefined,
      system: system || undefined,
      messages: [{ role: 'user', content: prompt }],
    });
    return json({ ok: true, ...result });
  } catch (err) {
    return error(String(err), 502);
  }
};
