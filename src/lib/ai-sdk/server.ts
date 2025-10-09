import type {
  GenerateTextResult,
  StreamTextResult,
  ToolChoice,
  ToolSet,
} from 'ai'
import { generateText, streamText } from 'ai'
import { DEFAULT_AI_MODEL_ID } from './defaults'
import { resolveAiModel } from './model-registry'
import type { AiGenerateOptions, AiStreamOptions } from './types'

const buildPromptPayload = (options: {
  prompt?: string
  messages?: AiGenerateOptions['messages']
}) => {
  const { prompt, messages } = options

  if (prompt && messages) {
    throw new Error('Provide either prompt or messages, not both.')
  }

  if (typeof prompt === 'string') {
    const trimmed = prompt.trim()
    if (!trimmed) {
      throw new Error('Prompt cannot be empty.')
    }
    return { prompt: trimmed }
  }

  if (Array.isArray(messages) && messages.length > 0) {
    return { messages }
  }

  throw new Error('Prompt or messages are required for an AI call.')
}

export const generateAiText = async <TTools extends ToolSet = ToolSet>(
  options: AiGenerateOptions<TTools>
): Promise<GenerateTextResult<TTools, never>> => {
  const {
    model: modelInput = DEFAULT_AI_MODEL_ID,
    telemetry,
    providerOptions,
    system,
    tools,
    toolChoice,
    prompt,
    messages,
    abortSignal,
    ...callSettings
  } = options

  const payload = buildPromptPayload({ prompt, messages })
  const model = resolveAiModel(modelInput)

  return generateText<TTools, never>({
    ...callSettings,
    ...payload,
    model,
    system,
    tools,
    toolChoice: toolChoice as ToolChoice<TTools> | undefined,
    providerOptions: providerOptions as never,
    experimental_telemetry: telemetry,
    abortSignal,
  })
}

export const streamAiText = <TTools extends ToolSet = ToolSet>(
  options: AiStreamOptions<TTools>
): StreamTextResult<TTools, never> => {
  const {
    model: modelInput = DEFAULT_AI_MODEL_ID,
    telemetry,
    providerOptions,
    system,
    tools,
    toolChoice,
    prompt,
    messages,
    includeRawChunks,
    abortSignal,
    ...callSettings
  } = options

  const payload = buildPromptPayload({ prompt, messages })
  const model = resolveAiModel(modelInput)

  return streamText<TTools, never>({
    ...callSettings,
    ...payload,
    model,
    system,
    tools,
    toolChoice: toolChoice as ToolChoice<TTools> | undefined,
    providerOptions: providerOptions as never,
    includeRawChunks,
    experimental_telemetry: telemetry,
    abortSignal,
  })
}
