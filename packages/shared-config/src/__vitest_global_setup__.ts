/**
 * Vitest globalSetup — injects __vite_ssr_exportName__ shim into the
 * Node.js global before any test workers start.
 *
 * Vite 8 ssrTransform injects calls to __vite_ssr_exportName__(name, getter)
 * in every named-export statement. vite-node 2.x does not define this global
 * in worker vm contexts, causing ReferenceError on module load.
 *
 * globalSetup runs in the main process (before worker threads fork), so this
 * shim is inherited by worker vm contexts via the vmForks pool.
 */
export default function setup() {
  (global as Record<string, unknown>).__vite_ssr_exportName__ =
    (_name: string, getter: () => unknown) => {
      try { return getter(); } catch { return undefined; }
    };
}
