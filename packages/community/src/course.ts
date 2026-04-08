/**
 * Course module + lesson management and progress tracking.
 * (Platform Invariants P5/P6 — offline-cacheable, T3 — tenant isolation)
 */

import type { CourseModule, CourseLesson, LessonProgress } from './types.js';
import type { D1Like } from './community-space.js';

function generateId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 11)}${Date.now().toString(36)}`;
}

interface ModuleRow {
  id: string;
  community_id: string;
  title: string;
  description: string | null;
  status: string;
  access_tier_id: string | null;
  sequence: number;
  tenant_id: string;
  created_at: number;
  updated_at: number;
}

interface LessonRow {
  id: string;
  module_id: string;
  title: string;
  content_type: string;
  content_url: string | null;
  body: string | null;
  duration_secs: number | null;
  sequence: number;
  is_free_preview: number;
  tenant_id: string;
  created_at: number;
}

interface ProgressRow {
  id: string;
  lesson_id: string;
  user_id: string;
  completed_at: number | null;
  progress_pct: number;
  tenant_id: string;
}

function rowToModule(row: ModuleRow): CourseModule {
  return {
    id: row.id,
    communityId: row.community_id,
    title: row.title,
    description: row.description,
    status: row.status as CourseModule['status'],
    accessTierId: row.access_tier_id,
    sequence: row.sequence,
    tenantId: row.tenant_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToLesson(row: LessonRow): CourseLesson {
  return {
    id: row.id,
    moduleId: row.module_id,
    title: row.title,
    contentType: row.content_type as CourseLesson['contentType'],
    contentUrl: row.content_url,
    body: row.body,
    durationSecs: row.duration_secs,
    sequence: row.sequence,
    isFreePreview: row.is_free_preview === 1,
    tenantId: row.tenant_id,
    createdAt: row.created_at,
  };
}

/**
 * Create a course module.
 */
export async function createCourseModule(
  db: D1Like,
  input: {
    communityId: string;
    title: string;
    description?: string;
    accessTierId?: string;
    sequence?: number;
    tenantId: string;
  },
): Promise<CourseModule> {
  const id = generateId('mod');
  const now = Math.floor(Date.now() / 1000);
  await db
    .prepare(
      `INSERT INTO course_modules (id, community_id, title, description, status, access_tier_id, sequence, tenant_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'draft', ?, ?, ?, ?, ?)`,
    )
    .bind(id, input.communityId, input.title, input.description ?? null, input.accessTierId ?? null, input.sequence ?? 0, input.tenantId, now, now)
    .run();

  return {
    id,
    communityId: input.communityId,
    title: input.title,
    description: input.description ?? null,
    status: 'draft',
    accessTierId: input.accessTierId ?? null,
    sequence: input.sequence ?? 0,
    tenantId: input.tenantId,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * List published course modules for a community.
 */
export async function listCourseModules(
  db: D1Like,
  communityId: string,
  tenantId: string,
): Promise<CourseModule[]> {
  const { results } = await db
    .prepare(
      `SELECT * FROM course_modules WHERE community_id = ? AND tenant_id = ? ORDER BY sequence ASC`,
    )
    .bind(communityId, tenantId)
    .all<ModuleRow>();
  return results.map(rowToModule);
}

/**
 * Create a lesson within a module.
 */
export async function createLesson(
  db: D1Like,
  input: {
    moduleId: string;
    title: string;
    contentType: 'text' | 'video' | 'audio' | 'pdf';
    body?: string;
    contentUrl?: string;
    durationSecs?: number;
    sequence?: number;
    isFreePreview?: boolean;
    tenantId: string;
  },
): Promise<CourseLesson> {
  const id = generateId('les');
  const now = Math.floor(Date.now() / 1000);
  await db
    .prepare(
      `INSERT INTO course_lessons (id, module_id, title, content_type, content_url, body, duration_secs, sequence, is_free_preview, tenant_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      id, input.moduleId, input.title, input.contentType,
      input.contentUrl ?? null, input.body ?? null,
      input.durationSecs ?? null, input.sequence ?? 0,
      input.isFreePreview ? 1 : 0, input.tenantId, now,
    )
    .run();

  return {
    id,
    moduleId: input.moduleId,
    title: input.title,
    contentType: input.contentType,
    contentUrl: input.contentUrl ?? null,
    body: input.body ?? null,
    durationSecs: input.durationSecs ?? null,
    sequence: input.sequence ?? 0,
    isFreePreview: input.isFreePreview ?? false,
    tenantId: input.tenantId,
    createdAt: now,
  };
}

/**
 * Get a single lesson by ID.
 */
export async function getLesson(
  db: D1Like,
  lessonId: string,
  tenantId: string,
): Promise<CourseLesson | null> {
  const row = await db
    .prepare(`SELECT * FROM course_lessons WHERE id = ? AND tenant_id = ? LIMIT 1`)
    .bind(lessonId, tenantId)
    .first<LessonRow>();
  return row ? rowToLesson(row) : null;
}

/**
 * List lessons for a module.
 */
export async function listLessons(
  db: D1Like,
  moduleId: string,
  tenantId: string,
): Promise<CourseLesson[]> {
  const { results } = await db
    .prepare(`SELECT * FROM course_lessons WHERE module_id = ? AND tenant_id = ? ORDER BY sequence ASC`)
    .bind(moduleId, tenantId)
    .all<LessonRow>();
  return results.map(rowToLesson);
}

/**
 * Update lesson progress.
 */
export async function updateLessonProgress(
  db: D1Like,
  input: {
    lessonId: string;
    userId: string;
    progressPct: number;
    tenantId: string;
  },
): Promise<LessonProgress> {
  const id = generateId('prg');
  const now = Math.floor(Date.now() / 1000);
  const completedAt = input.progressPct >= 100 ? now : null;

  await db
    .prepare(
      `INSERT INTO lesson_progress (id, lesson_id, user_id, completed_at, progress_pct, tenant_id)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(lesson_id, user_id) DO UPDATE SET progress_pct = excluded.progress_pct, completed_at = excluded.completed_at`,
    )
    .bind(id, input.lessonId, input.userId, completedAt, input.progressPct, input.tenantId)
    .run();

  return {
    id,
    lessonId: input.lessonId,
    userId: input.userId,
    completedAt,
    progressPct: input.progressPct,
    tenantId: input.tenantId,
  };
}

/**
 * Get progress for a user on a lesson.
 */
export async function getLessonProgress(
  db: D1Like,
  lessonId: string,
  userId: string,
  tenantId: string,
): Promise<LessonProgress | null> {
  const row = await db
    .prepare(
      `SELECT * FROM lesson_progress WHERE lesson_id = ? AND user_id = ? AND tenant_id = ? LIMIT 1`,
    )
    .bind(lessonId, userId, tenantId)
    .first<ProgressRow>();
  if (!row) return null;
  return {
    id: row.id,
    lessonId: row.lesson_id,
    userId: row.user_id,
    completedAt: row.completed_at,
    progressPct: row.progress_pct,
    tenantId: row.tenant_id,
  };
}
