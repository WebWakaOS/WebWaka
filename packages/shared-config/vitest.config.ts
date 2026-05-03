import { defineConfig, type Plugin } from 'vitest/config';

/**
 * Vite 8 injects `__vite_ssr_exportName__(name, getter)` calls in ssrTransform
 * output for every named export. vite-node 2.x does not define this global in
 * its execution context (it only provides __vite_ssr_import__, __vite_ssr_exports__,
 * __vite_ssr_exportAll__, __vite_ssr_dynamic_import__, __vite_ssr_import_meta__).
 *
 * This plugin prepends a one-liner shim to every transformed source file so
 * that the function is defined in the same scope before any export binding call.
 */
function viteSSRExportNameShim(): Plugin {
  return {
    name: 'vite-ssr-export-name-shim',
    transform(code, _id) {
      // Only inject for files that contain the injected call
      if (!code.includes('__vite_ssr_exportName__')) return null;
      const shim =
        `const __vite_ssr_exportName__ = ` +
        `(typeof globalThis.__vite_ssr_exportName__ === 'function') ` +
        `? globalThis.__vite_ssr_exportName__ ` +
        `: (_n, g) => { try { return g(); } catch { return undefined; } };\n`;
      return { code: shim + code, map: null };
    },
  };
}

export default defineConfig({
  plugins: [viteSSRExportNameShim()],
  test: {
    globals: true,
    environment: 'node',
    pool: 'forks',
    deps: {
      optimizer: {
        ssr: {
          enabled: true,
        },
      },
    },
    server: {
      deps: {
        inline: [/@webwaka\//],
      },
    },
    include: ['src/**/*.test.ts'],
  },
});
