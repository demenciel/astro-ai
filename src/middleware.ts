import { defineMiddleware } from 'astro:middleware';
import { isAuthenticated } from '~/lib/auth';

/** Guards /admin/* and /api/admin/*. Prerendered (static) pages are skipped. */
const PUBLIC = new Set(['/admin/login', '/api/admin/login']);

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  const isAdmin = pathname.startsWith('/admin') || pathname.startsWith('/api/admin');
  if (context.isPrerendered || !isAdmin || PUBLIC.has(pathname.replace(/\/$/, ''))) return next();

  if (await isAuthenticated(context.cookies)) return next();

  if (pathname.startsWith('/api/')) {
    return new Response(JSON.stringify({ ok: false, error: 'unauthorized' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    });
  }
  return context.redirect(`/admin/login?next=${encodeURIComponent(pathname)}`);
});
