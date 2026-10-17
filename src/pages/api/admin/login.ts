import type { APIRoute } from 'astro';
import { checkPassword, createSession } from '~/lib/auth';
import { readBody } from '~/lib/http';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, redirect, url }) => {
  const { password = '', next = '/admin' } = await readBody(request);
  if (!checkPassword(password)) return redirect('/admin/login?error=1', 303);
  await createSession(cookies, url.protocol === 'https:');
  // Only allow local redirects.
  return redirect(next.startsWith('/admin') ? next : '/admin', 303);
};
