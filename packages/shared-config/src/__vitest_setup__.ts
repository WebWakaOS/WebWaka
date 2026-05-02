/**
 * Vitest global setup shim for Vite 8 + vite-node 2.x interop.
 *
 * Vite 8's ssrTransform injects calls to `__vite_ssr_exportName__()` in
 * transformed modules (used for named re-exports). vite-node 2.x does not
 * yet define this global in its execution context, so any module that
 * contains named export declarations will throw:
 *   ReferenceError: __vite_ssr_exportName__ is not defined
 *
 * This setup file defines a no-op shim for that global before any test
 * module is loaded.
 */

// The global is called with (exportName: string, getter: () => unknown)
// and is used purely for live-binding export tracking. A no-op is safe
// for test environments.
(globalThis as Record<string, unknown>).__vite_ssr_exportName__ =
  (_name: string, getter: () => unknown) => getter();
