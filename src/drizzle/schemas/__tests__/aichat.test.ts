import { getTableColumns } from 'drizzle-orm'
import { describe, expect, it } from 'vitest'

import {
  AiAttachmentKinds,
  AiMessageRoles,
  AiMessageStatuses,
  aiChatEmbeddings,
  aiChatFileChunks,
  aiChatMessages,
  aiChatSessions,
  createAttachmentFixture,
  createEmbeddingFixture,
  createFileChunkFixture,
  createMessageFixture,
  createSessionFixture,
} from '../aichat'

describe('ai chat schema', () => {
  it('uses gpt-4o as the default model for sessions', () => {
    const columns = getTableColumns(aiChatSessions)
    expect(columns.modelId.default).toBe('openai/gpt-4o')

    const session = createSessionFixture({ userId: 'user_1' })
    expect(session.modelId).toBe('openai/gpt-4o')
  })

  it('provides sensible defaults for messages and fixtures', () => {
    const columns = getTableColumns(aiChatMessages)
    expect(columns.content.default).toBeDefined()
    expect(columns.status.default).toBe('completed')

    const message = createMessageFixture({ sessionId: 'session_1' })
    expect(message.content?.[0]).toMatchObject({ type: 'text' })
    expect(message.status).toBe('completed')
  })

  it('tracks file chunk uniqueness and metadata defaults', () => {
    const columns = getTableColumns(aiChatFileChunks)
    expect(columns.chunkIndex.notNull).toBe(true)
    expect(columns.metadata.default).toBeDefined()

    const chunk = createFileChunkFixture({ attachmentId: 'attach_1' })
    expect(chunk.chunkIndex).toBe(0)
    expect(chunk.metadata).toEqual({})
  })

  it('stores embeddings with explicit model metadata', () => {
    const columns = getTableColumns(aiChatEmbeddings)
    expect(columns.embedding.default).toBeDefined()

    const embedding = createEmbeddingFixture({ chunkId: 'chunk_1' })
    expect(embedding.modelId).toBeTruthy()
    expect(Array.isArray(embedding.embedding)).toBe(true)
  })

  it('exposes role, status, and attachment kind enumerations', () => {
    expect(AiMessageRoles).toContain('assistant')
    expect(AiMessageStatuses).toContain('completed')
    expect(AiAttachmentKinds).toContain('file')
  })

  it('builds attachment fixtures with R2 metadata', () => {
    const attachment = createAttachmentFixture({ sessionId: 'session_1' })
    expect(attachment.storageKey).toContain('uploads/')
    expect(attachment.url).toMatch(/^https?:\/\//)
  })
})
