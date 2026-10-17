import type { APIRoute } from 'astro';
import { now, run } from '~/lib/db';
import { enqueue } from '~/lib/jobs';
import { error, json, readBody, wantsHtml } from '~/lib/http';

export const prerender = false;

/** Stores contact form submissions in D1 and enqueues a `contact.received` job. */
export const POST: APIRoute = async ({ request, redirect }) => {
  const body = await readBody(request);
  const name = body.name?.trim().slice(0, 200) || null;
  const email = body.email?.trim().slice(0, 320) || null;
  const message = (body.message ?? body.textarea)?.trim().slice(0, 5000) || null;
  if (!email && !message) return error('Email or message is required');

  const res = await run(
    'INSERT INTO contacts (name, email, message, created_at) VALUES (?, ?, ?, ?)',
    name,
    email,
    message,
    now()
  );
  await enqueue('contact.received', { contactId: Number(res.meta.last_row_id), email });

  return wantsHtml(request) ? redirect('/thank-you', 303) : json({ ok: true });
};
