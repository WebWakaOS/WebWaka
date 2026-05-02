/**
 * Background Job Infrastructure — Wave 3 (A6-5)
 * WebWaka OS — Typed interface + initial jobs for Cloudflare Cron triggers.
 *
 * Jobs are triggered by Cloudflare Cron Triggers in wrangler.toml.
 * The `apps/schedulers` worker dispatches to the correct job based on
 * the cron expression / scheduled event name.
 *
 * Usage in schedulers worker:
 *   import { jobRegistry } from '@webwaka/superagent/background-jobs';
 *   export default { scheduled(event, env, ctx) {
 *     const job = jobRegistry.get(event.cron);
 *     if (job) ctx.waitUntil(job.run(env, event));
 *   }};
 */

export { BackgroundJob, BackgroundJobResult, BackgroundJobEnv } from './types.js';
export { DemandForecastJob } from './demand-forecast-job.js';
export { ShiftSummaryJob } from './shift-summary-job.js';
export { jobRegistry } from './registry.js';
