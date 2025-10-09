import type { LanguageModel, ModelMessage } from 'ai'
import { generateText, streamText } from 'ai'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  clearAiModelResolvers,
  DEFAULT_AI_MODEL_ID,
  generateAiText,
  registerAiModelResolver,
  streamAiText,
} from '../index'

vi.mock('ai', async () => {
  const actual = await vi.importActual<typeof import('ai')>('ai')
  return {
    ...actual,
    generateText: vi.fn(),
    streamText: vi.fn(),
  }
})

const mockGenerateText = vi.mocked(generateText)
const mockStreamText = vi.mocked(streamText)

const createFakeModel = (id: string): LanguageModel => {
  return {
    specification: {
      provider: 'test',
      id,
      version: 'v1',
    },
    provider: {
      id: 'test',
    },
    call: vi.fn(),
  } as unknown as LanguageModel
}

beforeEach(() => {
  mockGenerateText.mockReset()
  mockStreamText.mockReset()
  clearAiModelResolvers()
})

afterEach(() => {
  clearAiModelResolvers()
})

describe('generateAiText', () => {
  it('resolves string model identifiers and forwards prompt values', async () => {
    const fakeModel = createFakeModel('mock-model')
    registerAiModelResolver('test', modelId => {
      return modelId === 'mock-model' ? fakeModel : undefined
    })

    const resultValue = { id: 'result' }
    mockGenerateText.mockResolvedValue(resultValue as never)

    const result = await generateAiText({
      model: 'mock-model',
      prompt: '  Hi there  ',
    })

    expect(result).toBe(resultValue)
    expect(mockGenerateText).toHaveBeenCalledWith(
      expect.objectContaining({
        model: fakeModel,
        prompt: 'Hi there',
      })
    )
  })

  it('falls back to the default OpenAI model when none is provided', async () => {
    const fakeModel = createFakeModel('default-openai')
    registerAiModelResolver('default-test', modelId => {
      return modelId === DEFAULT_AI_MODEL_ID ? fakeModel : undefined
    })

    const resultValue = { id: 'default-result' }
    mockGenerateText.mockResolvedValue(resultValue as never)

    const result = await generateAiText({
      prompt: 'Hello default model',
    })

    expect(result).toBe(resultValue)
    expect(mockGenerateText).toHaveBeenCalledWith(
      expect.objectContaining({
        model: fakeModel,
      })
    )
  })

  it('prefers messages payload when provided', async () => {
    const fakeModel = createFakeModel('with-messages')
    registerAiModelResolver('test', modelId => {
      return modelId === 'with-messages' ? fakeModel : undefined
    })

    mockGenerateText.mockResolvedValue({} as never)

    const messages: ModelMessage[] = [
      {
        role: 'system',
        content: 'You are helpful.',
      },
      {
        role: 'user',
        content: 'Explain tests.',
      },
    ]

    await generateAiText({
      model: 'with-messages',
      messages,
      temperature: 0.2,
    })

    expect(mockGenerateText).toHaveBeenCalledWith(
      expect.objectContaining({
        messages,
        temperature: 0.2,
      })
    )
  })

  it('throws when neither prompt nor messages are provided', async () => {
    await expect(
      generateAiText({
        model: createFakeModel('direct'),
      } as never)
    ).rejects.toThrow(/Prompt or messages are required/)
  })

  it('throws when model identifier cannot be resolved', async () => {
    await expect(
      generateAiText({
        model: 'unknown-model',
        prompt: 'Test',
      })
    ).rejects.toThrow(/Unknown model identifier/)
  })

  it('rejects when both prompt and messages are provided', async () => {
    await expect(
      generateAiText({
        model: createFakeModel('direct'),
        prompt: 'hey',
        messages: [{ role: 'user', content: 'hey' }],
      } as never)
    ).rejects.toThrow(/either prompt or messages/)
  })
})

describe('streamAiText', () => {
  it('uses the resolver and forwards includeRawChunks flag', () => {
    const fakeModel = createFakeModel('stream')
    registerAiModelResolver('streamer', modelId => {
      return modelId === 'stream' ? fakeModel : undefined
    })

    const streamResult = { id: 'stream' }
    mockStreamText.mockReturnValue(streamResult as never)

    const result = streamAiText({
      model: 'stream',
      messages: [{ role: 'user', content: 'hi' }],
      includeRawChunks: true,
    })

    expect(result).toBe(streamResult)
    expect(mockStreamText).toHaveBeenCalledWith(
      expect.objectContaining({
        model: fakeModel,
        includeRawChunks: true,
      })
    )
  })

  it('falls back to the default model for streaming when omitted', () => {
    const fakeModel = createFakeModel('stream-default')
    registerAiModelResolver('stream-default', modelId => {
      return modelId === DEFAULT_AI_MODEL_ID ? fakeModel : undefined
    })

    const streamResult = { id: 'stream-default' }
    mockStreamText.mockReturnValue(streamResult as never)

    const result = streamAiText({
      messages: [{ role: 'user', content: 'Hello stream default' }],
    })

    expect(result).toBe(streamResult)
    expect(mockStreamText).toHaveBeenCalledWith(
      expect.objectContaining({
        model: fakeModel,
      })
    )
  })
})
