import { openai } from '@ai-sdk/openai'

import { registerAiModelResolver } from './model-registry'

export const DEFAULT_AI_MODEL_ID = 'openai/gpt-4o'

const OPENAI_MODEL_ALIASES = new Map<string, string>([
  [DEFAULT_AI_MODEL_ID, 'gpt-4o'],
  ['gpt-4o', 'gpt-4o'],
])

export const registerDefaultAiModels = () => {
  registerAiModelResolver('openai-defaults', modelId => {
    const resolved = OPENAI_MODEL_ALIASES.get(modelId)
    if (!resolved) {
      return undefined
    }

    return openai(resolved)
  })
}

registerDefaultAiModels()
