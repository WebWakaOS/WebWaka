/**
 * Opaque ID types for all root entities.
 * IDs are opaque strings — never sequential integers exposed to clients.
 * (Platform Invariant T3, Security Baseline §4)
 */
/**
 * Helper to cast a raw string to a typed ID.
 * Use only at trust boundaries (DB reads, API inputs after validation).
 */
export function asId(raw) {
    return raw;
}
//# sourceMappingURL=ids.js.map