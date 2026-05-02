import { defineConfig } from 'vitest/config';
import path from 'path';
import fs from 'fs';

function buildWebwakaAliases(): Record<string, string> {
  const root = path.resolve(__dirname, '../../packages');
  const aliases: Record<string, string> = {};

  function tryAlias(pkgName: string, pkgDir: string) {
    const entry = path.join(pkgDir, 'src', 'index.ts');
    if (fs.existsSync(entry)) {
      aliases[`@webwaka/${pkgName}`] = entry;
    }
  }

  for (const dir of fs.readdirSync(root)) {
    const full = path.join(root, dir);
    if (!fs.statSync(full).isDirectory()) continue;
    if (fs.existsSync(path.join(full, 'package.json'))) {
      try {
        const pkg = JSON.parse(fs.readFileSync(path.join(full, 'package.json'), 'utf8'));
        const name = pkg.name?.replace('@webwaka/', '');
        if (name) tryAlias(name, full);
      } catch {}
    }
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
  esbuild: {
    target: 'node20',
  },
  resolve: {
    alias: buildWebwakaAliases(),
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'],
  },
  test: {
    globals: true,
    environment: 'node',
    pool: 'vmForks',
    // 'web' transform mode uses Vite's browser-side ESM transform instead of the
    // SSR module runner. This avoids Vite 8 + Vitest 1.x incompatibilities:
    //   - __vite_ssr_exportName__ is not defined / not a function
    //   - Barrel re-export circular evaluation causing const objects to be undefined
    // See: https://vitest.dev/config/#transformmode
    environmentOptions: {},
    deps: {
      interopDefault: true,
    },
    setupFiles: ['./src/__vitest_setup__.ts'],
    include: ['src/**/*.test.ts', 'src/**/*.test.*.ts'],
    server: {
      deps: {
        // Force all @webwaka/* packages to be transformed by Vite 
        // rather than served as-is from node_modules
        inline: [/@webwaka\//],
        external: [],
      },
    },
  },
});
