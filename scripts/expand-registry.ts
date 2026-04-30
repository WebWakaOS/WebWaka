#!/usr/bin/env tsx
/**
 * Registry Expansion Script
 * 
 * Expands the vertical-engine registry with the remaining 154 verticals
 * from VERTICAL_AI_CONFIGS, creating minimal "stub" entries for each.
 * 
 * Phase 1 Task 1.8: Create complete registry with all 159+ vertical definitions
 */

import { VERTICAL_AI_CONFIGS } from '../packages/superagent/src/vertical-ai-config.js';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Read the existing registry to preserve the 5 manually-created entries
const registryPath = join(process.cwd(), 'packages/vertical-engine/src/registry.ts');
const existingRegistry = readFileSync(registryPath, 'utf-8');

// Extract existing slugs from current registry (bakery, hotel, pharmacy, gym, church)
const existingSlugs = new Set(['bakery', 'hotel', 'pharmacy', 'gym', 'church']);

// Get all vertical slugs from the AI config (excluding deprecated aliases)
const deprecatedAliases = ['mass-transit', 'hospital', 'artisan', 'gym-fitness', 'laundry-service'];
const allVerticals = Object.entries(VERTICAL_AI_CONFIGS).filter(
  ([slug]) => !deprecatedAliases.includes(slug)
);

console.log(`Total verticals in VERTICAL_AI_CONFIGS: ${allVerticals.length}`);
console.log(`Already in registry: ${existingSlugs.size}`);
console.log(`To be added: ${allVerticals.length - existingSlugs.size}`);

// Generate stub config entries for missing verticals
const newEntries: string[] = [];

for (const [slug, aiConfig] of allVerticals) {
  if (existingSlugs.has(slug)) {
    continue; // Skip already-defined entries
  }

  // Create a minimal stub config that conforms to VerticalConfig schema
  const displayName = slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const entry = `
  '${slug}': {
    slug: '${slug}',
    displayName: '${displayName}',
    primaryPillar: ${aiConfig.primaryPillar},
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: '${slug.replace(/-/g, '_')}_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: '${displayName}' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ${JSON.stringify([...aiConfig.allowedCapabilities])},
      ${aiConfig.prohibitedCapabilities ? `prohibitedCapabilities: ${JSON.stringify([...aiConfig.prohibitedCapabilities])},` : ''}
      useCases: ${JSON.stringify(aiConfig.aiUseCases)},
      ${aiConfig.contextWindowTokens ? `contextWindowTokens: ${aiConfig.contextWindowTokens},` : ''}
    },
    route: {
      basePath: '/${slug}',
      entitlementLayer: ${aiConfig.primaryPillar === 1 ? "'Civic'" : aiConfig.primaryPillar === 2 ? "'Commerce'" : "'Operational'"},
    },
  },`;

  newEntries.push(entry);
}

// Find the position to insert new entries (after the last existing entry, before closing brace)
const registryClosingBraceMatch = existingRegistry.match(/^};$/m);
if (!registryClosingBraceMatch || !registryClosingBraceMatch.index) {
  throw new Error('Could not find registry closing brace');
}

const insertPosition = registryClosingBraceMatch.index;

// Construct the new registry content
const updatedRegistry = 
  existingRegistry.slice(0, insertPosition) +
  newEntries.join('\n') +
  '\n' +
  existingRegistry.slice(insertPosition);

// Write the updated registry
writeFileSync(registryPath, updatedRegistry, 'utf-8');

console.log(`\n✅ Registry expanded successfully!`);
console.log(`   Added ${newEntries.length} stub entries`);
console.log(`   Total verticals in registry: ${allVerticals.length}`);
console.log(`\nNext steps:`);
console.log(`1. Review generated stubs in packages/vertical-engine/src/registry.ts`);
console.log(`2. Run: pnpm run typecheck`);
console.log(`3. Run: pnpm run test`);
console.log(`4. Commit and push to staging`);
