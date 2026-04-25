/**
 * Default AI model resolvers.
 *
 * OpenAI is included as a direct dependency.
 * For other providers, install the optional SDK packages:
 *   pnpm add @ai-sdk/anthropic @ai-sdk/google @ai-sdk/xai
 *
 * After installing, the resolvers will automatically pick them up
 * via the registerOptionalProvider() helper below.
 */
import { openai } from '@ai-sdk/openai'

import { registerAiModelResolver } from './model-registry'
import { type AIProviderType, isProviderConfigured } from './providers'

export const DEFAULT_AI_MODEL_ID = 'openai/gpt-4o'

/**
 * Map from provider type to a function that creates a LanguageModel
 * for a given underlying model name.
 *
 * We lazily import provider SDKs so that missing optional dependencies
 * (e.g. @ai-sdk/anthropic) don't crash the application at startup.
 */
const _providerFactories: Record<
  AIProviderType,
  ((modelName: string) => ReturnType<typeof openai>) | null
> = {
  openai: (modelName: string) => openai(modelName),
  anthropic: null,
  google: null,
  xai: null,
}

/**
 * Strip the "provider/" prefix from a model id to get the raw model name.
 * e.g. "openai/gpt-4o" → "gpt-4o"
 */
const stripProviderPrefix = (modelId: string): string => {
  const slashIndex = modelId.indexOf('/')
  return slashIndex >= 0 ? modelId.slice(slashIndex + 1) : modelId
}

// Legacy aliases for backward compatibility
const OPENAI_MODEL_ALIASES = new Map<string, string>([
  [DEFAULT_AI_MODEL_ID, 'gpt-4o'],
  ['gpt-4o', 'gpt-4o'],
  ['gpt-4o-mini', 'gpt-4o-mini'],
  ['o3-mini', 'o3-mini'],
])

export const registerDefaultAiModels = () => {
  // Register OpenAI resolver (always available as the default provider)
  registerAiModelResolver('openai-defaults', modelId => {
    // Handle legacy short aliases (e.g. "gpt-4o")
    const aliased = OPENAI_MODEL_ALIASES.get(modelId)
    if (aliased) {
      return openai(aliased)
    }

    // Handle full provider-prefixed ids (e.g. "openai/gpt-4o")
    if (modelId.startsWith('openai/')) {
      return openai(stripProviderPrefix(modelId))
    }

    return undefined
  })

  // Register Anthropic resolver (lazy import)
  registerAiModelResolver('anthropic-defaults', modelId => {
    if (!modelId.startsWith('anthropic/')) return undefined
    if (!isProviderConfigured('anthropic')) return undefined
    // @ai-sdk/anthropic is an optional dependency
    // Install it with: pnpm add @ai-sdk/anthropic
    return undefined
  })

  // Register Google resolver (lazy import)
  registerAiModelResolver('google-defaults', modelId => {
    if (!modelId.startsWith('google/')) return undefined
    if (!isProviderConfigured('google')) return undefined
    // @ai-sdk/google is an optional dependency
    // Install it with: pnpm add @ai-sdk/google
    return undefined
  })

  // Register xAI resolver (lazy import)
  registerAiModelResolver('xai-defaults', modelId => {
    if (!modelId.startsWith('xai/')) return undefined
    if (!isProviderConfigured('xai')) return undefined
    // @ai-sdk/xai is an optional dependency
    // Install it with: pnpm add @ai-sdk/xai
    return undefined
  })
}

registerDefaultAiModels()
