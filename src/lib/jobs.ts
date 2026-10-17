import { env } from '~/lib/env';
import { now, run } from '~/lib/db';

/**
 * Background jobs on Cloudflare Queues.
 *
 * Add a job: `npm run new -- job <name>` (or add a handler below), then call
 * `enqueue('<name>', payload)` from any route. The queue consumer in
 * src/worker.ts calls `runJob` for each message. When the JOBS binding is
 * missing (e.g. Queues not enabled yet) jobs run inline so nothing is lost.
 */
export interface JobMessage {
  id: number;
  type: string;
  payload: unknown;
}

type Handler = (payload: never) => Promise<void>;

const handlers = {
  'contact.received': async (payload: { contactId: number; email?: string }) => {
    // Hook point: send an email, ping Slack, call an AI to triage, etc.
    console.log('contact.received', payload);
  },
  'stripe.checkout.completed': async (payload: { sessionId: string; email?: string }) => {
    // Hook point: provision access, send a receipt, grant credits, etc.
    console.log('stripe.checkout.completed', payload);
  },
} satisfies Record<string, Handler>;

export type JobType = keyof typeof handlers;

export async function enqueue(type: JobType, payload: unknown) {
  const ts = now();
  const res = await run(
    'INSERT INTO jobs (type, payload, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
    type,
    JSON.stringify(payload),
    'queued',
    ts,
    ts
  );
  const msg: JobMessage = { id: Number(res.meta.last_row_id), type, payload };
  if (env.JOBS) await env.JOBS.send(msg);
  else await runJob(msg);
}

export async function runJob(msg: JobMessage) {
  const handler = (handlers as Record<string, Handler>)[msg.type];
  try {
    if (!handler) throw new Error(`No handler for job type "${msg.type}"`);
    await handler(msg.payload as never);
    await run('UPDATE jobs SET status = ?, error = NULL, updated_at = ? WHERE id = ?', 'done', now(), msg.id);
  } catch (err) {
    await run(
      'UPDATE jobs SET status = ?, error = ?, updated_at = ? WHERE id = ?',
      'failed',
      String(err),
      now(),
      msg.id
    );
    throw err;
  }
}
