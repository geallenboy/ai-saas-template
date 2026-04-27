/**
 * AI Provider and Model configuration types and registry.
 *
 * Defines the multi-model switching architecture, allowing users to select
 * from available AI providers (OpenAI, Anthropic, Google, xAI) based on
 * which API keys are configured in the environment.
 */

export type AIProviderType = 'openai' | 'anthropic' | 'google' | 'xai'

export type AIModelCapability = 'chat' | 'image' | 'embedding'

export interface AIModelConfig {
    /** Unique model identifier, e.g. "openai/gpt-4o" */
    id: string
    /** Human-readable display name */
    displayName: string
    /** Provider this model belongs to */
    provider: AIProviderType
    /** Capabilities supported by this model */
    capabilities: AIModelCapability[]
    /** Maximum output tokens */
    maxTokens: number
    /** Cost per 1k tokens (USD) */
    costPer1kTokens: { input: number; output: number }
}

export interface AIProviderConfig {
    /** Unique provider identifier */
    id: string
    /** Human-readable provider name */
    name: string
    /** Models offered by this provider */
    models: AIModelConfig[]
    /** Whether this provider is enabled (has a valid API key) */
    isEnabled: boolean
}

/**
 * Static catalog of all known AI providers and their models.
 * The `isEnabled` flag is set to false by default and resolved
 * at runtime based on environment variables.
 */
export const AI_PROVIDERS: AIProviderConfig[] = [
    {
        id: 'openai',
        name: 'OpenAI',
        isEnabled: false,
        models: [
            {
                id: 'openai/gpt-4o',
                displayName: 'GPT-4o',
                provider: 'openai',
                capabilities: ['chat', 'image'],
                maxTokens: 16384,
                costPer1kTokens: { input: 0.0025, output: 0.01 },
            },
            {
                id: 'openai/gpt-4o-mini',
                displayName: 'GPT-4o Mini',
                provider: 'openai',
                capabilities: ['chat'],
                maxTokens: 16384,
                costPer1kTokens: { input: 0.00015, output: 0.0006 },
            },
            {
                id: 'openai/o3-mini',
                displayName: 'o3-mini',
                provider: 'openai',
                capabilities: ['chat'],
                maxTokens: 65536,
                costPer1kTokens: { input: 0.0011, output: 0.0044 },
            },
        ],
    },
    {
        id: 'anthropic',
        name: 'Anthropic',
        isEnabled: false,
        models: [
            {
                id: 'anthropic/claude-sonnet-4-20260514',
                displayName: 'Claude Sonnet 4',
                provider: 'anthropic',
                capabilities: ['chat'],
                maxTokens: 16384,
                costPer1kTokens: { input: 0.003, output: 0.015 },
            },
            {
                id: 'anthropic/claude-3-5-haiku-20241022',
                displayName: 'Claude 3.5 Haiku',
                provider: 'anthropic',
                capabilities: ['chat'],
                maxTokens: 8192,
                costPer1kTokens: { input: 0.0008, output: 0.004 },
            },
        ],
    },
    {
        id: 'google',
        name: 'Google AI',
        isEnabled: false,
        models: [
            {
                id: 'google/gemini-2.5-flash',
                displayName: 'Gemini 2.5 Flash',
                provider: 'google',
                capabilities: ['chat', 'image'],
                maxTokens: 65536,
                costPer1kTokens: { input: 0.00015, output: 0.0006 },
            },
            {
                id: 'google/gemini-2.5-pro',
                displayName: 'Gemini 2.5 Pro',
                provider: 'google',
                capabilities: ['chat', 'image'],
                maxTokens: 65536,
                costPer1kTokens: { input: 0.00125, output: 0.01 },
            },
        ],
    },
    {
        id: 'xai',
        name: 'xAI',
        isEnabled: false,
        models: [
            {
                id: 'xai/grok-3-mini',
                displayName: 'Grok 3 Mini',
                provider: 'xai',
                capabilities: ['chat'],
                maxTokens: 131072,
                costPer1kTokens: { input: 0.0003, output: 0.0005 },
            },
        ],
    },
]

/**
 * Environment variable name for each provider's API key.
 */
export const PROVIDER_ENV_KEYS: Record<AIProviderType, string> = {
    openai: 'OPENAI_API_KEY',
    anthropic: 'ANTHROPIC_API_KEY',
    google: 'GOOGLE_GENERATIVE_AI_API_KEY',
    xai: 'XAI_API_KEY',
}

/**
 * Check whether a provider has a configured API key.
 * Works on the server side only (reads process.env).
 */
export const isProviderConfigured = (provider: AIProviderType): boolean => {
    const envKey = PROVIDER_ENV_KEYS[provider]
    return Boolean(
        process?.env?.[envKey]
    )
}

/**
 * Return the list of providers with their `isEnabled` flag resolved
 * based on the current environment.
 */
export const getEnabledProviders = (): AIProviderConfig[] => {
    return AI_PROVIDERS.map(provider => ({
        ...provider,
        isEnabled: isProviderConfigured(provider.id as AIProviderType),
    }))
}

/**
 * Return a flat list of all models whose provider has a configured API key.
 */
export const getAvailableModels = (): AIModelConfig[] => {
    return getEnabledProviders()
        .filter(p => p.isEnabled)
        .flatMap(p => p.models)
}

/**
 * Look up a single model config by its id.
 */
export const getModelConfig = (modelId: string): AIModelConfig | undefined => {
    for (const provider of AI_PROVIDERS) {
        const model = provider.models.find(m => m.id === modelId)
        if (model) return model
    }
    return undefined
}
