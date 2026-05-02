/**
 * @webwaka/vertical-engine — Main Entry Point
 *
 * Phase 1: Vertical Consolidation
 * Replaces 159 individual vertical packages with a configuration-driven engine.
 */

// Schema types
export type {
  FieldType,
  FieldDef,
  FSMTransitionDef,
  FSMGuardDef,
  FSMConfig,
  SubEntityDef,
  VerticalAIConfig,
  RouteConfig,
  ComplianceDef,
  VerticalConfig,
  VerticalRegistry,
  RegistryStats,
  AICapabilityType,
  AIAutonomyLevel,
  PillarType,
} from './schema.js';

// Core engine
export { VerticalEngine } from './engine.js';
export { VerticalCRUD } from './crud.js';
export { FSMEngine } from './fsm.js';

// Registry
export { getRegistry, getVerticalConfig, listSlugs, getRegistryStats } from './registry.js';

// Generators
export { generateRoutes } from './generators/route-generator.js';

// Wave 3 additions
export { REGISTRY } from './registry.js';
export { generateAllRoutes } from './generators/route-generator.js';
