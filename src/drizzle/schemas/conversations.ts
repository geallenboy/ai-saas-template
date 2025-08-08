import {
  boolean,
  decimal,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'
import { users } from './users'

// ===============================
// AI conversation table
// ===============================

export const conversations = pgTable(
  'conversations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: varchar('user_id', { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    title: varchar('title', { length: 200 }),
    model: varchar('model', { length: 50 }).notNull(),
    type: varchar('type', { length: 50 }).default('chat'), // chat, use_case, tutorial, blog

    // statistics
    messageCount: integer('message_count').default(0),
    totalTokens: integer('total_tokens').default(0),
    totalCost: decimal('total_cost', { precision: 10, scale: 6 }).default('0'),

    // status
    isArchived: boolean('is_archived').default(false),
    isShared: boolean('is_shared').default(false),
    lastMessageAt: timestamp('last_message_at'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => ({
    userIdIdx: index('conversations_user_id_idx').on(table.userId),
    typeIdx: index('conversations_type_idx').on(table.type),
    lastMessageIdx: index('conversations_last_message_idx').on(
      table.lastMessageAt
    ),
    archivedIdx: index('conversations_archived_idx').on(table.isArchived),
  })
)

// ===============================
// AI message table
// ===============================

export const messages = pgTable(
  'messages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    conversationId: uuid('conversation_id')
      .notNull()
      .references(() => conversations.id, { onDelete: 'cascade' }),

    role: varchar('role', { length: 20 }).notNull(), // user, assistant, system
    content: text('content').notNull(),

    // AI metadata
    tokens: integer('tokens').default(0),
    cost: decimal('cost', { precision: 10, scale: 6 }).default('0'),
    model: varchar('model', { length: 50 }),
    latency: integer('latency'), // response delay(ms)

    // evaluate
    rating: integer('rating'), // 1-5 star rating
    feedback: text('feedback'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  table => ({
    conversationIdIdx: index('messages_conversation_id_idx').on(
      table.conversationId
    ),
    roleIdx: index('messages_role_idx').on(table.role),
    createdAtIdx: index('messages_created_at_idx').on(table.createdAt),
  })
)

// ===============================
// Prompt template table
// ===============================

export const promptTemplates = pgTable(
  'prompt_templates',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: varchar('user_id', { length: 255 }).references(() => users.id, {
      onDelete: 'cascade',
    }),

    name: varchar('name', { length: 200 }).notNull(),
    nameDe: varchar('name_de', { length: 200 }),
    description: text('description'),
    descriptionDe: text('description_de'),
    category: varchar('category', { length: 50 }).notNull(),

    prompt: text('prompt').notNull(),
    promptDe: text('prompt_de'),

    // variable definition
    variables: jsonb('variables')
      .$type<
        Array<{
          name: string
          type: 'text' | 'number' | 'select'
          description: string
          required: boolean
          defaultValue?: any
          options?: string[]
        }>
      >()
      .default([]),

    // access control
    isPublic: boolean('is_public').default(false),
    isSystem: boolean('is_system').default(false),
    requiresMembership: boolean('requires_membership').default(false),

    // statistics
    useCount: integer('use_count').default(0),
    rating: decimal('rating', { precision: 3, scale: 2 }).default('0'),

    tags: jsonb('tags').$type<string[]>().default([]),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => ({
    userIdIdx: index('prompt_templates_user_id_idx').on(table.userId),
    categoryIdx: index('prompt_templates_category_idx').on(table.category),
    publicIdx: index('prompt_templates_public_idx').on(table.isPublic),
    systemIdx: index('prompt_templates_system_idx').on(table.isSystem),
  })
)

// ===============================
// Type export
// ===============================

export type Conversation = typeof conversations.$inferSelect
export type NewConversation = typeof conversations.$inferInsert

export type Message = typeof messages.$inferSelect
export type NewMessage = typeof messages.$inferInsert

export type PromptTemplate = typeof promptTemplates.$inferSelect
export type NewPromptTemplate = typeof promptTemplates.$inferInsert

// ===============================
// Enum definition
// ===============================

export enum ConversationType {
  CHAT = 'chat',
  USE_CASE = 'use_case',
  TUTORIAL = 'tutorial',
  BLOG = 'blog',
}

export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}

export enum PromptCategory {
  GENERAL = 'general',
  BUSINESS = 'business',
  CREATIVE = 'creative',
  TECHNICAL = 'technical',
  EDUCATION = 'education',
  MARKETING = 'marketing',
}

export enum VariableType {
  TEXT = 'text',
  NUMBER = 'number',
  SELECT = 'select',
}
