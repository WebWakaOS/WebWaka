/**
 * Commerce P3 — Combined Router
 * M10/M11/M12 Set C (16 verticals)
 *
 * Mounts all 16 Commerce P3 vertical routers under their canonical slugs.
 * This combined router is mounted at /api/v1 in apps/api/src/router.ts.
 *
 * Routes:
 *   /artisanal-mining/...
 *   /borehole-driller/...
 *   /building-materials/...
 *   /car-wash/...
 *   /cleaning-company/...
 *   /electrical-fittings/...
 *   /generator-dealer/...
 *   /hair-salon/...
 *   /petrol-station/...
 *   /phone-repair-shop/...
 *   /shoemaker/...
 *   /sole-trader/...
 *   /spare-parts/...
 *   /tyre-shop/...
 *   /used-car-dealer/...
 *   /water-vendor/...
 */

import { Hono } from 'hono';
import type { Env } from '../env.js';
import { artisanalMiningRoutes } from './verticals/artisanal-mining.js';
import { boreholeDrillerRoutes } from './verticals/borehole-driller.js';
import { buildingMaterialsRoutes } from './verticals/building-materials.js';
import { carWashRoutes } from './verticals/car-wash.js';
import { cleaningCompanyRoutes } from './verticals/cleaning-company.js';
import { electricalFittingsRoutes } from './verticals/electrical-fittings.js';
import { generatorDealerRoutes } from './verticals/generator-dealer.js';
import { hairSalonRoutes } from './verticals/hair-salon.js';
import { petrolStationRoutes } from './verticals/petrol-station.js';
import { phoneRepairShopRoutes } from './verticals/phone-repair-shop.js';
import { shoemakerRoutes } from './verticals/shoemaker.js';
import soleTraderRoutes from './verticals/sole-trader.js';
import { sparePartsRoutes } from './verticals/spare-parts.js';
import { tyreShopRoutes } from './verticals/tyre-shop.js';
import { usedCarDealerRoutes } from './verticals/used-car-dealer.js';
import { waterVendorRoutes } from './verticals/water-vendor.js';

export const commerceP3Routes = new Hono<{ Bindings: Env }>();

commerceP3Routes.route('/artisanal-mining', artisanalMiningRoutes);
commerceP3Routes.route('/borehole-driller', boreholeDrillerRoutes);
commerceP3Routes.route('/building-materials', buildingMaterialsRoutes);
commerceP3Routes.route('/car-wash', carWashRoutes);
commerceP3Routes.route('/cleaning-company', cleaningCompanyRoutes);
commerceP3Routes.route('/electrical-fittings', electricalFittingsRoutes);
commerceP3Routes.route('/generator-dealer', generatorDealerRoutes);
commerceP3Routes.route('/hair-salon', hairSalonRoutes);
commerceP3Routes.route('/petrol-station', petrolStationRoutes);
commerceP3Routes.route('/phone-repair-shop', phoneRepairShopRoutes);
commerceP3Routes.route('/shoemaker', shoemakerRoutes);
commerceP3Routes.route('/sole-trader', soleTraderRoutes);
commerceP3Routes.route('/spare-parts', sparePartsRoutes);
commerceP3Routes.route('/tyre-shop', tyreShopRoutes);
commerceP3Routes.route('/used-car-dealer', usedCarDealerRoutes);
commerceP3Routes.route('/water-vendor', waterVendorRoutes);
