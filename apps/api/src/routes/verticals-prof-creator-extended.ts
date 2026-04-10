/**
 * Professional + Creator Extended verticals aggregator router (M9–M12)
 * Mounts:
 *   /accounting-firm      — accounting-firm.ts (M9) — ICAN/ANAN, L2 AI
 *   /event-planner        — event-planner.ts (M9) — state licence, L2 AI
 *   /law-firm             — law-firm.ts (M9) — NBA, L3 HITL ALL AI, matter_ref_id opaque
 *   /funeral-home         — funeral-home.ts (M12) — L3 HITL ALL AI, case_ref_id opaque
 *   /pr-firm              — pr-firm.ts (M12) — NIPR, L2 AI
 *   /tax-consultant       — tax-consultant.ts (M12) — FIRS, L3 HITL ALL AI, TIN never AI
 *   /wedding-planner      — wedding-planner.ts (M12) — CAC verified, L2 AI
 *   /music-studio         — music-studio.ts (M10) — COSON, integer hours/bpm, L2 AI
 *   /photography-studio   — photography-studio.ts (M10) — CAC, L2 AI
 *   /recording-label      — recording-label.ts (M12) — COSON, bps arithmetic, L2 AI
 *   /talent-agency        — talent-agency.ts (M12) — NMMA, fee arithmetic, L2 AI
 */

import { Hono } from 'hono';
import type { Env } from '../types.js';

import accountingFirmRoutes from './verticals/accounting-firm.js';
import eventPlannerRoutes from './verticals/event-planner.js';
import lawFirmRoutes from './verticals/law-firm.js';
import funeralHomeRoutes from './verticals/funeral-home.js';
import prFirmRoutes from './verticals/pr-firm.js';
import taxConsultantRoutes from './verticals/tax-consultant.js';
import weddingPlannerRoutes from './verticals/wedding-planner.js';
import musicStudioRoutes from './verticals/music-studio.js';
import photographyStudioRoutes from './verticals/photography-studio.js';
import recordingLabelRoutes from './verticals/recording-label.js';
import talentAgencyRoutes from './verticals/talent-agency.js';

const router = new Hono<{ Bindings: Env }>();

router.route('/accounting-firm', accountingFirmRoutes);
router.route('/event-planner', eventPlannerRoutes);
router.route('/law-firm', lawFirmRoutes);
router.route('/funeral-home', funeralHomeRoutes);
router.route('/pr-firm', prFirmRoutes);
router.route('/tax-consultant', taxConsultantRoutes);
router.route('/wedding-planner', weddingPlannerRoutes);
router.route('/music-studio', musicStudioRoutes);
router.route('/photography-studio', photographyStudioRoutes);
router.route('/recording-label', recordingLabelRoutes);
router.route('/talent-agency', talentAgencyRoutes);

export default router;
