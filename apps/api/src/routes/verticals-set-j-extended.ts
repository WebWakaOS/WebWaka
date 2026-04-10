/**
 * Aggregator router — Set J Extended (27 verticals, migrations 0154-0180)
 * Mount this in apps/api/src/index.ts under /v1/verticals
 */
import { Hono } from 'hono';
import type { Env } from '../env.js';

import { hotelRoutes }                   from './verticals/hotel.js';
import { handymanRoutes }                from './verticals/handyman.js';
import { logisticsDeliveryRoutes }       from './verticals/logistics-delivery.js';
import { pharmacyChainRoutes }           from './verticals/pharmacy-chain.js';
import { furnitureMakerRoutes }          from './verticals/furniture-maker.js';
import { gasDistributorRoutes }          from './verticals/gas-distributor.js';
import { generatorRepairRoutes }         from './verticals/generator-repair.js';
import { itSupportRoutes }               from './verticals/it-support.js';
import { laundryRoutes }                 from './verticals/laundry.js';
import { opticianRoutes }                from './verticals/optician.js';
import { gymFitnessRoutes }              from './verticals/gym-fitness.js';
import { printingPressRoutes }           from './verticals/printing-press.js';
import { landSurveyorRoutes }            from './verticals/land-surveyor.js';
import { okadaKekeRoutes }               from './verticals/okada-keke.js';
import { laundryServiceRoutes }          from './verticals/laundry-service.js';
import { ironSteelRoutes }               from './verticals/iron-steel.js';
import { internetCafeRoutes }            from './verticals/internet-cafe.js';
import { motorcycleAccessoriesRoutes }   from './verticals/motorcycle-accessories.js';
import { paintsDistributorRoutes }       from './verticals/paints-distributor.js';
import { plumbingSuppliesRoutes }        from './verticals/plumbing-supplies.js';
import { ministryMissionRoutes }         from './verticals/ministry-mission.js';
import { marketAssociationRoutes }       from './verticals/market-association.js';
import { motivationalSpeakerRoutes }     from './verticals/motivational-speaker.js';
import { govtSchoolRoutes }              from './verticals/govt-school.js';
import { nurserySchoolRoutes }           from './verticals/nursery-school.js';
import { orphanageRoutes }               from './verticals/orphanage.js';
import { oilGasServicesRoutes }          from './verticals/oil-gas-services.js';

export const setJExtendedRouter = new Hono<{ Bindings: Env }>();

setJExtendedRouter.route('/hotel',                  hotelRoutes);
setJExtendedRouter.route('/handyman',               handymanRoutes);
setJExtendedRouter.route('/logistics-delivery',     logisticsDeliveryRoutes);
setJExtendedRouter.route('/pharmacy-chain',         pharmacyChainRoutes);
setJExtendedRouter.route('/furniture-maker',        furnitureMakerRoutes);
setJExtendedRouter.route('/gas-distributor',        gasDistributorRoutes);
setJExtendedRouter.route('/generator-repair',       generatorRepairRoutes);
setJExtendedRouter.route('/it-support',             itSupportRoutes);
setJExtendedRouter.route('/laundry',                laundryRoutes);
setJExtendedRouter.route('/optician',               opticianRoutes);
setJExtendedRouter.route('/gym-fitness',            gymFitnessRoutes);
setJExtendedRouter.route('/printing-press',         printingPressRoutes);
setJExtendedRouter.route('/land-surveyor',          landSurveyorRoutes);
setJExtendedRouter.route('/okada-keke',             okadaKekeRoutes);
setJExtendedRouter.route('/laundry-service',        laundryServiceRoutes);
setJExtendedRouter.route('/iron-steel',             ironSteelRoutes);
setJExtendedRouter.route('/internet-cafe',          internetCafeRoutes);
setJExtendedRouter.route('/motorcycle-accessories', motorcycleAccessoriesRoutes);
setJExtendedRouter.route('/paints-distributor',     paintsDistributorRoutes);
setJExtendedRouter.route('/plumbing-supplies',      plumbingSuppliesRoutes);
setJExtendedRouter.route('/ministry-mission',       ministryMissionRoutes);
setJExtendedRouter.route('/market-association',     marketAssociationRoutes);
setJExtendedRouter.route('/motivational-speaker',   motivationalSpeakerRoutes);
setJExtendedRouter.route('/govt-school',            govtSchoolRoutes);
setJExtendedRouter.route('/nursery-school',         nurserySchoolRoutes);
setJExtendedRouter.route('/orphanage',              orphanageRoutes);
setJExtendedRouter.route('/oil-gas-services',       oilGasServicesRoutes);
