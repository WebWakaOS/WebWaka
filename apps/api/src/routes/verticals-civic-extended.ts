/**
 * Civic Extended router — 11 verticals (M8d/M11/M12)
 *
 * Verticals: mosque, youth-organization, womens-association, waste-management,
 *            book-club, professional-association, sports-club,
 *            campaign-office, constituency-office, ward-rep, ngo
 *
 * All routes prefixed at /api/v1/{slug}/*
 * Auth middleware registered per-slug in apps/api/src/router.ts
 * Platform Invariants: T3, P9, P12, P13
 * L3 HITL mandatory for: campaign-office, constituency-office, ward-rep
 * P13: ngo — no beneficiary PII to AI; L2 AI cap; Tier 2 KYC
 */

import { Hono } from 'hono';
import type { Env } from '../env.js';
import { mosqueRoutes } from './verticals/mosque.js';
import { youthOrganizationRoutes } from './verticals/youth-organization.js';
import { womensAssociationRoutes } from './verticals/womens-association.js';
import { wasteManagementRoutes } from './verticals/waste-management.js';
import { bookClubRoutes } from './verticals/book-club.js';
import { professionalAssociationRoutes } from './verticals/professional-association.js';
import { sportsClubRoutes } from './verticals/sports-club.js';
import { campaignOfficeRoutes } from './verticals/campaign-office.js';
import { constituencyOfficeRoutes } from './verticals/constituency-office.js';
import { wardRepRoutes } from './verticals/ward-rep.js';
import ngoRoutes from './verticals/ngo.js';

export const civicExtendedRoutes = new Hono<{ Bindings: Env }>();

civicExtendedRoutes.route('/mosque', mosqueRoutes);
civicExtendedRoutes.route('/youth-organization', youthOrganizationRoutes);
civicExtendedRoutes.route('/womens-association', womensAssociationRoutes);
civicExtendedRoutes.route('/waste-management', wasteManagementRoutes);
civicExtendedRoutes.route('/book-club', bookClubRoutes);
civicExtendedRoutes.route('/professional-association', professionalAssociationRoutes);
civicExtendedRoutes.route('/sports-club', sportsClubRoutes);
civicExtendedRoutes.route('/campaign-office', campaignOfficeRoutes);
civicExtendedRoutes.route('/constituency-office', constituencyOfficeRoutes);
civicExtendedRoutes.route('/ward-rep', wardRepRoutes);
civicExtendedRoutes.route('/ngo', ngoRoutes);
