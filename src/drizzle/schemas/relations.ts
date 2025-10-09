import { relations } from 'drizzle-orm'
import {
  aiChatAttachments,
  aiChatEmbeddings,
  aiChatFileChunks,
  aiChatMessages,
  aiChatSessions,
} from './aichat'
import { blogPosts } from './blog'
import { paymentRecords, userMemberships, userUsageLimits } from './payments'
import { apiKeys, notifications } from './system'
import { loginLogs, users } from './users'

// ===============================
// 用户关系定义
// ===============================
export const usersRelations = relations(users, ({ many }) => ({
  // 认证相关 (Better-Auth 统一管理)
  loginLogs: many(loginLogs),

  // 支付相关
  userMemberships: many(userMemberships),
  paymentRecords: many(paymentRecords),
  userUsageLimits: many(userUsageLimits),

  // 系统相关
  apiKeys: many(apiKeys),
  notifications: many(notifications),

  // AI 会话相关
  aiChatSessions: many(aiChatSessions),
  aiChatMessages: many(aiChatMessages),
  aiChatAttachments: many(aiChatAttachments),
  blogPosts: many(blogPosts),
}))

// ===============================
// 认证关系定义 (Better-Auth 统一管理)
// ===============================
export const loginLogsRelations = relations(loginLogs, ({ one }) => ({
  user: one(users, {
    fields: [loginLogs.userId],
    references: [users.id],
  }),
}))

// ===============================
// 支付关系定义
// ===============================
export const userMembershipsRelations = relations(
  userMemberships,
  ({ one }) => ({
    user: one(users, {
      fields: [userMemberships.userId],
      references: [users.id],
    }),
  })
)

export const paymentRecordsRelations = relations(paymentRecords, ({ one }) => ({
  user: one(users, {
    fields: [paymentRecords.userId],
    references: [users.id],
  }),
}))

export const userUsageLimitsRelations = relations(
  userUsageLimits,
  ({ one }) => ({
    user: one(users, {
      fields: [userUsageLimits.userId],
      references: [users.id],
    }),
  })
)

// ===============================
// 系统关系定义
// ===============================
export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  user: one(users, {
    fields: [apiKeys.userId],
    references: [users.id],
  }),
}))

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}))

// ===============================
// 博客关系定义
// ===============================

export const blogPostsRelations = relations(blogPosts, ({ one }) => ({
  author: one(users, {
    fields: [blogPosts.authorId],
    references: [users.id],
  }),
}))

// ===============================
// AI 会话关系定义
// ===============================

export const aiChatSessionsRelations = relations(
  aiChatSessions,
  ({ one, many }) => ({
    user: one(users, {
      fields: [aiChatSessions.userId],
      references: [users.id],
    }),
    messages: many(aiChatMessages),
    attachments: many(aiChatAttachments),
  })
)

export const aiChatMessagesRelations = relations(
  aiChatMessages,
  ({ one, many }) => ({
    session: one(aiChatSessions, {
      fields: [aiChatMessages.sessionId],
      references: [aiChatSessions.id],
    }),
    author: one(users, {
      fields: [aiChatMessages.authorId],
      references: [users.id],
    }),
    attachments: many(aiChatAttachments),
  })
)

export const aiChatAttachmentsRelations = relations(
  aiChatAttachments,
  ({ one, many }) => ({
    session: one(aiChatSessions, {
      fields: [aiChatAttachments.sessionId],
      references: [aiChatSessions.id],
    }),
    message: one(aiChatMessages, {
      fields: [aiChatAttachments.messageId],
      references: [aiChatMessages.id],
    }),
    user: one(users, {
      fields: [aiChatAttachments.userId],
      references: [users.id],
    }),
    chunks: many(aiChatFileChunks),
  })
)

export const aiChatFileChunksRelations = relations(
  aiChatFileChunks,
  ({ one, many }) => ({
    attachment: one(aiChatAttachments, {
      fields: [aiChatFileChunks.attachmentId],
      references: [aiChatAttachments.id],
    }),
    embeddings: many(aiChatEmbeddings),
  })
)

export const aiChatEmbeddingsRelations = relations(
  aiChatEmbeddings,
  ({ one }) => ({
    chunk: one(aiChatFileChunks, {
      fields: [aiChatEmbeddings.chunkId],
      references: [aiChatFileChunks.id],
    }),
  })
)
