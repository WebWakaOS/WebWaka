/**
 * @webwaka/vertical-engine — FSM Engine
 *
 * Pure-function FSM (Finite State Machine) runtime.
 * Given a VerticalConfig's FSM definition, validates transitions
 * and evaluates guards.
 *
 * No I/O — all functions are synchronous and deterministic.
 */

import type { FSMConfig, FSMGuardDef, FSMTransitionDef } from './schema.js';

export interface FSMValidationResult {
  valid: boolean;
  reason?: string;
}

/**
 * FSMEngine — stateless FSM validator.
 * Instantiate with an FSMConfig, then call isValid/getNextStates.
 */
export class FSMEngine {
  private readonly transitionMap: Map<string, string[]>;
  private readonly transitionGuards: Map<string, string | undefined>;
  private readonly guardDefs: Map<string, FSMGuardDef>;

  constructor(private readonly config: FSMConfig) {
    this.transitionMap = new Map();
    this.transitionGuards = new Map();
    this.guardDefs = new Map();

    for (const t of config.transitions) {
      const key = `${t.from}->${t.to}`;
      this.transitionGuards.set(key, t.guard);
      const existing = this.transitionMap.get(t.from) ?? [];
      existing.push(t.to);
      this.transitionMap.set(t.from, existing);
    }

    for (const g of config.guards ?? []) {
      this.guardDefs.set(g.name, g);
    }
  }

  get initialState(): string {
    return this.config.initialState;
  }

  get states(): readonly string[] {
    return this.config.states;
  }

  get transitions(): readonly FSMTransitionDef[] {
    return this.config.transitions;
  }

  /**
   * Check if a transition from -> to is structurally valid.
   */
  isValidTransition(from: string, to: string): boolean {
    const targets = this.transitionMap.get(from);
    return targets?.includes(to) ?? false;
  }

  /**
   * Get all possible next states from the current state.
   */
  getNextStates(currentState: string): string[] {
    return this.transitionMap.get(currentState) ?? [];
  }

  /**
   * Get the guard name for a specific transition (if any).
   */
  getGuardName(from: string, to: string): string | undefined {
    return this.transitionGuards.get(`${from}->${to}`);
  }

  /**
   * Get guard definition by name.
   */
  getGuardDef(name: string): FSMGuardDef | undefined {
    return this.guardDefs.get(name);
  }

  /**
   * Validate a transition (structural validity only — guard evaluation is caller's responsibility).
   */
  validate(from: string, to: string): FSMValidationResult {
    if (!this.config.states.includes(from)) {
      return { valid: false, reason: `Unknown state: ${from}` };
    }
    if (!this.config.states.includes(to)) {
      return { valid: false, reason: `Unknown state: ${to}` };
    }
    if (!this.isValidTransition(from, to)) {
      return { valid: false, reason: `Transition ${from} → ${to} is not allowed` };
    }
    return { valid: true };
  }

  /**
   * Returns the transitions as pairs for backward compatibility with VALID_X_TRANSITIONS arrays.
   */
  toTransitionPairs(): Array<[string, string]> {
    return this.config.transitions.map(t => [t.from, t.to]);
  }

  /**
   * Wave 3 (B2-1): Static config validator.
   * Validates the FSMConfig at registration time — catches orphan states,
   * undefined guards, unreachable states, and missing initialState.
   */
  static validateConfig(config: FSMConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const stateSet = new Set(config.states);
    const guardNames = new Set((config.guards ?? []).map((g) => g.name));

    // initialState must be in states
    if (!stateSet.has(config.initialState)) {
      errors.push(`initialState '${config.initialState}' is not in states array`);
    }

    // All transition from/to states must be in states
    for (const t of config.transitions) {
      if (!stateSet.has(t.from)) errors.push(`Transition references unknown 'from' state: '${t.from}'`);
      if (!stateSet.has(t.to))   errors.push(`Transition references unknown 'to' state: '${t.to}'`);
      if (t.guard && !guardNames.has(t.guard)) {
        errors.push(`Transition ${t.from}->${t.to} references undefined guard: '${t.guard}'`);
      }
    }

    // Check for unreachable states (cannot be reached from initialState)
    const reachable = new Set<string>([config.initialState]);
    let changed = true;
    while (changed) {
      changed = false;
      for (const t of config.transitions) {
        if (reachable.has(t.from) && !reachable.has(t.to)) {
          reachable.add(t.to);
          changed = true;
        }
      }
    }
    for (const state of config.states) {
      if (!reachable.has(state)) {
        errors.push(`State '${state}' is unreachable from initialState '${config.initialState}'`);
      }
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Wave 3 (B2-4): Validate config and throw a descriptive error if invalid.
   * Call this during vertical registration to fail fast at startup.
   */
  static assertValidConfig(config: FSMConfig, verticalSlug: string): void {
    const result = FSMEngine.validateConfig(config);
    if (!result.valid) {
      throw new Error(
        `FSM config for vertical '${verticalSlug}' is invalid:\n` +
        result.errors.map((e) => `  - ${e}`).join('\n'),
      );
    }
  }

}
