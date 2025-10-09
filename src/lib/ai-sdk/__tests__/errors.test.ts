import {
  AISDKError,
  APICallError,
  InvalidPromptError,
  InvalidResponseDataError,
  LoadAPIKeyError,
  TooManyEmbeddingValuesForCallError,
} from 'ai'
import { describe, expect, it } from 'vitest'

import { describeAiError, isAiSdkError } from '../errors'

const createErrorLike = <T extends new (...args: never[]) => unknown>(
  Ctor: T,
  message: string
) => {
  const instance = Object.create(Ctor.prototype)
  instance.message = message
  return instance as InstanceType<T>
}

describe('describeAiError', () => {
  it('classifies invalid input errors', () => {
    const error = createErrorLike(InvalidPromptError, 'invalid prompt')
    const descriptor = describeAiError(error)

    expect(descriptor).toMatchObject({
      category: 'invalid-input',
      retryable: false,
    })
  })

  it('classifies invalid response errors', () => {
    const error = createErrorLike(InvalidResponseDataError, 'invalid response')
    const descriptor = describeAiError(error)

    expect(descriptor.category).toBe('invalid-response')
  })

  it('classifies auth errors', () => {
    const error = createErrorLike(LoadAPIKeyError, 'missing key')
    const descriptor = describeAiError(error)

    expect(descriptor.category).toBe('auth')
  })

  it('classifies rate limit errors', () => {
    const error = createErrorLike(
      TooManyEmbeddingValuesForCallError,
      'too many values'
    )
    const descriptor = describeAiError(error)

    expect(descriptor.category).toBe('rate-limit')
  })

  it('classifies network errors', () => {
    const error = createErrorLike(APICallError, 'network issue')
    const descriptor = describeAiError(error)

    expect(descriptor.category).toBe('network')
  })

  it('falls back to unknown', () => {
    const descriptor = describeAiError('unexpected')
    expect(descriptor.category).toBe('unknown')
  })
})

describe('isAiSdkError', () => {
  it('detects AISDKError instance', () => {
    const error = createErrorLike(AISDKError, 'base error')
    expect(isAiSdkError(error)).toBe(true)
  })

  it('ignores non-AI errors', () => {
    expect(isAiSdkError(new Error('nope'))).toBe(false)
  })
})
