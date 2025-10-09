import { sql } from 'drizzle-orm'
import {
  bigint,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'

import { users } from './users'

// ===============================
// AI 会话主表
// ===============================

export const aiChatSessions = pgTable(
  'ai_chat_sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    userId: varchar('user_id', { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    title: varchar('title', { length: 120 }),
    summary: text('summary'),
    systemPrompt: text('system_prompt'),

    modelId: varchar('model_id', { length: 100 })
      .notNull()
      .default('openai/gpt-4o'),
    locale: varchar('locale', { length: 10 }),
    visibility: varchar('visibility', { length: 20 })
      .notNull()
      .default('private'),
    mode: varchar('mode', { length: 30 }).notNull().default('chat'),

    metadata: jsonb('metadata')
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),

    lastMessageAt: timestamp('last_message_at'),
    archivedAt: timestamp('archived_at'),
    deletedAt: timestamp('deleted_at'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => ({
    userIdIdx: index('ai_chat_sessions_user_id_idx').on(table.userId),
    modelIdx: index('ai_chat_sessions_model_id_idx').on(table.modelId),
    lastMessageIdx: index('ai_chat_sessions_last_message_idx').on(
      table.lastMessageAt
    ),
    visibilityIdx: index('ai_chat_sessions_visibility_idx').on(
      table.visibility
    ),
  })
)

// ===============================
// AI 会话消息表
// ===============================

export const aiChatMessages = pgTable(
  'ai_chat_messages',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    sessionId: uuid('session_id')
      .notNull()
      .references(() => aiChatSessions.id, { onDelete: 'cascade' }),

    authorId: varchar('author_id', { length: 255 }).references(() => users.id, {
      onDelete: 'set null',
    }),

    role: varchar('role', { length: 30 }).notNull(),
    status: varchar('status', { length: 30 }).notNull().default('completed'),

    content: jsonb('content')
      .$type<AiMessageContent>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    text: text('text'),
    tokens: integer('tokens'),
    errorMessage: text('error_message'),

    metadata: jsonb('metadata')
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => ({
    sessionIdx: index('ai_chat_messages_session_id_idx').on(table.sessionId),
    authorIdx: index('ai_chat_messages_author_id_idx').on(table.authorId),
    roleIdx: index('ai_chat_messages_role_idx').on(table.role),
    createdAtIdx: index('ai_chat_messages_created_at_idx').on(table.createdAt),
  })
)

// ===============================
// AI 会话附件表
// ===============================

export const aiChatAttachments = pgTable(
  'ai_chat_attachments',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    sessionId: uuid('session_id')
      .notNull()
      .references(() => aiChatSessions.id, { onDelete: 'cascade' }),
    messageId: uuid('message_id').references(() => aiChatMessages.id, {
      onDelete: 'set null',
    }),
    userId: varchar('user_id', { length: 255 }).references(() => users.id, {
      onDelete: 'set null',
    }),

    kind: varchar('kind', { length: 30 }).notNull().default('file'),
    name: varchar('name', { length: 255 }).notNull(),
    contentType: varchar('content_type', { length: 100 }).notNull(),

    sizeBytes: bigint('size_bytes', { mode: 'number' }).notNull().default(0),
    storageKey: varchar('storage_key', { length: 512 }).notNull(),
    url: text('url').notNull(),
    previewUrl: text('preview_url'),
    checksum: varchar('checksum', { length: 128 }),

    metadata: jsonb('metadata')
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),

    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  table => ({
    sessionIdx: index('ai_chat_attachments_session_id_idx').on(table.sessionId),
    messageIdx: index('ai_chat_attachments_message_id_idx').on(table.messageId),
    userIdx: index('ai_chat_attachments_user_id_idx').on(table.userId),
    kindIdx: index('ai_chat_attachments_kind_idx').on(table.kind),
  })
)

// ===============================
// 文件分块表
// ===============================

export const aiChatFileChunks = pgTable(
  'ai_chat_file_chunks',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    attachmentId: uuid('attachment_id')
      .notNull()
      .references(() => aiChatAttachments.id, { onDelete: 'cascade' }),

    chunkIndex: integer('chunk_index').notNull(),
    content: text('content').notNull(),
    tokenCount: integer('token_count').notNull().default(0),

    metadata: jsonb('metadata')
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),

    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  table => ({
    attachmentIdx: index('ai_chat_file_chunks_attachment_id_idx').on(
      table.attachmentId
    ),
    orderIdx: uniqueIndex('ai_chat_file_chunks_order_idx').on(
      table.attachmentId,
      table.chunkIndex
    ),
  })
)

// ===============================
// 文件向量表
// ===============================

export const aiChatEmbeddings = pgTable(
  'ai_chat_embeddings',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    chunkId: uuid('chunk_id')
      .notNull()
      .references(() => aiChatFileChunks.id, { onDelete: 'cascade' }),

    modelId: varchar('model_id', { length: 100 }).notNull(),
    embedding: jsonb('embedding')
      .$type<number[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    dimensions: integer('dimensions').notNull(),

    metadata: jsonb('metadata')
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),

    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  table => ({
    chunkIdx: index('ai_chat_embeddings_chunk_id_idx').on(table.chunkId),
    modelIdx: index('ai_chat_embeddings_model_id_idx').on(table.modelId),
  })
)

// ===============================
// 类型与常量导出
// ===============================

export const AiMessageRoles = ['system', 'user', 'assistant'] as const
export type AiMessageRole = (typeof AiMessageRoles)[number]

export const AiMessageStatuses = [
  'pending',
  'streaming',
  'completed',
  'failed',
] as const
export type AiMessageStatus = (typeof AiMessageStatuses)[number]

export const AiAttachmentKinds = ['file', 'image', 'audio', 'video'] as const
export type AiAttachmentKind = (typeof AiAttachmentKinds)[number]

export type AiMessagePart =
  | {
      type: 'text'
      text: string
    }
  | {
      type: 'tool-call'
      id: string
      name: string
      args: Record<string, unknown>
    }
  | {
      type: 'tool-result'
      toolCallId: string
      result: unknown
      isError?: boolean
    }
  | {
      type: 'attachment'
      attachmentId: string
    }

export type AiMessageContent = AiMessagePart[]

export type AiChatSession = typeof aiChatSessions.$inferSelect
export type NewAiChatSession = typeof aiChatSessions.$inferInsert

export type AiChatMessage = typeof aiChatMessages.$inferSelect
export type NewAiChatMessage = typeof aiChatMessages.$inferInsert

export type AiChatAttachment = typeof aiChatAttachments.$inferSelect
export type NewAiChatAttachment = typeof aiChatAttachments.$inferInsert

export type AiChatFileChunk = typeof aiChatFileChunks.$inferSelect
export type NewAiChatFileChunk = typeof aiChatFileChunks.$inferInsert

export type AiChatEmbedding = typeof aiChatEmbeddings.$inferSelect
export type NewAiChatEmbedding = typeof aiChatEmbeddings.$inferInsert

// ===============================
// Fixture 辅助函数
// ===============================

export const createSessionFixture = (
  overrides: Partial<NewAiChatSession> = {}
): NewAiChatSession => ({
  userId: 'user_default',
  modelId: 'openai/gpt-4o',
  visibility: 'private',
  mode: 'chat',
  metadata: {},
  ...overrides,
})

export const createMessageFixture = (
  overrides: Partial<NewAiChatMessage> & { sessionId: string }
): NewAiChatMessage => {
  const { sessionId, ...rest } = overrides
  return {
    sessionId,
    role: 'user',
    status: 'completed',
    content: [{ type: 'text', text: 'Hello world' }],
    metadata: {},
    ...rest,
  }
}

export const createAttachmentFixture = (
  overrides: Partial<NewAiChatAttachment> & { sessionId: string }
): NewAiChatAttachment => {
  const { sessionId, ...rest } = overrides
  return {
    sessionId,
    kind: 'file',
    name: 'document.pdf',
    contentType: 'application/pdf',
    sizeBytes: 0,
    storageKey: 'uploads/document.pdf',
    url: 'https://example.com/document.pdf',
    metadata: {},
    ...rest,
  }
}

export const createFileChunkFixture = (
  overrides: Partial<NewAiChatFileChunk> & { attachmentId: string }
): NewAiChatFileChunk => {
  const { attachmentId, ...rest } = overrides
  return {
    attachmentId,
    chunkIndex: 0,
    content: 'Chunk content',
    tokenCount: 0,
    metadata: {},
    ...rest,
  }
}

export const createEmbeddingFixture = (
  overrides: Partial<NewAiChatEmbedding> & { chunkId: string }
): NewAiChatEmbedding => {
  const { chunkId, ...rest } = overrides
  return {
    chunkId,
    modelId: 'text-embedding-3-large',
    embedding: [],
    dimensions: 0,
    metadata: {},
    ...rest,
  }
}
