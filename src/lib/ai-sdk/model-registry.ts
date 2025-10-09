import type { LanguageModel } from 'ai'

type ModelResolver = (modelId: string) => LanguageModel | undefined

const resolvers = new Map<string, ModelResolver>()

export const registerAiModelResolver = (
  key: string,
  resolver: ModelResolver
) => {
  resolvers.set(key, resolver)
}

export const unregisterAiModelResolver = (key: string) => {
  resolvers.delete(key)
}

export const resolveAiModel = (
  model: LanguageModel | string
): LanguageModel => {
  if (typeof model !== 'string') {
    return model
  }

  for (const resolver of resolvers.values()) {
    const resolved = resolver(model)
    if (resolved) {
      return resolved
    }
  }

  throw new Error(
    `[ai-sdk] Unknown model identifier "${model}". Register a resolver via registerAiModelResolver().`
  )
}

export const clearAiModelResolvers = () => {
  resolvers.clear()
}

export const listAiModelResolvers = () => {
  return Array.from(resolvers.keys())
}
