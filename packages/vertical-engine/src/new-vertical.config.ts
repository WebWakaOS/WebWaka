/**
 * new-vertical.config.ts — Wave 3 B4-5
 * Template for adding a new vertical to the WebWaka engine registry.
 *
 * Usage:
 *   1. Copy this file to a scratch file.
 *   2. Fill in all TODO fields.
 *   3. Paste the config object into REGISTRY in registry.ts.
 *   4. Run: pnpm run generate:vertical <slug> (calls scripts/generate-vertical.ts)
 *
 * Or use the generator directly:
 *   pnpm run generate:vertical my-new-vertical --pillar 1 --milestone M9
 */

import type { VerticalConfig } from './schema.js';

/**
 * TEMPLATE — replace all TODO placeholders before merging.
 * Delete this comment when the config is production-ready.
 */
export const NEW_VERTICAL_TEMPLATE: VerticalConfig = {
  // TODO: Replace with your vertical's URL-safe slug (lowercase, hyphens only)
  slug: 'TODO-slug',

  // TODO: Human-readable name shown in UI
  displayName: 'TODO Display Name',

  // TODO: 1 = Commerce, 2 = Civic, 3 = Government
  primaryPillar: 1,

  // TODO: Milestone (M8, M9, M10, etc.)
  milestone: 'M9',

  // TODO: 'full' (complete implementation), 'basic' (core only), 'stub' (placeholder)
  maturity: 'stub',

  // TODO: DB table name (snake_case, ends with _profiles)
  tableName: 'TODO_profiles',

  // TODO: 'organization' or 'individual'
  entityType: 'organization',

  profileFields: [
    // TODO: Add fields from your DB schema
    // Format: { column: 'col_name', property: 'propName', type: 'string'|'integer'|'boolean'|'timestamp', required?: true, nullable?: true, label: 'Field Label' }
    {
      column: 'business_name',
      property: 'businessName',
      type: 'string',
      required: true,
      label: 'Business Name',
    },
  ],

  // TODO: Fields required on creation
  createFields: ['businessName'],

  // TODO: Fields that can be updated after creation
  updateFields: ['businessName'],

  fsm: {
    // TODO: Define your state machine
    // Standard states: seeded → claimed → [verified] → active → suspended
    states: ['seeded', 'claimed', 'active', 'suspended'],
    initialState: 'seeded',
    transitions: [
      { from: 'seeded', to: 'claimed' },
      { from: 'claimed', to: 'active' },
      { from: 'active', to: 'suspended' },
      { from: 'suspended', to: 'active' },
    ],
    // TODO: Add guards if transitions require field validation
    // guards: [
    //   { name: 'requireLicence', requiredFields: ['licenceNumber'], rule: 'licenceNumber not null', failureMessage: 'Licence required' },
    // ],
  },

  // TODO: Sub-entities (leave empty if none)
  subEntities: [],

  ai: {
    // TODO: 1 = assistant reads data; 2 = assistant can suggest; 3 = assistant can act
    autonomyLevel: 1,
    // TODO: Capabilities from the AI catalogue
    allowedCapabilities: ['bio_generator'],
    useCases: ['Generate business profile bio'],
  },

  route: {
    // TODO: URL base path (starts with /)
    basePath: '/TODO-slug',
    // TODO: Entitlement layer — 'Commerce' | 'Civic' | 'Government' | 'Transport'
    entitlementLayer: 'Commerce',
  },

  compliance: {
    // TODO: KYC tier required before claiming (0=none, 1=basic, 2=enhanced, 3=full)
    kycTierForClaim: 1,
    // TODO: Required licences (empty if none)
    // requiredLicences: ['CAC'],
    // TODO: NDPR data level ('standard' | 'sensitive' | 'critical')
    ndprLevel: 'standard',
  },
};

export default NEW_VERTICAL_TEMPLATE;
