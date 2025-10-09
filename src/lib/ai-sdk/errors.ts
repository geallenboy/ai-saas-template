import {
  AISDKError,
  APICallError,
  InvalidPromptError,
  InvalidResponseDataError,
  JSONParseError,
  LoadAPIKeyError,
  NoContentGeneratedError,
  NoSuchModelError,
  TooManyEmbeddingValuesForCallError,
  TypeValidationError,
  UnsupportedFunctionalityError,
} from 'ai'

export type AiErrorCategory =
  | 'invalid-input'
  | 'invalid-response'
  | 'auth'
  | 'rate-limit'
  | 'network'
  | 'unknown'

export interface AiErrorDescriptor {
  category: AiErrorCategory
  message: string
  retryable: boolean
  cause?: unknown
}

export const isAiSdkError = (error: unknown): error is AISDKError => {
  return error instanceof AISDKError
}

const buildDescriptor = (
  category: AiErrorCategory,
  message: string,
  retryable: boolean,
  cause?: unknown
): AiErrorDescriptor => ({ category, message, retryable, cause })

export const describeAiError = (error: unknown): AiErrorDescriptor => {
  if (
    error instanceof InvalidPromptError ||
    error instanceof NoSuchModelError
  ) {
    return buildDescriptor('invalid-input', error.message, false, error)
  }

  if (
    error instanceof InvalidResponseDataError ||
    error instanceof TypeValidationError ||
    error instanceof JSONParseError ||
    error instanceof NoContentGeneratedError
  ) {
    return buildDescriptor('invalid-response', error.message, true, error)
  }

  if (
    error instanceof LoadAPIKeyError ||
    error instanceof UnsupportedFunctionalityError
  ) {
    return buildDescriptor('auth', error.message, false, error)
  }

  if (error instanceof TooManyEmbeddingValuesForCallError) {
    return buildDescriptor('rate-limit', error.message, true, error)
  }

  if (error instanceof APICallError) {
    return buildDescriptor('network', error.message, true, error)
  }

  if (error instanceof Error) {
    return buildDescriptor('unknown', error.message, true, error)
  }

  return buildDescriptor('unknown', 'Unknown AI SDK error', true, error)
}
