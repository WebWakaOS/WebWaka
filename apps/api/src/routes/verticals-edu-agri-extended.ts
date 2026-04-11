/**
 * Education + Agricultural Extended verticals aggregator router (M9–M12)
 * Mounts:
 *   /driving-school       — driving-school.ts (M9)
 *   /training-institute   — training-institute.ts (M9)
 *   /creche               — creche.ts (M12) — L3 HITL ALL AI
 *   /private-school       — private-school.ts (M12)
 *   /agro-input           — agro-input.ts (M10)
 *   /cold-room            — cold-room.ts (M10) — integer millidegrees temp
 *   /abattoir             — abattoir.ts (M12)
 *   /cassava-miller       — cassava-miller.ts (M12)
 *   /cocoa-exporter       — cocoa-exporter.ts (M12) — KYC T3 mandatory
 *   /fish-market          — fish-market.ts (M12) — integer grams + expiry
 *   /food-processing      — food-processing.ts (M12) — NAFDAC traceability
 *   /palm-oil             — palm-oil.ts (M12) — integer ml
 *   /vegetable-garden     — vegetable-garden.ts (M12) — 3-state FSM
 */

import { Hono } from 'hono';
import type { Env } from '../types.js';

import drivingSchoolRoutes from './verticals/driving-school.js';
import trainingInstituteRoutes from './verticals/training-institute.js';
import crecheRoutes from './verticals/creche.js';
import privateSchoolRoutes from './verticals/private-school.js';
import agroInputRoutes from './verticals/agro-input.js';
import coldRoomRoutes from './verticals/cold-room.js';
import abattoirRoutes from './verticals/abattoir.js';
import cassavaMillerRoutes from './verticals/cassava-miller.js';
import cocoaExporterRoutes from './verticals/cocoa-exporter.js';
import fishMarketRoutes from './verticals/fish-market.js';
import foodProcessingRoutes from './verticals/food-processing.js';
import palmOilRoutes from './verticals/palm-oil.js';
import vegetableGardenRoutes from './verticals/vegetable-garden.js';

const router = new Hono<{ Bindings: Env }>();

router.route('/driving-school', drivingSchoolRoutes);
router.route('/training-institute', trainingInstituteRoutes);
router.route('/creche', crecheRoutes);
router.route('/private-school', privateSchoolRoutes);
router.route('/agro-input', agroInputRoutes);
router.route('/cold-room', coldRoomRoutes);
router.route('/abattoir', abattoirRoutes);
router.route('/cassava-miller', cassavaMillerRoutes);
router.route('/cocoa-exporter', cocoaExporterRoutes);
router.route('/fish-market', fishMarketRoutes);
router.route('/food-processing', foodProcessingRoutes);
router.route('/palm-oil', palmOilRoutes);
router.route('/vegetable-garden', vegetableGardenRoutes);

export default router;
