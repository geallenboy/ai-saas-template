import type { SQL } from 'drizzle-orm'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  aiChatAttachments,
  aiChatMessages,
  aiChatSessions,
} from '@/drizzle/schemas'
import { DEFAULT_AI_MODEL_ID, streamAiText } from '@/lib/ai-sdk'
import type { Context } from '../../server'
import { type AiChatStreamEvent, aichatRouter } from '../aichat'

vi.mock('@/env', () => {
  const env = {
    DATABASE_URL: 'https://example.com/db',
    STRIPE_SECRET_KEY: 'sk_test_key',
    STRIPE_WEBHOOK_SECRET: 'whsec_test',
    OPENAI_API_KEY: 'test-key',
    NODE_ENV: 'test',
    DB_POOL_MAX: 5,
    DB_POOL_MIN: 1,
    ENABLE_AI_FEATURES: true,
    ENABLE_PAYMENT_FEATURES: true,
    ENABLE_ADMIN_FEATURES: true,
    BETTER_AUTH_SECRET: 'abcdefghijklmnopqrstuvwxyz123456',
    NEXT_PUBLIC_SIGN_IN_URL: '/auth/login',
    NEXT_PUBLIC_SIGN_UP_URL: '/auth/register',
    NEXT_PUBLIC_SIGN_IN_FALLBACK_REDIRECT_URL: '/',
    NEXT_PUBLIC_SIGN_UP_FALLBACK_REDIRECT_URL: '/',
    NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
    NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_key',
    NEXT_PUBLIC_ENABLE_AI_FEATURES: 'true',
    NEXT_PUBLIC_ENABLE_PAYMENT_FEATURES: 'true',
    NEXT_PUBLIC_DEFAULT_LOCALE: 'zh',
    NEXT_PUBLIC_SUPPORTED_LOCALES: 'zh,en',
  }

  return {
    env,
    isDev: false,
    isProd: false,
    isTest: true,
    getSiteUrl: () => env.NEXT_PUBLIC_SITE_URL,
    getServerEnv: () => env,
  }
})

vi.mock('@/lib/ai-sdk', async () => {
  const actual =
    await vi.importActual<typeof import('@/lib/ai-sdk')>('@/lib/ai-sdk')
  return {
    ...actual,
    streamAiText: vi.fn(),
  }
})

const mockStreamAiText = vi.mocked(streamAiText)

const extractWhereValue = (where: SQL | undefined): string | undefined => {
  if (!where) {
    return undefined
  }

  const chunks = (where as any).queryChunks as unknown[] | undefined
  if (!chunks) {
    return undefined
  }

  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

  for (const chunk of chunks) {
    if (typeof chunk === 'string') {
      if (uuidPattern.test(chunk)) {
        return chunk
      }
      continue
    }

    if (chunk && typeof chunk === 'object' && 'queryChunks' in chunk) {
      const nested = extractWhereValue(chunk as SQL)
      if (nested) {
        return nested
      }
    }

    if (chunk && typeof chunk === 'object' && 'value' in chunk) {
      const values = (chunk as any).value
      if (Array.isArray(values)) {
        const candidate = values.find(
          (item: unknown) => typeof item === 'string' && uuidPattern.test(item)
        )
        if (candidate) {
          return candidate
        }
      }
    }
  }

  return undefined
}

const createMockDb = () => {
  const sessions = new Map<string, any>()
  const messages = new Map<string, any>()
  const attachments = new Map<string, any>()

  const insert = vi.fn((table: unknown) => ({
    values: async (records: any | any[]) => {
      const rows = Array.isArray(records) ? records : [records]
      for (const row of rows) {
        if (table === aiChatSessions) {
          sessions.set(row.id, row)
        } else if (table === aiChatMessages) {
          messages.set(row.id, row)
        } else if (table === aiChatAttachments) {
          attachments.set(row.id, row)
        }
      }
      return rows
    },
  }))

  const update = vi.fn((table: unknown) => ({
    set: (payload: any) => ({
      where: async (where: SQL | undefined) => {
        const id = extractWhereValue(where)
        if (!id) return

        if (table === aiChatSessions) {
          const current = sessions.get(id)
          if (current) {
            Object.assign(current, payload)
          }
        } else if (table === aiChatMessages) {
          const current = messages.get(id)
          if (current) {
            Object.assign(current, payload)
            return
          }

          const fallback = Array.from(messages.values()).find(
            message => message.role === 'assistant'
          )
          if (fallback) {
            Object.assign(fallback, payload)
          }
        }
      },
    }),
  }))

  const deleteFn = vi.fn((table: unknown) => ({
    where: async (where: SQL | undefined) => {
      const value = extractWhereValue(where)
      if (!value) return

      if (table === aiChatMessages) {
        for (const [id, message] of messages.entries()) {
          if (message.sessionId === value) {
            messages.delete(id)
          }
        }
      } else if (table === aiChatAttachments) {
        for (const [id, attachment] of attachments.entries()) {
          if (attachment.sessionId === value) {
            attachments.delete(id)
          }
        }
      }
    },
  }))

  const query = {
    aiChatSessions: {
      findMany: vi.fn(async ({ where }: { where?: SQL } = {}) => {
        const userId = extractWhereValue(where)
        const items = Array.from(sessions.values())
        const filtered = userId
          ? items.filter(item => item.userId === userId)
          : items
        return filtered
          .slice()
          .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      }),
      findFirst: vi.fn(async ({ where }: { where?: SQL } = {}) => {
        const id = extractWhereValue(where)
        return (
          Array.from(sessions.values()).find(item =>
            id ? item.id === id : true
          ) ?? null
        )
      }),
    },
    aiChatMessages: {
      findMany: vi.fn(async ({ where }: { where?: SQL } = {}) => {
        const sessionId = extractWhereValue(where)
        const items = Array.from(messages.values())
        const filtered = sessionId
          ? items.filter(item => item.sessionId === sessionId)
          : items
        return filtered
          .slice()
          .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      }),
    },
  }

  return {
    insert,
    update,
    delete: deleteFn,
    query,
    data: {
      sessions,
      messages,
      attachments,
    },
  }
}

const createContext = (
  db: ReturnType<typeof createMockDb>,
  overrides: Partial<Context> = {}
): Context => {
  const loggerMock = {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  }

  return {
    db: db as unknown as Context['db'],
    userId: 'user-1',
    user: {
      id: 'user-1',
      email: 'user@example.com',
      isAdmin: false,
      adminLevel: 0,
    } as any,
    headers: new Headers(),
    logger: loggerMock as unknown as Console,
    ...overrides,
  }
}

describe('aichatRouter', () => {
  let db: ReturnType<typeof createMockDb>
  let ctx: Context

  beforeEach(() => {
    db = createMockDb()
    ctx = createContext(db)
    mockStreamAiText.mockReset()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('creates a session with defaults', async () => {
    const caller = aichatRouter.createCaller(ctx)

    const session = await caller.createSession({ title: 'My Chat' })

    expect(session.modelId).toBe(DEFAULT_AI_MODEL_ID)
    expect(db.data.sessions.get(session.id)).toBeDefined()
    expect(db.insert).toHaveBeenCalledWith(aiChatSessions)
  })

  it('streams assistant response and persists messages', async () => {
    mockStreamAiText.mockReturnValue({
      textStream: (async function* () {
        yield 'Hello'
        yield ' world'
      })(),
      usage: Promise.resolve({
        promptTokens: 10,
        completionTokens: 20,
        totalTokens: 30,
      }),
      totalUsage: Promise.resolve({
        promptTokens: 10,
        completionTokens: 20,
        totalTokens: 30,
      }),
      content: Promise.resolve([]),
      text: Promise.resolve('Hello world'),
      reasoning: Promise.resolve([]),
      reasoningText: Promise.resolve(undefined),
      files: Promise.resolve([]),
      sources: Promise.resolve([]),
      toolCalls: Promise.resolve([]),
      staticToolCalls: Promise.resolve([]),
      dynamicToolCalls: Promise.resolve([]),
      staticToolResults: Promise.resolve([]),
      dynamicToolResults: Promise.resolve([]),
      toolResults: Promise.resolve([]),
      finishReason: Promise.resolve('stop' as any),
      warnings: Promise.resolve(undefined),
      steps: Promise.resolve([]),
      request: Promise.resolve({} as any),
      response: Promise.resolve({ messages: [] } as any),
      providerMetadata: Promise.resolve(undefined),
      experimental_partialOutputStream: (async function* () {})(),
      consumeStream: async () => {},
      toUIMessageStream: () => (async function* () {})(),
      pipeUIMessageStreamToResponse: () => {},
      toUIMessageStreamResponse: () => new Response(),
      pipeTextStreamToResponse: () => {},
      toTextStreamResponse: () => new Response(),
    } as any)

    const caller = aichatRouter.createCaller(ctx)
    const events: AiChatStreamEvent[] = []

    await new Promise<void>((resolve, reject) => {
      caller
        .sendMessage({ message: 'Hi there' })
        .then(observable => {
          const subscription = observable.subscribe({
            next: event => {
              events.push(event)
            },
            error: error => {
              subscription.unsubscribe()
              reject(error)
            },
            complete: () => {
              subscription.unsubscribe()
              resolve()
            },
          })
        })
        .catch(reject)
    })

    const sessionEvent = events.find(
      (event): event is Extract<AiChatStreamEvent, { type: 'session' }> =>
        event.type === 'session'
    )
    expect(sessionEvent).toBeDefined()
    if (!sessionEvent) {
      throw new Error('Expected session event')
    }
    const persistedSession = db.data.sessions.get(sessionEvent.sessionId)
    expect(persistedSession).toBeDefined()
    expect(persistedSession?.modelId).toBe(DEFAULT_AI_MODEL_ID)
    expect(events.some(event => event.type === 'assistant-delta')).toBe(true)
    const finalEvent = events.at(-1)
    expect(finalEvent).toBeDefined()
    expect(finalEvent).toMatchObject({
      type: 'assistant-end',
      text: 'Hello world',
    })

    const persistedMessages = Array.from(db.data.messages.values())
    const assistantMessage = persistedMessages.find(
      message => message.role === 'assistant'
    )
    expect(assistantMessage).toBeDefined()
    expect(mockStreamAiText).toHaveBeenCalledTimes(1)
    const callArgs = mockStreamAiText.mock.calls[0]?.[0]
    expect(callArgs?.model).toBe(DEFAULT_AI_MODEL_ID)
    expect(callArgs?.messages?.at(-1)?.role).toBe('user')
    expect(callArgs?.messages?.at(-1)?.content?.[0]).toMatchObject({
      type: 'text',
    })
  })
})
