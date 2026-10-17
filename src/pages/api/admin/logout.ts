import type { APIRoute } from 'astro';
import { destroySession } from '~/lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ cookies, redirect }) => {
  destroySession(cookies);
  return redirect('/admin/login', 303);
};
