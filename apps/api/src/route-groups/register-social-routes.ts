/**
 * Route Group: Social, Community & Groups Routes
 * ARC-07 router split — Phase 0.5
 */
import type { Hono } from 'hono';
import type { Env } from '../env.js';
import { authMiddleware } from '../middleware/auth.js';
import { auditLogMiddleware } from '../middleware/audit-log.js';
import { assertDMMasterKey } from '@webwaka/social';
import { communityRoutes } from '../routes/community.js';
import { socialRoutes } from '../routes/social.js';
import { supportGroupRoutes } from '../routes/support-groups.js';
import { groupRoutes } from '../routes/groups.js';
import { casesRoutes } from '../routes/cases.js';
import { fundraisingRoutes } from '../routes/fundraising.js';
import { duesRoutes } from '../routes/dues.js';
import { mutualAidRoutes } from '../routes/mutual-aid.js';
import { workflowRoutes } from '../routes/workflows.js';
import { phase2AnalyticsRoutes } from '../routes/phase2-analytics.js';
import { pollsRoutes } from '../routes/polls.js';
import { communityReportRoutes } from '../routes/community-reports.js';
import { appealsRoutes } from '../routes/appeals.js';

export function registerSocialRoutes(app: Hono<{ Bindings: Env }>): void {
  // -------------------------------------------------------------------------
  // M7c: Community routes — join requires auth (P10 NDPR), reads are public (T3)
  // -------------------------------------------------------------------------

  app.use('/community/join', authMiddleware);
  app.use('/community/channels/*/posts', authMiddleware);
  app.use('/community/lessons/*/progress', authMiddleware);
  app.use('/community/events/*/rsvp', authMiddleware);
  app.route('/community', communityRoutes);

  // -------------------------------------------------------------------------
  // M7c: Social routes — most require auth; /social/profile/:handle is public
  // P14 — assert DM_MASTER_KEY is present at startup before routes are wired.
  // -------------------------------------------------------------------------

  app.use('/social/*', async (c, next) => {
    if (c.req.path.includes('/dm/threads')) {
      assertDMMasterKey(c.env.DM_MASTER_KEY);
    }
    await next();
  });
  app.use('/social/profile/setup', authMiddleware);
  app.use('/social/follow/*', authMiddleware);
  app.use('/social/feed', authMiddleware);
  app.use('/social/posts', authMiddleware);
  app.use('/social/posts/*/react', authMiddleware);
  app.use('/social/dm/*', authMiddleware);
  app.use('/social/stories', authMiddleware);
  app.route('/social', socialRoutes);

  // -------------------------------------------------------------------------
  // Support Groups — 3-in-1: Operations / Branding / Discovery
  // -------------------------------------------------------------------------

  app.use('/support-groups', authMiddleware);
  app.use('/support-groups', auditLogMiddleware);
  app.use('/support-groups/:id', authMiddleware);
  app.use('/support-groups/:id', auditLogMiddleware);
  app.use('/support-groups/:id/*', authMiddleware);
  app.use('/support-groups/:id/*', auditLogMiddleware);
  app.use('/support-groups/petitions/:petitionId/sign', authMiddleware);
  app.use('/support-groups/petitions/:petitionId/sign', auditLogMiddleware);
  app.route('/support-groups', supportGroupRoutes);

  // -------------------------------------------------------------------------
  // Groups — Phase 0 rename: /groups replaces /support-groups
  // -------------------------------------------------------------------------

  app.use('/groups', authMiddleware);
  app.use('/groups', auditLogMiddleware);
  app.use('/groups/:id', authMiddleware);
  app.use('/groups/:id', auditLogMiddleware);
  app.use('/groups/:id/*', authMiddleware);
  app.use('/groups/:id/*', auditLogMiddleware);
  app.use('/groups/petitions/:petitionId/sign', authMiddleware);
  app.use('/groups/petitions/:petitionId/sign', auditLogMiddleware);
  app.route('/groups', groupRoutes);

  // -------------------------------------------------------------------------
  // Cases — Phase 1 case management
  // -------------------------------------------------------------------------

  app.use('/cases', authMiddleware);
  app.use('/cases', auditLogMiddleware);
  app.use('/cases/:id', authMiddleware);
  app.use('/cases/:id', auditLogMiddleware);
  app.use('/cases/:id/*', authMiddleware);
  app.use('/cases/:id/*', auditLogMiddleware);
  app.use('/cases/summary', authMiddleware);
  app.use('/cases/summary', auditLogMiddleware);
  app.route('/cases', casesRoutes);

  // -------------------------------------------------------------------------
  // Fundraising — shared campaign engine
  // -------------------------------------------------------------------------

  app.use('/fundraising/campaigns', authMiddleware);
  app.use('/fundraising/campaigns', auditLogMiddleware);
  app.use('/fundraising/campaigns/*', authMiddleware);
  app.use('/fundraising/campaigns/*', auditLogMiddleware);
  app.route('/fundraising', fundraisingRoutes);

  // -------------------------------------------------------------------------
  // Phase 2 — Value Movement: Dues Collection (FR-VM-15)
  // -------------------------------------------------------------------------
  app.use('/dues/*', authMiddleware);
  app.use('/dues/*', auditLogMiddleware);
  app.route('/dues', duesRoutes);

  // -------------------------------------------------------------------------
  // Phase 2 — Value Movement: Mutual Aid (FR-VM-16)
  // -------------------------------------------------------------------------
  app.use('/mutual-aid', authMiddleware);
  app.use('/mutual-aid', auditLogMiddleware);
  app.use('/mutual-aid/*', authMiddleware);
  app.use('/mutual-aid/*', auditLogMiddleware);
  app.route('/mutual-aid', mutualAidRoutes);

  // -------------------------------------------------------------------------
  // Phase 2 — Workflow Engine
  // -------------------------------------------------------------------------
  app.use('/workflows/*', authMiddleware);
  app.use('/workflows/*', auditLogMiddleware);
  app.route('/workflows', workflowRoutes);

  // -------------------------------------------------------------------------
  // Phase 2 — Analytics (M12 gate: 3 workspace metrics)
  // -------------------------------------------------------------------------
  app.use('/analytics/v2/*', authMiddleware);
  app.route('/analytics/v2', phase2AnalyticsRoutes);

  // -------------------------------------------------------------------------
  // Phase 2 — Group Polls/Surveys (T006)
  // -------------------------------------------------------------------------
  app.use('/groups/:groupId/polls', authMiddleware);
  app.use('/groups/:groupId/polls/*', authMiddleware);
  app.route('/groups', pollsRoutes);

  // -------------------------------------------------------------------------
  // Phase 2 — Community Reporting / Content Flags (T008)
  // -------------------------------------------------------------------------
  app.use('/content-flags', authMiddleware);
  app.use('/content-flags', auditLogMiddleware);
  app.use('/content-flags/*', authMiddleware);
  app.use('/content-flags/*', auditLogMiddleware);
  app.route('/content-flags', communityReportRoutes);

  // -------------------------------------------------------------------------
  // Phase 5 (E32) — Moderation Appeal Flow
  // -------------------------------------------------------------------------
  app.use('/appeals', authMiddleware);
  app.use('/appeals/*', authMiddleware);
  app.use('/appeals', auditLogMiddleware);
  app.use('/appeals/*', auditLogMiddleware);
  app.route('/appeals', appealsRoutes);
}
