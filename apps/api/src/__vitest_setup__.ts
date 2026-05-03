/**
 * Vitest global setup — polyfills for Vite 6+/8+ + Vitest 1.x compatibility.
 *
 * Vite 6+ SSR transform generates code that calls `__vite_ssr_exportName__()`
 * as a module-level function injected by the module runner. In Vitest 1.x the
 * runner does not inject this, causing ReferenceError / TypeError when any file
 * with `export default <object>` is imported.
 *
 * Defining it as a no-op function satisfies the call and lets the SSR transform
 * fall through to its correct ESM default export path.
 */

// @ts-expect-error — intentional global polyfill for Vite 8 + Vitest 1.x interop
globalThis.__vite_ssr_exportName__ = () => {};
