/**
 * Worker entrypoint (wrangler.jsonc -> "main").
 * - fetch: Astro (pages, API routes, static assets)
 * - queue: background jobs from the JOBS queue (src/lib/jobs.ts)
 * - scheduled: cron triggers (add "triggers": { "crons": [...] } in wrangler.jsonc)
 */
import { handle } from '@astrojs/cloudflare/handler';
import { runJob, type JobMessage } from '~/lib/jobs';

export default {
  fetch: handle,

  async queue(batch: MessageBatch<JobMessage>) {
    for (const message of batch.messages) {
      try {
        await runJob(message.body);
        message.ack();
      } catch (err) {
        console.error('job failed', message.body?.type, err);
        message.retry();
      }
    }
  },

  async scheduled(controller: ScheduledController) {
    console.log('cron', controller.cron);
  },
} satisfies ExportedHandler<Env, JobMessage>;
