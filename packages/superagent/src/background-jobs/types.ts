/**
 * BackgroundJob — Base interface for all AI background jobs.
 */

export interface BackgroundJobEnv {
  DB: unknown;         // D1 database binding
  AI_KV: unknown;      // KV binding for job state
  [key: string]: unknown;
}

export interface BackgroundJobResult {
  jobName: string;
  success: boolean;
  recordsProcessed: number;
  durationMs: number;
  error?: string;
}

export interface BackgroundJob {
  /** Cron expression this job is triggered by (e.g. '0 22 * * *') */
  readonly cron: string;
  /** Human-readable job name for logging */
  readonly name: string;
  /** Run the job. Must be idempotent. */
  run(env: BackgroundJobEnv, event?: unknown): Promise<BackgroundJobResult>;
}
