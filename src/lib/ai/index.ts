import { env } from '~/lib/env';
import { PROVIDERS, type ProviderDef, type ProviderId } from './providers';

/**
 * One function for every provider, using plain fetch (no SDKs = small Worker bundle).
 *
 *   import { chat } from '~/lib/ai';
 *   const { text } = await chat({ messages: [{ role: 'user', content: 'Hi' }] });
 *
 * `provider` defaults to the first enabled one (order of PROVIDERS).
 */
export { PROVIDERS, type ProviderId };

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatOptions {
  messages: ChatMessage[];
  system?: string;
  provider?: ProviderId;
  model?: string;
  maxTokens?: number;
}

export interface ChatResult {
  provider: ProviderId;
  model: string;
  text: string;
}

export function enabledProviders(): ProviderDef[] {
  return Object.values(PROVIDERS).filter((p) => Boolean(env[p.keyName]));
}

export async function chat(opts: ChatOptions): Promise<ChatResult> {
  const def = opts.provider ? PROVIDERS[opts.provider] : enabledProviders()[0];
  if (!def) throw new Error('No AI provider configured. Add one of the *_API_KEY secrets.');
  const key = env[def.keyName];
  if (!key) throw new Error(`${def.label} is not configured (missing ${def.keyName}).`);
  const model = opts.model ?? def.model;
  const maxTokens = opts.maxTokens ?? 1024;

  let url: string;
  let headers: Record<string, string> = { 'content-type': 'application/json' };
  let body: unknown;

  if (def.api === 'anthropic') {
    url = `${def.baseUrl}/messages`;
    headers = { ...headers, 'x-api-key': key, 'anthropic-version': '2023-06-01' };
    body = { model, max_tokens: maxTokens, system: opts.system, messages: opts.messages };
  } else if (def.api === 'gemini') {
    url = `${def.baseUrl}/models/${model}:generateContent`;
    headers = { ...headers, 'x-goog-api-key': key };
    body = {
      ...(opts.system && { systemInstruction: { parts: [{ text: opts.system }] } }),
      contents: opts.messages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
      generationConfig: { maxOutputTokens: maxTokens },
    };
  } else {
    url = `${def.baseUrl}/chat/completions`;
    headers = { ...headers, authorization: `Bearer ${key}` };
    body = {
      model,
      // OpenAI's newer models only accept max_completion_tokens; xAI/DeepSeek use max_tokens.
      [def.id === 'openai' ? 'max_completion_tokens' : 'max_tokens']: maxTokens,
      messages: [...(opts.system ? [{ role: 'system', content: opts.system }] : []), ...opts.messages],
    };
  }

  const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`${def.label} ${res.status}: ${(await res.text()).slice(0, 500)}`);
  const data = (await res.json()) as Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

  const text =
    def.api === 'anthropic'
      ? data.content?.map((c: { text?: string }) => c.text ?? '').join('')
      : def.api === 'gemini'
        ? data.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('')
        : data.choices?.[0]?.message?.content;

  return { provider: def.id, model, text: text ?? '' };
}
