/**
 * Template Manifest Validator — WebWaka 1.0.1
 * Sprint 1, Task 1.4
 *
 * Validates template manifest structure, semver compatibility, and vertical compatibility.
 * Used by: template registry API (server-side), @webwaka/template-validator CLI (client-side).
 *
 * Platform Invariants:
 *   T2 — TypeScript strict
 *   T4 — price_kobo must be integer
 *   P1 — reusable validation primitives
 */

export interface TemplateManifest {
  id?: string;
  slug: string;
  display_name: string;
  description: string;
  template_type: TemplateType;
  version: string;
  platform_compat: string;
  compatible_verticals: string[];
  author?: {
    name: string;
    tenant_id?: string | null;
    contact?: string;
  };
  permissions?: string[];
  entrypoints?: {
    dashboard?: string | null;
    public_site?: string | null;
    api_extension?: string | null;
  };
  config_schema?: Record<string, unknown>;
  events?: string[];
  dependencies?: {
    templates?: string[];
    platform_packages?: string[];
  };
  pricing?: {
    model: 'free' | 'one_time' | 'subscription';
    price_kobo: number;
  };
}

export type TemplateType = 'dashboard' | 'website' | 'vertical-blueprint' | 'workflow' | 'email' | 'module';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

const VALID_TEMPLATE_TYPES: readonly TemplateType[] = ['dashboard', 'website', 'vertical-blueprint', 'workflow', 'email', 'module'];

const VALID_PERMISSIONS = [
  'read:workspace',
  'read:members',
  'write:members',
  'read:offerings',
  'write:offerings',
  'read:analytics',
  'write:analytics',
  'read:claims',
  'write:claims',
  'read:payments',
  'write:payments',
  'read:branding',
  'write:branding',
  'read:verticals',
  'write:verticals',
  'read:community',
  'write:community',
  'read:social',
  'write:social',
  'read:pos',
  'write:pos',
  'read:superagent',
  'write:superagent',
] as const;

const VALID_PRICING_MODELS = ['free', 'one_time', 'subscription'] as const;

export function isValidSemver(version: string): boolean {
  return /^\d+\.\d+\.\d+(-[\w.]+)?(\+[\w.]+)?$/.test(version);
}

export function isValidSemverRange(range: string): boolean {
  if (!range || range.length === 0 || range.length > 100) return false;
  return /^[\^~]?\d+\.\d+\.\d+$/.test(range) || /^>=\d+\.\d+\.\d+$/.test(range);
}

export function parseSemver(version: string): [number, number, number] | null {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!match) return null;
  return [parseInt(match[1]!, 10), parseInt(match[2]!, 10), parseInt(match[3]!, 10)];
}

export function checkPlatformCompatibility(manifestPlatformCompat: string, platformVersion: string): boolean {
  const pv = parseSemver(platformVersion);
  if (!pv) return false;
  const [vMajor, vMinor, vPatch] = pv;

  if (manifestPlatformCompat.startsWith('^')) {
    const rv = parseSemver(manifestPlatformCompat.slice(1));
    if (!rv) return false;
    const [rMajor, rMinor, rPatch] = rv;
    if (vMajor !== rMajor) return false;
    if (rMajor === 0) {
      if (vMinor !== rMinor) return false;
      return vPatch >= rPatch;
    }
    if (vMinor > rMinor) return true;
    if (vMinor === rMinor) return vPatch >= rPatch;
    return false;
  }

  if (manifestPlatformCompat.startsWith('~')) {
    const rv = parseSemver(manifestPlatformCompat.slice(1));
    if (!rv) return false;
    const [rMajor, rMinor, rPatch] = rv;
    if (vMajor !== rMajor || vMinor !== rMinor) return false;
    return vPatch >= rPatch;
  }

  if (manifestPlatformCompat.startsWith('>=')) {
    const rv = parseSemver(manifestPlatformCompat.slice(2));
    if (!rv) return false;
    const [rMajor, rMinor, rPatch] = rv;
    if (vMajor > rMajor) return true;
    if (vMajor === rMajor && vMinor > rMinor) return true;
    if (vMajor === rMajor && vMinor === rMinor) return vPatch >= rPatch;
    return false;
  }

  return platformVersion === manifestPlatformCompat;
}

export function checkVerticalCompatibility(manifestVerticals: string[], targetVertical: string): boolean {
  if (manifestVerticals.length === 0) return true;
  return manifestVerticals.includes(targetVertical);
}

export function validateTemplateManifest(manifest: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!manifest || typeof manifest !== 'object') {
    return { valid: false, errors: ['Manifest must be a non-null object'], warnings: [] };
  }

  const m = manifest as Record<string, unknown>;

  if (!m.slug || typeof m.slug !== 'string') {
    errors.push('Missing or invalid "slug": must be a non-empty string');
  } else {
    if (m.slug.length < 2 || m.slug.length > 100) {
      errors.push('"slug" must be between 2 and 100 characters');
    }
    if (!/^[a-z0-9-]+$/.test(m.slug)) {
      errors.push('"slug" must contain only lowercase letters, digits, and hyphens');
    }
  }

  if (!m.display_name || typeof m.display_name !== 'string' || m.display_name.length < 2) {
    errors.push('Missing or invalid "display_name": must be a string with at least 2 characters');
  }

  if (!m.description || typeof m.description !== 'string' || m.description.length < 10) {
    errors.push('Missing or invalid "description": must be a string with at least 10 characters');
  }

  if (!m.template_type || !VALID_TEMPLATE_TYPES.includes(m.template_type as TemplateType)) {
    errors.push(`Missing or invalid "template_type": must be one of ${VALID_TEMPLATE_TYPES.join(', ')}`);
  }

  if (!m.version || typeof m.version !== 'string' || !isValidSemver(m.version)) {
    errors.push('Missing or invalid "version": must be valid semver (e.g., "1.0.0")');
  }

  if (!m.platform_compat || typeof m.platform_compat !== 'string' || !isValidSemverRange(m.platform_compat)) {
    errors.push('Missing or invalid "platform_compat": must be a valid semver range (e.g., "^1.0.0")');
  }

  if (m.compatible_verticals !== undefined) {
    if (!Array.isArray(m.compatible_verticals)) {
      errors.push('"compatible_verticals" must be an array of strings');
    } else {
      for (const v of m.compatible_verticals) {
        if (typeof v !== 'string' || !/^[a-z0-9-]+$/.test(v)) {
          errors.push(`Invalid vertical slug in "compatible_verticals": "${v}"`);
        }
      }
    }
  }

  if (m.permissions !== undefined) {
    if (!Array.isArray(m.permissions)) {
      errors.push('"permissions" must be an array of strings');
    } else {
      for (const p of m.permissions) {
        if (!VALID_PERMISSIONS.includes(p as typeof VALID_PERMISSIONS[number])) {
          warnings.push(`Unknown permission: "${p}" — may not be supported by the platform`);
        }
      }
    }
  }

  if (m.pricing !== undefined) {
    const pricing = m.pricing as Record<string, unknown>;
    if (typeof pricing !== 'object' || pricing === null) {
      errors.push('"pricing" must be an object');
    } else {
      if (!pricing.model || !VALID_PRICING_MODELS.includes(pricing.model as typeof VALID_PRICING_MODELS[number])) {
        errors.push(`Invalid "pricing.model": must be one of ${VALID_PRICING_MODELS.join(', ')}`);
      }
      if (pricing.price_kobo !== undefined) {
        if (!Number.isInteger(pricing.price_kobo) || (pricing.price_kobo as number) < 0) {
          errors.push('"pricing.price_kobo" must be a non-negative integer (T4: integer kobo only)');
        }
      }
      if (pricing.model === 'free' && pricing.price_kobo && (pricing.price_kobo as number) > 0) {
        warnings.push('"pricing.model" is "free" but "pricing.price_kobo" > 0 — price will be ignored');
      }
    }
  }

  if (m.entrypoints !== undefined) {
    if (typeof m.entrypoints !== 'object' || m.entrypoints === null) {
      errors.push('"entrypoints" must be an object');
    } else {
      const templateType = m.template_type as string;
      const ep = m.entrypoints as Record<string, unknown>;
      if (templateType === 'dashboard' && !ep.dashboard) {
        warnings.push('Dashboard template should have "entrypoints.dashboard" defined');
      }
      if (templateType === 'website' && !ep.public_site) {
        warnings.push('Website template should have "entrypoints.public_site" defined');
      }
    }
  }

  if (m.events !== undefined) {
    if (!Array.isArray(m.events)) {
      errors.push('"events" must be an array of strings');
    } else {
      for (const e of m.events) {
        if (typeof e !== 'string' || e.length === 0) {
          errors.push(`Invalid event in "events": must be a non-empty string`);
        }
      }
    }
  }

  if (m.author !== undefined) {
    const author = m.author as Record<string, unknown>;
    if (typeof author !== 'object' || author === null) {
      errors.push('"author" must be an object');
    } else {
      if (!author.name || typeof author.name !== 'string') {
        errors.push('"author.name" is required and must be a string');
      }
    }
  }

  if (m.dependencies !== undefined) {
    const deps = m.dependencies as Record<string, unknown>;
    if (typeof deps !== 'object' || deps === null) {
      errors.push('"dependencies" must be an object');
    } else {
      if (deps.templates !== undefined && !Array.isArray(deps.templates)) {
        errors.push('"dependencies.templates" must be an array');
      }
      if (deps.platform_packages !== undefined && !Array.isArray(deps.platform_packages)) {
        errors.push('"dependencies.platform_packages" must be an array');
      }
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}
