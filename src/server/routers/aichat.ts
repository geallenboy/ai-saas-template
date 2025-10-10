import { randomUUID } from 'node:crypto'
import { TRPCError } from '@trpc/server'
import { observable } from '@trpc/server/observable'
import type { LanguageModelUsage, ModelMessage, ToolSet } from 'ai'
import { asc, desc, eq } from 'drizzle-orm'
import { z } from 'zod'
import {
  type AiChatMessage,
  type AiChatSession,
  type AiMessageContent,
  AiMessageRoles,
  aiChatAttachments,
  aiChatMessages,
  aiChatSessions,
} from '@/drizzle/schemas'
import {
  DEFAULT_AI_MODEL_ID,
  describeAiError,
  streamAiText,
} from '@/lib/ai-sdk'
import type { Context } from '../server'
import { createTRPCRouter, protectedProcedure } from '../server'

const SESSION_PAGE_SIZE = 20
const MESSAGE_PAGE_SIZE = 40

const callSettingsSchema = z
  .object({
    temperature: z.number().min(0).max(2).optional(),
    topP: z.number().min(0).max(1).optional(),
    presencePenalty: z.number().optional(),
    frequencyPenalty: z.number().optional(),
    maxOutputTokens: z.number().int().positive().optional(),
    stop: z.array(z.string()).optional(),
  })
  .optional()

export const sendMessageInputSchema = z.object({
  sessionId: z.string().uuid().optional(),
  message: z.string().min(1, '消息内容不能为空'),
  systemPrompt: z.string().max(4000).optional(),
  modelId: z.string().min(1).optional(),
  callSettings: callSettingsSchema,
  providerOptions: z.record(z.string(), z.any()).optional(),
})
export type SendMessageInput = z.infer<typeof sendMessageInputSchema>

const createSessionSchema = z.object({
  title: z.string().max(120).optional(),
  systemPrompt: z.string().max(4000).optional(),
  modelId: z.string().min(1).optional(),
  visibility: z.enum(['private', 'shared']).optional(),
  mode: z.string().max(30).optional(),
})

const listSessionsSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).optional(),
  updatedAfter: z.date().optional(),
})

const listMessagesSchema = z.object({
  sessionId: z.string().uuid(),
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(200).optional(),
})

const clearSessionSchema = z.object({
  sessionId: z.string().uuid(),
})

const deleteSessionSchema = z.object({
  sessionId: z.string().uuid(),
})

const updateSessionSchema = z.object({
  sessionId: z.string().uuid(),
  title: z.string().max(120).optional(),
  systemPrompt: z.string().max(4000).optional(),
})

export type AiChatStreamEvent =
  | { type: 'session'; sessionId: string }
  | { type: 'user-message'; messageId: string }
  | { type: 'assistant-start'; messageId: string }
  | { type: 'assistant-delta'; messageId: string; delta: string }
  | {
      type: 'assistant-end'
      messageId: string
      text: string
      usage?: LanguageModelUsage
      totalUsage?: LanguageModelUsage
    }
  | {
      type: 'error'
      message: string
      retryable: boolean
      category: string
    }

const buildMessageContent = (text: string): AiMessageContent => {
  return [{ type: 'text', text }]
}

const toModelMessages = (messages: AiChatMessage[]): ModelMessage[] => {
  const sorted = messages.sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
  )

  return sorted.map(message => {
    const role = message.role as (typeof AiMessageRoles)[number]
    const normalizedRole: ModelMessage['role'] = AiMessageRoles.includes(role)
      ? (role as 'user' | 'system' | 'assistant')
      : 'user'

    const contentParts =
      Array.isArray(message.content) && message.content.length
        ? message.content
        : buildMessageContent(message.text ?? '')

    return {
      role: normalizedRole,
      content: contentParts as ModelMessage['content'],
    } as ModelMessage
  })
}

const assertSessionOwnership = async (
  ctx: Context,
  sessionId: string
): Promise<AiChatSession> => {
  const session = await ctx.db.query.aiChatSessions.findFirst({
    where: eq(aiChatSessions.id, sessionId),
  })

  if (!session || session.userId !== ctx.userId) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: '会话不存在或无权访问',
    })
  }

  return session
}

const maybeInferTitle = (text: string) => {
  return text.trim().slice(0, 40)
}

export const aichatRouter = createTRPCRouter({
  listSessions: protectedProcedure
    .input(listSessionsSchema.optional())
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? SESSION_PAGE_SIZE
      const userId = ctx.userId as string

      const items = await ctx.db.query.aiChatSessions.findMany({
        where: eq(aiChatSessions.userId, userId),
        orderBy: desc(aiChatSessions.updatedAt),
        limit,
      })

      if (input?.updatedAfter) {
        const updatedAfter = input.updatedAfter
        return items.filter(item => item.updatedAt > updatedAfter)
      }

      return items
    }),

  getSessionMessages: protectedProcedure
    .input(listMessagesSchema)
    .query(async ({ ctx, input }) => {
      await assertSessionOwnership(ctx, input.sessionId)

      const limit = input.limit ?? MESSAGE_PAGE_SIZE

      const messages = await ctx.db.query.aiChatMessages.findMany({
        where: eq(aiChatMessages.sessionId, input.sessionId),
        orderBy: [desc(aiChatMessages.createdAt)],
        limit,
      })

      return messages.reverse()
    }),

  createSession: protectedProcedure
    .input(createSessionSchema.optional())
    .mutation(async ({ ctx, input }) => {
      const now = new Date()
      const id = randomUUID()
      const userId = ctx.userId as string
      const session: AiChatSession = {
        id,
        userId,
        title: input?.title ?? null,
        summary: null,
        systemPrompt: input?.systemPrompt ?? null,
        modelId: input?.modelId ?? DEFAULT_AI_MODEL_ID,
        locale: null,
        visibility: input?.visibility ?? 'private',
        mode: input?.mode ?? 'chat',
        metadata: {},
        lastMessageAt: null,
        archivedAt: null,
        deletedAt: null,
        createdAt: now,
        updatedAt: now,
      }

      await ctx.db.insert(aiChatSessions).values(session)

      return session
    }),

  clearSession: protectedProcedure
    .input(clearSessionSchema)
    .mutation(async ({ ctx, input }) => {
      await assertSessionOwnership(ctx, input.sessionId)

      await ctx.db
        .delete(aiChatAttachments)
        .where(eq(aiChatAttachments.sessionId, input.sessionId))

      await ctx.db
        .delete(aiChatMessages)
        .where(eq(aiChatMessages.sessionId, input.sessionId))

      await ctx.db
        .update(aiChatSessions)
        .set({
          summary: null,
          lastMessageAt: null,
          updatedAt: new Date(),
        })
        .where(eq(aiChatSessions.id, input.sessionId))

      return { success: true }
    }),

  deleteSession: protectedProcedure
    .input(deleteSessionSchema)
    .mutation(async ({ ctx, input }) => {
      await assertSessionOwnership(ctx, input.sessionId)

      // 删除相关的附件
      await ctx.db
        .delete(aiChatAttachments)
        .where(eq(aiChatAttachments.sessionId, input.sessionId))

      // 删除相关的消息
      await ctx.db
        .delete(aiChatMessages)
        .where(eq(aiChatMessages.sessionId, input.sessionId))

      // 删除会话
      await ctx.db
        .delete(aiChatSessions)
        .where(eq(aiChatSessions.id, input.sessionId))

      return { success: true }
    }),

  updateSession: protectedProcedure
    .input(updateSessionSchema)
    .mutation(async ({ ctx, input }) => {
      const session = await assertSessionOwnership(ctx, input.sessionId)

      const updateData: Partial<AiChatSession> = {
        updatedAt: new Date(),
      }

      if (input.title !== undefined) {
        updateData.title = input.title
      }

      if (input.systemPrompt !== undefined) {
        updateData.systemPrompt = input.systemPrompt
      }

      await ctx.db
        .update(aiChatSessions)
        .set(updateData)
        .where(eq(aiChatSessions.id, input.sessionId))

      return {
        ...session,
        ...updateData,
      }
    }),

  sendMessage: protectedProcedure
    .input(sendMessageInputSchema)
    .subscription(({ ctx, input }) => {
      return observable<AiChatStreamEvent>(observer => {
        const abortController = new AbortController()
        let isObserverClosed = false

        const safeNext = (event: AiChatStreamEvent) => {
          if (!isObserverClosed) {
            observer.next(event)
          }
        }

        const safeComplete = () => {
          if (!isObserverClosed) {
            isObserverClosed = true
            observer.complete()
          }
        }

        const safeError = (error: unknown) => {
          if (!isObserverClosed) {
            isObserverClosed = true
            observer.error(error)
          }
        }

        const run = async () => {
          const now = new Date()
          const userId = ctx.userId as string
          let session: AiChatSession | null = null
          let sessionId = input.sessionId

          if (sessionId) {
            session = await assertSessionOwnership(ctx, sessionId)
          }

          if (!session) {
            const title = maybeInferTitle(input.message)
            sessionId = randomUUID()
            session = {
              id: sessionId,
              userId,
              title,
              summary: null,
              systemPrompt: input.systemPrompt ?? null,
              modelId: input.modelId ?? DEFAULT_AI_MODEL_ID,
              locale: null,
              visibility: 'private',
              mode: 'chat',
              metadata: {},
              lastMessageAt: now,
              archivedAt: null,
              deletedAt: null,
              createdAt: now,
              updatedAt: now,
            }

            await ctx.db.insert(aiChatSessions).values(session)
          }

          safeNext({ type: 'session', sessionId: session.id })

          const resolvedModelId =
            input.modelId ?? session.modelId ?? DEFAULT_AI_MODEL_ID
          const systemPrompt =
            input.systemPrompt ?? session.systemPrompt ?? undefined

          if (input.modelId && input.modelId !== session.modelId) {
            await ctx.db
              .update(aiChatSessions)
              .set({ modelId: input.modelId, updatedAt: now })
              .where(eq(aiChatSessions.id, session.id))
          }

          if (
            input.systemPrompt &&
            input.systemPrompt !== session.systemPrompt
          ) {
            await ctx.db
              .update(aiChatSessions)
              .set({ systemPrompt: input.systemPrompt, updatedAt: now })
              .where(eq(aiChatSessions.id, session.id))
          }

          const userMessageId = randomUUID()
          const userMessage = {
            id: userMessageId,
            sessionId: session.id,
            authorId: userId,
            role: 'user',
            status: 'completed',
            content: buildMessageContent(input.message),
            text: input.message,
            tokens: null,
            errorMessage: null,
            metadata: {},
            createdAt: now,
            updatedAt: now,
          }

          await ctx.db.insert(aiChatMessages).values(userMessage)
          safeNext({ type: 'user-message', messageId: userMessageId })

          const inferredTitle = session.title ?? maybeInferTitle(input.message)

          await ctx.db
            .update(aiChatSessions)
            .set({
              lastMessageAt: now,
              updatedAt: now,
              ...(session.title
                ? {}
                : { title: inferredTitle ?? session.title }),
            })
            .where(eq(aiChatSessions.id, session.id))

          session = {
            ...session,
            title: session.title ?? inferredTitle ?? null,
            lastMessageAt: now,
            updatedAt: now,
          }

          const history = await ctx.db.query.aiChatMessages.findMany({
            where: eq(aiChatMessages.sessionId, session.id),
            orderBy: [asc(aiChatMessages.createdAt)],
          })

          const assistantMessageId = randomUUID()
          const assistantPlaceholder = {
            id: assistantMessageId,
            sessionId: session.id,
            authorId: null,
            role: 'assistant',
            status: 'streaming',
            content: buildMessageContent(''),
            text: '',
            tokens: null,
            errorMessage: null,
            metadata: {},
            createdAt: now,
            updatedAt: now,
          }

          await ctx.db.insert(aiChatMessages).values(assistantPlaceholder)
          safeNext({
            type: 'assistant-start',
            messageId: assistantMessageId,
          })

          const modelMessages = toModelMessages(history)

          const callSettings = input.callSettings ?? {}

          const result = streamAiText<ToolSet>({
            model: resolvedModelId,
            messages: modelMessages,
            system: systemPrompt,
            abortSignal: abortController.signal,
            providerOptions: input.providerOptions,
            ...callSettings,
          })

          let accumulated = ''

          try {
            for await (const delta of result.textStream) {
              if (!delta || isObserverClosed) continue
              accumulated += delta
              safeNext({
                type: 'assistant-delta',
                messageId: assistantMessageId,
                delta,
              })
            }

            if (isObserverClosed) return

            const [usage, totalUsage] = await Promise.all([
              result.usage.catch(() => undefined),
              result.totalUsage.catch(() => undefined),
            ])

            await ctx.db
              .update(aiChatMessages)
              .set({
                status: 'completed',
                text: accumulated,
                content: buildMessageContent(accumulated),
                updatedAt: new Date(),
              })
              .where(eq(aiChatMessages.id, assistantMessageId))

            await ctx.db
              .update(aiChatSessions)
              .set({ lastMessageAt: new Date(), updatedAt: new Date() })
              .where(eq(aiChatSessions.id, session.id))

            safeNext({
              type: 'assistant-end',
              messageId: assistantMessageId,
              text: accumulated,
              usage,
              totalUsage,
            })
            safeComplete()
          } catch (error) {
            const descriptor = describeAiError(error)
            await ctx.db
              .update(aiChatMessages)
              .set({
                status: 'failed',
                errorMessage: descriptor.message,
                updatedAt: new Date(),
              })
              .where(eq(aiChatMessages.id, assistantMessageId))

            safeNext({
              type: 'error',
              message: descriptor.message,
              retryable: descriptor.retryable,
              category: descriptor.category,
            })
            safeError(error)
          }
        }

        run().catch(error => {
          const descriptor = describeAiError(error)
          safeNext({
            type: 'error',
            message: descriptor.message,
            retryable: descriptor.retryable,
            category: descriptor.category,
          })
          safeError(error)
        })

        return () => {
          abortController.abort()
        }
      })
    }),
})

export type AichatRouter = typeof aichatRouter
