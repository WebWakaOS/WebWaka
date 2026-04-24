#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';

const APPS_DIR = path.resolve(__dirname, '../../apps');
const EXEMPT_APPS = ['api', 'ussd-gateway', 'projections', 'partner-admin', 'notificator', 'schedulers'];

function hasManifestRoute(indexPath: string): boolean {
  if (!fs.existsSync(indexPath)) return false;
  const content = fs.readFileSync(indexPath, 'utf8');
  return content.includes('manifest.json');
}

function hasStaticManifest(appDir: string): boolean {
  return (
    fs.existsSync(path.join(appDir, 'public', 'manifest.json')) ||
    fs.existsSync(path.join(appDir, 'public', 'manifest.webmanifest'))
  );
}

function hasVitePWAConfig(appDir: string): boolean {
  const viteConfigs = ['vite.config.ts', 'vite.config.js', 'vite.config.mts'];
  for (const cfg of viteConfigs) {
    const cfgPath = path.join(appDir, cfg);
    if (fs.existsSync(cfgPath)) {
      const content = fs.readFileSync(cfgPath, 'utf8');
      if (content.includes('VitePWA') || content.includes('vite-plugin-pwa')) return true;
    }
  }
  return false;
}

function main(): void {
  const appDirs = fs.readdirSync(APPS_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  const violations: string[] = [];

  for (const app of appDirs) {
    if (EXEMPT_APPS.includes(app)) continue;

    const appDir = path.join(APPS_DIR, app);
    const gitkeep = path.join(appDir, '.gitkeep');
    if (fs.existsSync(gitkeep) && fs.readdirSync(appDir).length <= 1) continue;

    const indexTs = path.join(appDir, 'src', 'index.ts');
    const serverJs = path.join(appDir, 'server.js');

    const hasRoute = hasManifestRoute(indexTs) || hasManifestRoute(serverJs);
    const hasStatic = hasStaticManifest(appDir);
    const hasPWAPlugin = hasVitePWAConfig(appDir);

    if (!hasRoute && !hasStatic && !hasPWAPlugin) {
      violations.push(`apps/${app}: no manifest.json route, static manifest, or vite-plugin-pwa config found`);
    }
  }

  if (violations.length > 0) {
    console.error(`FAIL: ${violations.length} app(s) missing PWA manifest:`);
    for (const v of violations) console.error(`  - ${v}`);
    process.exit(1);
  }

  console.log('PASS: All client-facing apps have PWA manifest.');
}

main();
