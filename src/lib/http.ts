/** Small response helpers shared by API routes. */
export const json = (data: unknown, status = 200, headers: HeadersInit = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...headers },
  });

export const error = (message: string, status = 400) => json({ ok: false, error: message }, status);

/** Accepts both JSON bodies and HTML form posts. */
export async function readBody(request: Request): Promise<Record<string, string>> {
  const type = request.headers.get('content-type') ?? '';
  if (type.includes('application/json')) return (await request.json()) as Record<string, string>;
  const form = await request.formData();
  return Object.fromEntries([...form.entries()].map(([k, v]) => [k, String(v)]));
}

/** True when the client prefers an HTML redirect over JSON (plain <form> submit). */
export const wantsHtml = (request: Request) => (request.headers.get('accept') ?? '').includes('text/html');
