/**
 * AI Free Model Allowlist (BATCH 3)
 * Formalizes the platform's free-model-first strategy.
 */

export const FREE_MODELS_OPENROUTER: readonly string[] = [
  'meta-llama/llama-3.1-8b-instruct:free',
  'meta-llama/llama-3.2-3b-instruct:free',
  'meta-llama/llama-3.2-1b-instruct:free',
  'microsoft/phi-3-mini-128k-instruct:free',
  'google/gemma-2-9b-it:free',
  'google/gemma-2-2b-it:free',
  'mistralai/mistral-7b-instruct:free',
  'qwen/qwen-2-7b-instruct:free',
] as const;

export const FREE_MODELS_GROQ: readonly string[] = [
  'llama-3.1-8b-instant',
  'llama-3.2-3b-preview',
  'gemma2-9b-it',
  'llama-guard-3-8b',
] as const;

export const FREE_MODELS_TOGETHER: readonly string[] = [
  'meta-llama/Llama-3.2-3B-Instruct-Turbo',
  'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
] as const;

export const FREE_MODELS_DEEPINFRA: readonly string[] = [
  'meta-llama/Meta-Llama-3.1-8B-Instruct',
  'mistralai/Mistral-7B-Instruct-v0.3',
] as const;

export type AggregatorProvider = 'openrouter' | 'groq' | 'together' | 'deepinfra';

export const FREE_MODEL_ALLOWLIST: Record<AggregatorProvider, readonly string[]> = {
  openrouter: FREE_MODELS_OPENROUTER,
  groq: FREE_MODELS_GROQ,
  together: FREE_MODELS_TOGETHER,
  deepinfra: FREE_MODELS_DEEPINFRA,
};

export function getPreferredFreeModel(provider: AggregatorProvider, capability?: string): string {
  if (capability === 'content_moderation' && provider === 'groq') return 'llama-guard-3-8b';
  const models = FREE_MODEL_ALLOWLIST[provider];
  return models[0] ?? 'meta-llama/llama-3.1-8b-instruct:free';
}

export function isModelFree(provider: AggregatorProvider, modelName: string): boolean {
  return (FREE_MODEL_ALLOWLIST[provider] as readonly string[]).includes(modelName);
}
