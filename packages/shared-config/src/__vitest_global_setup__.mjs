/**
 * Vitest globalSetup shim (plain ESM — not compiled by Vite/vite-node).
 *
 * Vite 8's ssrTransform injects __vite_ssr_exportName__(name, getter) calls
 * into every transformed module. vite-node 2.x doesn't define this global,
 * causing ReferenceError before test collection.
 *
 * By using a .mjs file, Vitest loads this with native Node ESM (not vite-node),
 * so it runs before any transformed module and can safely patch globalThis.
 */
export default function setup() {
  if (typeof globalThis.__vite_ssr_exportName__ === 'undefined') {
    globalThis.__vite_ssr_exportName__ = (_name, getter) => {
      try { return getter(); } catch { return undefined; }
    };
  }
}
