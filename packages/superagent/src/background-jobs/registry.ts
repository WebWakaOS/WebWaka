/**
 * Background job registry — Wave 3 (A6-5)
 * Maps cron expressions → job instances for the schedulers worker.
 */

import type { BackgroundJob } from './types.js';
import { DemandForecastJob } from './demand-forecast-job.js';
import { ShiftSummaryJob } from './shift-summary-job.js';

const jobs: BackgroundJob[] = [
  new DemandForecastJob(),
  new ShiftSummaryJob(),
];

/** Map from cron expression → job instance */
export const jobRegistry = new Map<string, BackgroundJob>(
  jobs.map(j => [j.cron, j]),
);

/** Map from job name → job instance */
export const jobsByName = new Map<string, BackgroundJob>(
  jobs.map(j => [j.name, j]),
);
