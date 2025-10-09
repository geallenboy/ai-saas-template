import type {
  CallSettings,
  LanguageModel,
  ModelMessage,
  TelemetrySettings,
  ToolChoice,
  ToolSet,
} from 'ai'

export type AiModel = LanguageModel | string

export interface BaseAiCallOptions<TTools extends ToolSet = ToolSet>
  extends Partial<CallSettings> {
  model?: AiModel
  prompt?: string
  messages?: ModelMessage[]
  system?: string
  tools?: TTools
  toolChoice?: ToolChoice<TTools>
  telemetry?: TelemetrySettings
  providerOptions?: Record<string, unknown>
  abortSignal?: AbortSignal
}

export type AiGenerateOptions<TTools extends ToolSet = ToolSet> =
  BaseAiCallOptions<TTools>

export interface AiStreamOptions<TTools extends ToolSet = ToolSet>
  extends BaseAiCallOptions<TTools> {
  includeRawChunks?: boolean
}

export type AiMessage = ModelMessage

export interface AiStreamCallbacks<TChunk> {
  onChunk?: (chunk: TChunk) => void
  onDone?: () => void
  onError?: (error: Error) => void
}

export interface AiJsonFetchOptions<TBody> {
  body?: TBody
  signal?: AbortSignal
  headers?: Record<string, string>
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH'
}

export interface AiStreamFetchOptions<TBody, TChunk>
  extends AiJsonFetchOptions<TBody> {
  parse?: (raw: string) => TChunk
  callbacks: AiStreamCallbacks<TChunk>
}
