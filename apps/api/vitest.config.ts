import { defineConfig } from 'vitest/config';
import path from 'path';
import fs from 'fs';

// Auto-map @webwaka/<pkg> → packages/<pkg>/src/index.ts
// Also handles packages/core/<pkg> and packages/verticals-<pkg> naming patterns
function buildWebwakaAliases(): Record<string, string> {
  const root = path.resolve(__dirname, '../../packages');
  const aliases: Record<string, string> = {};

  function tryAlias(pkgName: string, pkgDir: string) {
    const entry = path.join(pkgDir, 'src', 'index.ts');
    if (fs.existsSync(entry)) {
      aliases[`@webwaka/${pkgName}`] = entry;
    }
  }

  // Top-level packages
  for (const dir of fs.readdirSync(root)) {
    const full = path.join(root, dir);
    if (!fs.statSync(full).isDirectory()) continue;
    // Check if it's itself a package
    if (fs.existsSync(path.join(full, 'package.json'))) {
      // Extract name from package.json
      try {
        const pkg = JSON.parse(fs.readFileSync(path.join(full, 'package.json'), 'utf8'));
        const name = pkg.name?.replace('@webwaka/', '');
        if (name) tryAlias(name, full);
      } catch {}
    }
    // Check sub-packages (e.g. packages/core/geography)
    if (fs.statSync(full).isDirectory()) {
      for (const sub of fs.readdirSync(full)) {
        const subFull = path.join(full, sub);
        if (!fs.statSync(subFull).isDirectory()) continue;
        if (fs.existsSync(path.join(subFull, 'package.json'))) {
          try {
            const pkg = JSON.parse(fs.readFileSync(path.join(subFull, 'package.json'), 'utf8'));
            const name = pkg.name?.replace('@webwaka/', '');
            if (name) tryAlias(name, subFull);
          } catch {}
        }
      }
    }
  }

  return aliases;
}

export default defineConfig({
  resolve: {
    alias: buildWebwakaAliases(),
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.*.ts'],
  },
});
