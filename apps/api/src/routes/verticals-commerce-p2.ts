/**
 * Commerce P2 Batch 1 — Combined Router
 * M9 Set A (9 verticals)
 *
 * Mounts all 9 Commerce P2 Batch 1 vertical routers under their canonical slugs.
 * This combined router is mounted at /api/v1 in apps/api/src/index.ts.
 *
 * Routes:
 *   /auto-mechanic/...
 *   /bakery/...
 *   /beauty-salon/...
 *   /bookshop/...
 *   /catering/...
 *   /cleaning-service/...
 *   /electronics-repair/...
 *   /florist/...
 *   /food-vendor/...
 */

import { Hono } from 'hono';
import type { Env } from '../env.js';
import { autoMechanicRoutes } from './verticals/auto-mechanic.js';
import { bakeryRoutes } from './verticals/bakery.js';
import { beautySalonRoutes } from './verticals/beauty-salon.js';
import { bookshopRoutes } from './verticals/bookshop.js';
import { cateringRoutes } from './verticals/catering.js';
import { cleaningServiceRoutes } from './verticals/cleaning-service.js';
import { electronicsRepairRoutes } from './verticals/electronics-repair.js';
import { floristRoutes } from './verticals/florist.js';
import { foodVendorRoutes } from './verticals/food-vendor.js';

export const commerceP2Routes = new Hono<{ Bindings: Env }>();

commerceP2Routes.route('/auto-mechanic', autoMechanicRoutes);
commerceP2Routes.route('/bakery', bakeryRoutes);
commerceP2Routes.route('/beauty-salon', beautySalonRoutes);
commerceP2Routes.route('/bookshop', bookshopRoutes);
commerceP2Routes.route('/catering', cateringRoutes);
commerceP2Routes.route('/cleaning-service', cleaningServiceRoutes);
commerceP2Routes.route('/electronics-repair', electronicsRepairRoutes);
commerceP2Routes.route('/florist', floristRoutes);
commerceP2Routes.route('/food-vendor', foodVendorRoutes);
